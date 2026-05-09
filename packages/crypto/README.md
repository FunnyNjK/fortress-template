# `@fortress/crypto`

Low-level cryptography helpers (**AES-256-GCM**, **HMAC-SHA256**, **timing-safe equality**,
and secure random helpers). Intended for encrypting payloads at rest and verifying token
fingerprints inside the API and worker tiers.

Secrets and key material must come from `.env`/Key Vault; this package performs **only**
computations.

## Usage

```typescript
import { encryptAes256Gcm } from '@fortress/crypto';

const ciphertext = encryptAes256Gcm(key, plaintext, associatedData);
```

## Tests

```bash
pnpm --filter @fortress/crypto test
```
