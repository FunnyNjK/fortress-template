import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Logger } from 'pino';
import type { Observable } from 'rxjs';

import { FORTRESS_PINO_LOGGER } from './request-logging.tokens.js';

/** Request journal after guards/pipes; does not run when middleware rejects (ex. 413) or guards throw before this phase (ex. 429 → {@link FortressExceptionFilter}). */
@Injectable()
export class FortressRequestLoggingInterceptor implements NestInterceptor {
  constructor(@Inject(FORTRESS_PINO_LOGGER) private readonly log: Logger) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (ctx.getType() !== 'http') {
      return next.handle();
    }
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();
    const requestId = req.fortressRequestId ?? 'missing-request-id';

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

    return next.handle();
  }
}
