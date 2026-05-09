import { SetMetadata } from '@nestjs/common';

import { ALLOW_LARGE_BODY_KEY } from '../constants.js';

export const AllowLargeBody = (maxBytes: number): MethodDecorator =>
  SetMetadata(ALLOW_LARGE_BODY_KEY, maxBytes);
