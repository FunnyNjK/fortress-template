import { Module } from '@nestjs/common';

import { SecurityModule } from '../security/security.module.js';

import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

@Module({
  imports: [SecurityModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
