import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import type { Redis } from 'ioredis';

import { clientIp } from '../util/client-ip.js';
import {
  AUTH_ROUTE_KEY,
  FORTRESS_SESSION_PLACEHOLDER_HEADER,
  RATE_LIMIT_AUTH_MAX,
  RATE_LIMIT_GENERAL_MAX,
  RATE_LIMIT_WINDOW_SECONDS,
  SKIP_RATE_LIMIT_KEY,
} from './constants.js';
import { FORTRESS_REDIS } from './redis.tokens.js';

function sessionFingerprint(req: Request): string {
  const sid = req.fortressAuth?.sessionId;
  if (typeof sid === 'string' && sid.length > 0) {
    return sid;
  }
  const raw = req.headers[FORTRESS_SESSION_PLACEHOLDER_HEADER];
  if (typeof raw === 'string' && raw.length > 0) {
    return raw;
  }
  return 'anon';
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @Inject(FORTRESS_REDIS) private readonly redis: Redis,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (ctx.getType() !== 'http') {
      return true;
    }
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const skipRateLimit = this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (skipRateLimit) {
      return true;
    }

    const isAuth = this.reflector.getAllAndOverride<boolean>(AUTH_ROUTE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const max = isAuth ? RATE_LIMIT_AUTH_MAX : RATE_LIMIT_GENERAL_MAX;
    const prefix = isAuth ? 'fortress:rl:a' : 'fortress:rl:g';
    const windowSec = RATE_LIMIT_WINDOW_SECONDS;
    const ipKey = `${prefix}:ip:${clientIp(req)}`;
    const sKey = `${prefix}:s:${sessionFingerprint(req)}`;

    try {
      const ipCount = await this.redis.incr(ipKey);
      if (ipCount === 1) {
        await this.redis.expire(ipKey, windowSec);
      }
      const sCount = await this.redis.incr(sKey);
      if (sCount === 1) {
        await this.redis.expire(sKey, windowSec);
      }

      if (ipCount > max || sCount > max) {
        const ttlIp = await this.redis.ttl(ipKey);
        const ttlS = await this.redis.ttl(sKey);
        const retry = Math.max(ttlIp > 0 ? ttlIp : 0, ttlS > 0 ? ttlS : 0, windowSec);
        res.setHeader('Retry-After', String(retry));
        throw new HttpException('Too many requests', 429);
      }
      return true;
    } catch (e) {
      if (e instanceof HttpException && e.getStatus() === 429) {
        throw e;
      }
      // Fail open if Redis is unavailable — availability over strict rate enforcement.
      return true;
    }
  }
}
