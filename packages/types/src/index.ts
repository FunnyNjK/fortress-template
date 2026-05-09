/** Branded external identity strings (Clerk user id, etc.). */
declare const fortressExternalId: unique symbol;
export type ExternalUserId = string & { readonly [fortressExternalId]: typeof fortressExternalId };

/** Opaque bearer or CSRF token representations (never log raw values in production). */
declare const fortressOpaque: unique symbol;
export type OpaqueToken = string & { readonly [fortressOpaque]: typeof fortressOpaque };

/** Monotonic API contract version for `@fortress/sdk` consumers. */
export const FORTRESS_API_VERSION = '0' as const;

export interface PaginationInput {
  readonly cursor?: string | undefined;
  readonly limit?: number | undefined;
}
