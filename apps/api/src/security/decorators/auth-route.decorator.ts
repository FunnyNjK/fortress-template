import { SetMetadata } from '@nestjs/common';

import { AUTH_ROUTE_KEY } from '../constants.js';

export const AuthRoute = (): MethodDecorator => SetMetadata(AUTH_ROUTE_KEY, true);
