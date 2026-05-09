/**
 * Vitest runs before importing app modules. Match `EnvConfigModule` path order so
 * `DATABASE_URL` / `REDIS_URL` come from `.env` when present (see `config.module.ts`).
 */
import fs from 'node:fs';
import path from 'node:path';

function applyEnvFileKey(file: string, key: string): void {
  if (process.env[key]) {
    return;
  }
  if (!fs.existsSync(file)) {
    return;
  }
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const k = trimmed.slice(0, eq).trim();
    if (k !== key) {
      continue;
    }
    let v = trimmed.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[key] = v;
    return;
  }
}

const cwd = process.cwd();
const apiEnv = path.join(cwd, '.env');
const rootEnv = path.join(cwd, '..', '..', '.env');

for (const key of ['DATABASE_URL', 'REDIS_URL', 'FORTRESS_REQUEST_HMAC_KEY'] as const) {
  applyEnvFileKey(apiEnv, key);
  applyEnvFileKey(rootEnv, key);
}

process.env.DATABASE_URL ??= 'postgresql://fortress:test@127.0.0.1:5432/fortress';
/** Default when no `.env` (e.g. CI sets `REDIS_URL` explicitly). */
process.env.REDIS_URL ??= 'redis://127.0.0.1:6379/0';
/** Test default; local `.env` may override. */
process.env.FORTRESS_REQUEST_HMAC_KEY ??= 'unit-test-fortress-request-hmac-key-32c';
process.env.ALLOW_DEV_AUTH ??= 'true';
