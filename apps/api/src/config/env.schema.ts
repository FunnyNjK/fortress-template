import { z } from 'zod';

const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);

const postgresUrlSchema = z
  .string()
  .min(1)
  .refine(
    (v) => /^postgres(ql)?:\/\//i.test(v),
    { message: 'DATABASE_URL must be a postgres:// or postgresql:// connection string' },
  );

const redisUrlSchema = z
  .string()
  .min(1)
  .refine((v) => /^redis:\/\//i.test(v), {
    message: 'REDIS_URL must be a redis:// connection string',
  });

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  LOG_LEVEL: logLevelSchema.default('info'),
  DATABASE_URL: postgresUrlSchema,
  REDIS_URL: redisUrlSchema,
});

export type AppEnvConfig = z.infer<typeof envSchema>;

/**
 * Reject committed `.env.example` placeholder tokens (`replace-with-*`)
 * when NODE_ENV === `production`.
 */
export function assertNoPlaceholderSecretsInProduction(
  nodeEnv: string,
  environ: typeof process.env = process.env,
): void {
  if (nodeEnv !== 'production') {
    return;
  }
  for (const v of Object.values(environ)) {
    if (typeof v === 'string' && v.startsWith('replace-with-')) {
      throw new Error(
        'Environment validation failed: values starting with "replace-with-" are not permitted when NODE_ENV=production',
      );
    }
  }
}

export function validateEnv(config: Record<string, unknown>): AppEnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join('; ');
    throw new Error(`Environment validation failed: ${msg}`);
  }
  assertNoPlaceholderSecretsInProduction(parsed.data.NODE_ENV);
  return parsed.data;
}
