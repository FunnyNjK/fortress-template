import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { z } from 'zod';

import { AllowLargeBody } from './decorators/allow-large-body.decorator.js';
import { AuthRoute } from './decorators/auth-route.decorator.js';

/** DTO shell: `static schema` is read by {@link ZodValidationPipe}; only schema is validated at runtime. */
export class SecurityEchoBodyDto {
  static readonly schema = z.object({ message: z.string() });
  message!: string;
}

/**
 * Non-production routes exercising the inbound security chain (P2-T4).
 * Registered only when `NODE_ENV !== 'production'`.
 */
@Controller('__security_chain__')
export class SecurityChainTestController {
  @Get('rate-general')
  rateGeneral(): Record<string, boolean> {
    return { ok: true };
  }

  @Get('rate-auth')
  @AuthRoute()
  rateAuth(): Record<string, boolean> {
    return { ok: true };
  }

  @Post('echo')
  @HttpCode(HttpStatus.OK)
  echo(@Body() body: SecurityEchoBodyDto): Record<string, string | number> {
    return { ok: 'echo', len: body.message.length };
  }

  @Post('auth-echo')
  @AuthRoute()
  @HttpCode(HttpStatus.OK)
  authEcho(@Body() body: SecurityEchoBodyDto): Record<string, string | number> {
    return { ok: 'auth-echo', len: body.message.length };
  }

  @Post('large')
  @AllowLargeBody(512_000)
  @HttpCode(HttpStatus.OK)
  large(@Body() body: SecurityEchoBodyDto): Record<string, boolean | number> {
    return { ok: true, len: body.message.length };
  }

  @Get('boom')
  boom(): never {
    throw new Error('boom');
  }
}
