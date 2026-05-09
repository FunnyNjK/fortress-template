import {
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Request } from 'express';

import { DRIZZLE, type DrizzleDb } from '../db/drizzle.tokens.js';
import { users } from '../db/schema/users.js';

import { RequireAuth } from './require-auth.decorator.js';

@Controller('auth')
@RequireAuth()
export class AuthController {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  @Get('me')
  async me(
    @Req() req: Request,
  ): Promise<{ id: string; clerkUserId: string }> {
    const ctx = req.fortressAuth;
    if (!ctx) {
      throw new UnauthorizedException();
    }
    const [row] = await this.db
      .select({ id: users.id, clerkUserId: users.clerkUserId })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);
    if (!row) {
      throw new NotFoundException();
    }
    return row;
  }

  /** State-changing probe for CSRF integration tests. */
  @Post('poke')
  @HttpCode(204)
  async poke(): Promise<void> {}
}
