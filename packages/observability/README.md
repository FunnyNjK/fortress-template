# `@fortress/observability`

Shared **Pino** defaults (redaction paths, service naming) so every Fortress process
ships structured logs with the same safety baseline. Tracing and metrics wiring will
land alongside future OpenTelemetry integration in the API and worker apps.

## Usage

```typescript
import { createFortressLogger } from '@fortress/observability';

const log = createFortressLogger({ serviceName: '@fortress/api' });
log.info({ requestId }, 'request completed');
```
