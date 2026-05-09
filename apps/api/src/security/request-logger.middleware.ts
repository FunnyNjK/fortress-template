import type { NestMiddleware } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';

import { randomUUID } from 'node:crypto';

export const FORTRESS_PINO_LOGGER = Symbol('FORTRESS_PINO_LOGGER');

/** Safe request logging: path/method/status/duration/requestId only — never body or sensitive headers. */
@Injectable()
export class FortressRequestLoggerMiddleware implements NestMiddleware {
  constructor(@Inject(FORTRESS_PINO_LOGGER) private readonly log: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestHeaderId = req.headers['x-request-id'];
    const requestId =
      typeof requestHeaderId === 'string' && requestHeaderId.length > 0
        ? requestHeaderId
        : randomUUID();
    (req as Request & { fortressRequestId: string }).fortressRequestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = performance.now();
    res.on('finish', () => {
      const durationMs = Math.round(performance.now() - start);
      this.log.info({
        requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs,
      });
    });
    next();
  }
}
