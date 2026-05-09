import type { Request } from 'express';

/** CSRF double-submit cookie (see TASKS P2-T5). */
export const FORTRESS_CSRF_COOKIE_NAME = '__Host-fortress-csrf' as const;

export const REQUIRE_AUTH_KEY = 'fortress:requireAuth' as const;

export const IS_PUBLIC_KEY = 'fortress:isPublic' as const;

/** Attach CSRF Set-Cookie on this response (set by AuthenticatedGuard on new sessions). */
export function attachIssueCsrf(
  req: Request,
  token: string,
): void {
  const rec = req as Request & { fortressIssueCsrfToken?: string };
  rec.fortressIssueCsrfToken = token;
}

export function takeIssueCsrfToken(req: Request): string | undefined {
  const rec = req as Request & { fortressIssueCsrfToken?: string };
  const t = rec.fortressIssueCsrfToken;
  delete rec.fortressIssueCsrfToken;
  return t;
}
