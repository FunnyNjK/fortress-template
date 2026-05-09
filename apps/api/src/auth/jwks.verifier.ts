import type { Request } from 'express';

export interface FortressJwtClaims {
  readonly sub: string;
  readonly iss: string;
  readonly exp: number;
  readonly iat: number;
}

/**
 * Validates an access token and returns normalized claims (Phase 3: Clerk JWKS).
 */
export interface JwksVerifier {
  verify(request: Request, bearerToken: string): Promise<FortressJwtClaims>;
}

/** Phase 3 — production JWKS fetch + verify not wired in the template chassis. */
export class UnsupportedProductionJwksVerifier implements JwksVerifier {
  verify(): Promise<FortressJwtClaims> {
    return Promise.reject(
      new Error('Clerk JWKS verification is not wired (Phase 3).'),
    );
  }
}
