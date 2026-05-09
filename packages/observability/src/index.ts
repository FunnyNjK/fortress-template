import pino from 'pino';

export type FortressLogger = pino.Logger;

export interface CreateFortressLoggerOptions {
  readonly serviceName: string;
  readonly level?: string | undefined;
}

/** Pino/nestjs-pino redaction paths (API + observability baseline). */
export function fortressPinoRedactPaths(): readonly string[] {
  return [
    'req.headers.authorization',
    'req.headers.cookie',
    '*.password',
    '*.token',
    '*.secret',
    '*.apiKey',
    '*.accessToken',
    '*.refreshToken',
  ];
}

/**
 * Baseline Pino logger with redaction paths suitable for API/web surfaces.
 * Apps should pass their own `transport` in production (e.g. Azure Monitor).
 */
export function createFortressLogger(options: CreateFortressLoggerOptions): FortressLogger {
  return pino({
    name: options.serviceName,
    level: options.level ?? 'info',
    redact: {
      paths: [...fortressPinoRedactPaths()],
      censor: '[redacted]',
    },
  });
}
