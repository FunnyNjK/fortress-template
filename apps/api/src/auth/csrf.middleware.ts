import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  type CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { tap } from 'rxjs';

import { FORTRESS_CSRF_HEADER_NAME, verifyDoubleSubmit } from '@fortress/auth-core';

import {
  FORTRESS_CSRF_COOKIE_NAME,
  REQUIRE_AUTH_KEY,
  takeIssueCsrfToken,
} from './auth.constants.js';

function parseCookie(raw: string | undefined, name: string): string | undefined {
  if (!raw) {
    return undefined;
  }
  const parts = raw.split(';');
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name && rest.length > 0) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
}

/** `__Host-` prefix: Path=/, no Domain, Secure in production. */
export function issueCsrfCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === 'production';
  const segments = [
    `${FORTRESS_CSRF_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'SameSite=Strict',
  ];
  if (secure) {
    segments.push('Secure');
  }
  res.append('Set-Cookie', segments.join('; '));
}

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    if (ctx.getType() !== 'http') {
      return true;
    }
    const requireAuth = this.reflector.getAllAndOverride<boolean>(REQUIRE_AUTH_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!requireAuth) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest<Request>();
    const method = req.method.toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    if (!req.fortressAuth) {
      throw new ForbiddenException();
    }

    const cookieTok = parseCookie(req.headers.cookie, FORTRESS_CSRF_COOKIE_NAME);
    const hdrRaw = req.headers[FORTRESS_CSRF_HEADER_NAME];
    const headerTok = typeof hdrRaw === 'string' ? hdrRaw : hdrRaw?.[0];
    if (
      !cookieTok ||
      typeof headerTok !== 'string' ||
      !verifyDoubleSubmit(cookieTok, headerTok)
    ) {
      throw new ForbiddenException();
    }
    return true;
  }
}

@Injectable()
export class FortressCsrfCookieInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(() => {
        if (ctx.getType() !== 'http') {
          return;
        }
        const req = ctx.switchToHttp().getRequest<Request>();
        const res = ctx.switchToHttp().getResponse<Response>();
        const token = takeIssueCsrfToken(req);
        if (token) {
          issueCsrfCookie(res, token);
        }
      }),
    );
  }
}
