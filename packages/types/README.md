# `@fortress/types`

Pure TypeScript types and shared literals for cross-layer contracts. **No** runtime
dependencies, **no** domain or product business rules — only shapes that multiple
packages agree on (boundaries, pagination inputs, branded string aliases).

## Usage

```typescript
import type { ExternalUserId } from '@fortress/types';
```

## Tests

```bash
pnpm --filter @fortress/types test
```
