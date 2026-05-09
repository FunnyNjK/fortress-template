import { describe, expect, it } from 'vitest';

import { createFortressLogger } from './index.js';

describe('@fortress/observability', () => {
  it('creates loggers with expected shape', () => {
    const log = createFortressLogger({ serviceName: 'unit' });
    expect(typeof log.info).toBe('function');
    expect(typeof log.child).toBe('function');
  });
});
