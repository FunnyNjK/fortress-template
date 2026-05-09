/** Placeholder session header until P2-T5 binds real session ids (see TASKS.md P2-T4). */
export const FORTRESS_SESSION_PLACEHOLDER_HEADER = 'x-fortress-session-id' as const;

export const DEFAULT_JSON_BODY_LIMIT_BYTES = 262_144;

export const RATE_LIMIT_WINDOW_SECONDS = 60;

/** General routes: max requests per window per IP bucket and per session bucket. */
export const RATE_LIMIT_GENERAL_MAX = 120;

/** @AuthRoute() routes: stricter limit per bucket. */
export const RATE_LIMIT_AUTH_MAX = 20;

export const ALLOW_LARGE_BODY_KEY = 'fortress:allowLargeBody';

export const AUTH_ROUTE_KEY = 'fortress:authRoute';

/** When set on a route/controller, RateLimitGuard is bypassed for that handler. */
export const SKIP_RATE_LIMIT_KEY = 'fortress:skipRateLimit';
