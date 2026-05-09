import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { DevJwksStubVerifier } from './auth/jwks.dev-stub.js';
import { JWKS_VERIFIER } from './auth/jwks.tokens.js';
import type { JwksVerifier } from './auth/jwks.verifier.js';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('NODE_ENV');
  const port = Number(config.get('PORT'));

  if (nodeEnv === 'production') {
    const verifier = app.get<JwksVerifier>(JWKS_VERIFIER);
    const verifierName = verifier.constructor.name;
    app.get(Logger).log(`JWKS verifier: ${verifierName}`);
    if (verifier instanceof DevJwksStubVerifier) {
      throw new Error(
        'Refusing to boot: DevJwksStubVerifier is not permitted when NODE_ENV=production',
      );
    }
  }

  await app.listen(port);
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console -- fatal bootstrap failures before Nest logger exists
  console.error(err);
  process.exitCode = 1;
});
