# `@fortress/auth-core`

Shared authentication plumbing for the API tier: opaque token helpers,
double-submit CSRF comparison, and canonical cookie/header identifiers that
applications wire into Clerk-aware flows.

Business policies (sessions in Postgres, JWKS lookups, revocation) belong in **`apps/api`**.

## Usage

```typescript
import {
  verifyDoubleSubmit,
  FORTRESS_CSRF_HEADER_NAME,
} from '@fortress/auth-core';
```
