import type { ExternalUserId, PaginationInput } from '@fortress/types';

export function fixtureExternalUserId(seed: string): ExternalUserId {
  return `${seed}_fixture` as ExternalUserId;
}

export function fixturePagination(overrides: PaginationInput = {}): PaginationInput {
  const out: PaginationInput = { cursor: overrides.cursor ?? 'cursor_start' };
  const limitCandidate = overrides.limit;
  if (typeof limitCandidate === 'number') {
    return { ...out, limit: limitCandidate };
  }
  return out;
}
