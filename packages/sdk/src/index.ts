import { z } from 'zod';

export const AuthMeResponseSchema = z.strictObject({
  id: z.uuid(),
  clerkUserId: z.string(),
});

export type AuthMeResponse = z.output<typeof AuthMeResponseSchema>;

export interface SdkConfig {
  readonly baseUrl: string;
  readonly fetch?: typeof fetch | undefined;
}

/** Normalizes the Fortress API base URL (scheme + authority, trims trailing slashes). */
export function normalizeBaseUrl(raw: string): URL {
  return new URL(raw.endsWith('/') ? raw.slice(0, -1) : raw);
}

export interface FortressSdk {
  fetchAuthMe(init?: RequestInit): Promise<AuthMeResponse>;
}

/**
 * Typed boundary for `@fortress/web` — parses `/auth/me` responses with Zod so invalid
 * payloads fail fast inside the SDK instead of drifting through UI code.
 */
export function createFortressSdk(config: SdkConfig): FortressSdk {
  const fetchImpl = config.fetch ?? globalThis.fetch.bind(globalThis);
  const base = normalizeBaseUrl(config.baseUrl);

  return {
    async fetchAuthMe(init?: RequestInit): Promise<AuthMeResponse> {
      const url = new URL('/auth/me', base);

      const merged: RequestInit = {
        method: init?.method ?? 'GET',
        credentials: init?.credentials ?? 'include',
      };

      if (typeof init?.headers !== 'undefined') {
        merged.headers = init.headers;
      }

      if (typeof init?.signal !== 'undefined') {
        merged.signal = init.signal;
      }

      const res = await fetchImpl(url.toString(), merged);

      if (!res.ok) {
        throw new Error(`Fortress SDK: /auth/me failed with HTTP ${String(res.status)}`);
      }

      const jsonUnknown: unknown = await res.json();

      return AuthMeResponseSchema.parse(jsonUnknown);
    },
  };
}
