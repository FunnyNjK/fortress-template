import type { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { json, type NextFunction, type Request, type RequestHandler, type Response } from 'express';

import { BodyLimitRegistry } from './body-limit.registry.js';

@Injectable()
export class DynamicJsonBodyMiddleware implements NestMiddleware {
  private readonly handlers = new Map<number, RequestHandler>();

  constructor(private readonly registry: BodyLimitRegistry) {}

  private handlerFor(limitBytes: number): RequestHandler {
    let h = this.handlers.get(limitBytes);
    if (!h) {
      h = json({ limit: limitBytes });
      this.handlers.set(limitBytes, h);
    }
    return h;
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const pathKey = (req.originalUrl || req.path).split('?')[0] || req.path;
    const limit = this.registry.getLimitFor(req.method, pathKey);
    this.handlerFor(limit)(req, res, next);
  }
}
