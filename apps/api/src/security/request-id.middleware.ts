import type { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { randomUUID } from 'node:crypto';

/** Runs first so `fortressRequestId` exists before guards/interceptors/exception handlers. */
@Injectable()
export class FortressRequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestHeaderId = req.headers['x-request-id'];
    const requestId =
      typeof requestHeaderId === 'string' && requestHeaderId.length > 0
        ? requestHeaderId
        : randomUUID();
    req.fortressRequestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
