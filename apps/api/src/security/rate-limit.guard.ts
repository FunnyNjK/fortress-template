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

import {
  AUTH_ROUTE_KEY,
  FORTRESS_SESSION_PLACEHOLDER_HEADER,
  RATE_LIMIT_AUTH_MAX,
  RATE_LIMIT_GENERAL_MAX,
  RATE_LIMIT_WINDOW_SECONDS,
} from './constants.js';
import { FORTRESS_REDIS } from './redis.tokens.js';

function clientIp(req: Request): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0]?.trim() ?? 'unknown';
  }
  if (Array.isArray(xff)) {
    const first = xff[0];
    if (typeof first === 'string') {
      return first.split(',')[0]?.trim() ?? 'unknown';
    }
  }
  return req.socket.remoteAddress ?? req.ip ?? 'unknown';
}

function sessionFingerprint(req: Request): string {
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
