import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { FORTRESS_API_VERSION } from '@fortress/types';
import type { Response } from 'express';

import { Public } from '../auth/public.decorator.js';
import { SkipRateLimit } from '../security/decorators/skip-rate-limit.decorator.js';

import { HealthService } from './health.service.js';

@Controller()
@Public()
@SkipRateLimit()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('healthz')
  live(): { status: 'ok'; uptime: number; version: string } {
    return { status: 'ok', uptime: process.uptime(), version: FORTRESS_API_VERSION };
  }

  @Get('readyz')
  async ready(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ status: 'ready' | 'unavailable'; checks: Awaited<ReturnType<HealthService['readinessChecks']>> }> {
    const checks = await this.health.readinessChecks();
    const ok = checks.postgres.ok && checks.redis.ok;
    res.status(ok ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return ok ? { status: 'ready', checks } : { status: 'unavailable', checks };
  }
}
