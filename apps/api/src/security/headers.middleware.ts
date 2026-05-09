import type { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  hsts: {
    maxAge: 31_536_000,
    includeSubDomains: true,
    preload: true,
  },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/** Locked-down Permissions-Policy (Helmet 8 `helmet()` bundle omits this middleware). */
const PERMISSIONS_POLICY =
  'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    helmetMiddleware(req, res, () => {
      res.setHeader('Permissions-Policy', PERMISSIONS_POLICY);
      next();
    });
  }
}
