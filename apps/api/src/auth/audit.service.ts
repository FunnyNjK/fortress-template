import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { DRIZZLE, type DrizzleDb } from '../db/drizzle.tokens.js';
import { auditEvents } from '../db/schema/audit_events.js';
import { hashIp, hashUa } from '../util/request-fingerprint.js';

@Injectable()
export class AuditService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly config: ConfigService,
  ) {}

  async log(
    params: {
      userId?: string;
      sessionId?: string;
      action: string;
      resource?: string;
      metadata?: Record<string, unknown>;
      request: Request;
    },
    dbOrTx: DrizzleDb = this.db,
  ): Promise<void> {
    const key = this.config.getOrThrow<string>('FORTRESS_REQUEST_HMAC_KEY');
    await dbOrTx.insert(auditEvents).values({
      userId: params.userId,
      sessionId: params.sessionId,
      action: params.action,
      resource: params.resource,
      metadata: params.metadata ?? {},
      ipHash: hashIp(key, params.request),
      uaHash: hashUa(key, params.request),
    });
  }
}
