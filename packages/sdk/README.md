# `@fortress/sdk`

Typed HTTP contract between **`apps/web`** and **`apps/api`**. Every response that
crosses the boundary should be parsed with **Zod** here so frontends never guess the
shape of JSON payloads.

## Usage

```typescript
import { createFortressSdk } from '@fortress/sdk';

const sdk = createFortressSdk({ baseUrl: process.env.NEXT_PUBLIC_API_URL! });
const me = await sdk.fetchAuthMe();
```

## Tests

```bash
pnpm --filter @fortress/sdk test
```
