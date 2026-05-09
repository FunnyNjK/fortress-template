import path from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './env.schema.js';

function candidateEnvPaths(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, '.env'),
    path.join(cwd, '..', '..', '.env'),
  ];
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: candidateEnvPaths(),
      validate: validateEnv,
    }),
  ],
  exports: [ConfigModule],
})
export class EnvConfigModule {}
