import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Logger as PinoLogger } from 'pino';

import { FORTRESS_PINO_LOGGER } from './request-logging.tokens.js';

function httpStatusFromBodyParser(err: unknown): number | undefined {
  if (err && typeof err === 'object') {
    const rec = err as Record<string, unknown>;
    if ('statusCode' in rec && typeof rec.statusCode === 'number') {
      return rec.statusCode;
    }
    if ('status' in rec && typeof rec.status === 'number') {
      return rec.status;
    }
  }
  return undefined;
}

@Catch()
@Injectable()
export class FortressExceptionFilter implements ExceptionFilter {
  private readonly nestLog = new Logger(FortressExceptionFilter.name);

  constructor(@Inject(FORTRESS_PINO_LOGGER) private readonly accessLog: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = HTTP_MODE(host);
    if (!ctx) {
      return;
    }
    const res = ctx.res;
    const req = ctx.req;
    const requestId = req.fortressRequestId;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === 429) {
        this.accessLog.warn(
          {
            requestId,
            method: req.method,
            path: req.path,
            status,
            event: 'rate_limited',
          },
          'Too many requests',
        );
        res.status(429).json({ code: 'RATE_LIMITED', message: 'Too many requests' });
        return;
      }
      if (status === 400) {
        res.status(400).json({ code: 'BAD_REQUEST', message: 'Invalid request' });
        return;
      }
      res.status(status).json({ code: 'HTTP_ERROR', message: 'Request failed' });
      return;
    }

    const inferred = httpStatusFromBodyParser(exception);
    if (inferred === 413) {
      res.status(413).json({ code: 'PAYLOAD_TOO_LARGE', message: 'Payload too large' });
      return;
    }
    if (exception instanceof SyntaxError || inferred === 400) {
      res.status(400).json({ code: 'BAD_REQUEST', message: 'Invalid request' });
      return;
    }

    if (exception instanceof Error) {
      this.nestLog.error(exception.stack ?? exception.message);
    } else {
      this.nestLog.error(String(exception));
    }

    const body: Record<string, unknown> = {
      code: 'INTERNAL_ERROR',
      message: 'An error occurred',
    };
    if (process.env.NODE_ENV !== 'production' && requestId) {
      body.requestId = requestId;
    }
    res.status(500).json(body);
  }
}

type HttpContext = { res: Response; req: Request & { fortressRequestId?: string } };

function HTTP_MODE(host: ArgumentsHost): HttpContext | undefined {
  if (host.getType() !== 'http') {
    return undefined;
  }
  const res = host.switchToHttp().getResponse<Response>();
  const req = host.switchToHttp().getRequest<Request & { fortressRequestId?: string }>();
  return { res, req };
}
