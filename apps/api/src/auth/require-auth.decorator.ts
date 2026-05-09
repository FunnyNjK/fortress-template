import { SetMetadata } from '@nestjs/common';

import { REQUIRE_AUTH_KEY } from './auth.constants.js';

export function RequireAuth(): MethodDecorator & ClassDecorator {
  return SetMetadata(REQUIRE_AUTH_KEY, true);
}
