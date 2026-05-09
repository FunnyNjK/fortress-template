import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT'));

  await app.listen(port);
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console -- fatal bootstrap failures before Nest logger exists
  console.error(err);
  process.exitCode = 1;
});
