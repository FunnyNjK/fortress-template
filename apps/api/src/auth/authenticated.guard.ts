import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { newOpaqueToken } from '@fortress/auth-core';
import type { Request } from 'express';

import { attachIssueCsrf, IS_PUBLIC_KEY, REQUIRE_AUTH_KEY } from './auth.constants.js';
import { JWKS_VERIFIER } from './jwks.tokens.js';

import type { JwksVerifier } from './jwks.verifier.js';
import { SessionService } from './session.service.js';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JWKS_VERIFIER) private readonly verifier: JwksVerifier,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (ctx.getType() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
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
    const auth = req.headers.authorization;
    if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const bearer = auth.slice('Bearer '.length).trim();
    if (bearer.length === 0) {
      throw new UnauthorizedException();
    }

    try {
      const claims = await this.verifier.verify(req, bearer);
      const res = await this.sessions.upsert(claims, req);
      req.fortressAuth = { userId: res.userId, sessionId: res.sessionId };
      if (res.isNewSession) {
        attachIssueCsrf(req, newOpaqueToken());
      }
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
