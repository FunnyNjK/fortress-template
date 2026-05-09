/**
 * Vitest runs before importing app modules. Config validation requires DATABASE_URL.
 * CI sets DATABASE_URL explicitly (see `.github/workflows/ci.yml`).
 */
process.env.DATABASE_URL ??= 'postgresql://fortress:test@127.0.0.1:5432/fortress';
