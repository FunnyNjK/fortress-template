import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_KEY } from './auth.constants.js';

export function Public(): MethodDecorator & ClassDecorator {
  return SetMetadata(IS_PUBLIC_KEY, true);
}
