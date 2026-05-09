import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, sql } from 'drizzle-orm';
import type { Request } from 'express';
import type { Redis } from 'ioredis';

import { DRIZZLE, type DrizzleDb } from '../db/drizzle.tokens.js';
import { sessions } from '../db/schema/sessions.js';
import { users } from '../db/schema/users.js';
import { FORTRESS_REDIS } from '../security/redis.tokens.js';
import {
  hashIp,
  hashSessionToken,
  hashUa,
} from '../util/request-fingerprint.js';

import { AuditService } from './audit.service.js';

import type { FortressJwtClaims } from './jwks.verifier.js';

export interface SessionUpsertResult {
  sessionId: string;
  userId: string;
  isNewSession: boolean;
}

const STEPPED_UP_TTL_SECONDS = 86_400;

@Injectable()
export class SessionService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(FORTRESS_REDIS) private readonly redis: Redis,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  private steppedUpCacheKey(sessionId: string): string {
    return `fortress:session:stepped_up:${sessionId}`;
  }

  /** Write-through cache for `sessions.stepped_up_at` (Postgres is source of truth). */
  async syncSteppedUpCache(sessionId: string, steppedUpAt: Date | null): Promise<void> {
    const key = this.steppedUpCacheKey(sessionId);
    const v = steppedUpAt?.toISOString() ?? '';
    await this.redis.set(key, v, 'EX', STEPPED_UP_TTL_SECONDS);
  }

  async upsert(claims: FortressJwtClaims, request: Request): Promise<SessionUpsertResult> {
    const auth = request.headers.authorization;
    if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      throw new Error('Missing Bearer token');
    }
    const bearerToken = auth.slice('Bearer '.length).trim();
    if (bearerToken.length === 0) {
      throw new Error('Empty Bearer token');
    }

    const hmacKey = this.config.getOrThrow<string>('FORTRESS_REQUEST_HMAC_KEY');
    const hashedSessionToken = hashSessionToken(hmacKey, bearerToken);
    const hashedIp = hashIp(hmacKey, request);
    const hashedUa = hashUa(hmacKey, request);
    const clerkUserId = claims.sub;

    const result = await this.db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(abs(hashtext(${hashedSessionToken}::text)))`);

      const [existing] = await tx
        .select()
        .from(sessions)
        .where(eq(sessions.hashedSessionToken, hashedSessionToken))
        .for('update');

      const now = new Date();

      if (existing) {
        await tx
          .update(sessions)
          .set({
            lastSeenAt: now,
            hashedIp,
            hashedUa,
            updatedAt: now,
          })
          .where(eq(sessions.id, existing.id));

        return {
          sessionId: existing.id,
          userId: existing.userId,
          isNewSession: false,
          steppedUpAt: existing.steppedUpAt,
        };
      }

      const userId = await this.ensureUserInTx(tx, clerkUserId);
      const [created] = await tx
        .insert(sessions)
        .values({
          userId,
          hashedSessionToken,
          lastSeenAt: now,
          hashedIp,
          hashedUa,
        })
        .returning({ id: sessions.id });

      if (!created) {
        throw new Error('Session insert failed');
      }

      await this.audit.log(
        {
          userId,
          sessionId: created.id,
          action: 'auth.session.created',
          request,
        },
        tx,
      );

      return {
        sessionId: created.id,
        userId,
        isNewSession: true,
        steppedUpAt: null as Date | null,
      };
    });

    await this.syncSteppedUpCache(result.sessionId, result.steppedUpAt);

    return {
      sessionId: result.sessionId,
      userId: result.userId,
      isNewSession: result.isNewSession,
    };
  }

  private async ensureUserInTx(tx: DrizzleDb, clerkUserId: string): Promise<string> {
    const [found] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);
    if (found) {
      return found.id;
    }
    const [inserted] = await tx
      .insert(users)
      .values({ clerkUserId })
      .returning({ id: users.id });
    if (!inserted) {
      throw new Error('User insert failed');
    }
    return inserted.id;
  }
}
