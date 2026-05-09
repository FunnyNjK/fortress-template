import { Injectable, OnApplicationBootstrap, RequestMethod } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { ALLOW_LARGE_BODY_KEY, DEFAULT_JSON_BODY_LIMIT_BYTES } from './constants.js';

/** Nest route metadata keys (same values as `@nestjs/common/constants`). */
const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';

type ControllerWrapper = {
  metatype?: abstract new (...args: unknown[]) => object;
};

function joinHttpPath(controllerPath: string, handlerPath: string): string {
  const c =
    !controllerPath || controllerPath === '/'
      ? ''
      : controllerPath.startsWith('/')
        ? controllerPath
        : `/${controllerPath}`;
  const h =
    !handlerPath || handlerPath === '/'
      ? ''
      : handlerPath.startsWith('/')
        ? handlerPath
        : `/${handlerPath}`;
  const joined = `${c}${h}`.replace(/\/{2,}/g, '/') || '/';
  return joined;
}

function methodVerb(method: RequestMethod | undefined): string {
  if (method === undefined) {
    return 'GET';
  }
  const byEnum: Partial<Record<RequestMethod, string>> = {
    [RequestMethod.GET]: 'GET',
    [RequestMethod.POST]: 'POST',
    [RequestMethod.PUT]: 'PUT',
    [RequestMethod.DELETE]: 'DELETE',
    [RequestMethod.PATCH]: 'PATCH',
    [RequestMethod.OPTIONS]: 'OPTIONS',
    [RequestMethod.HEAD]: 'HEAD',
  };
  return byEnum[method] ?? 'GET';
}

function flattenPath(p: string | string[] | undefined): string {
  if (p === undefined) {
    return '';
  }
  if (Array.isArray(p)) {
    return p[0] ?? '';
  }
  return p;
}

@Injectable()
export class BodyLimitRegistry implements OnApplicationBootstrap {
  /** Key: `METHOD /path` → max JSON body size in bytes */
  private readonly routeLimits = new Map<string, number>();

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onApplicationBootstrap(): void {
    const controllers = this.discovery.getControllers() as ControllerWrapper[];
    for (const w of controllers) {
      const metatype = w.metatype as (abstract new (...args: unknown[]) => object) | undefined;
      if (!metatype) {
        continue;
      }
      const base = flattenPath(this.reflector.get<string | string[]>(PATH_METADATA, metatype));
      const prototype = metatype.prototype as object;
      for (const methodName of this.metadataScanner.getAllMethodNames(prototype)) {
        if (methodName === 'constructor') {
          continue;
        }
        const candidate: unknown = Object.getOwnPropertyDescriptor(prototype, methodName)?.value;
        if (typeof candidate !== 'function') {
          continue;
        }
        const handlerFn = candidate as (...args: unknown[]) => unknown;
        const reqMethod = this.reflector.get<RequestMethod | undefined>(
          METHOD_METADATA,
          handlerFn,
        );
        if (reqMethod === undefined) {
          continue;
        }
        const sub = flattenPath(
          this.reflector.get<string | string[] | undefined>(PATH_METADATA, handlerFn),
        );
        const fullPath = joinHttpPath(base, sub);
        const verb = methodVerb(reqMethod);
        const routeKey = `${verb} ${fullPath}`;
        const allowLarge = this.reflector.get<number | undefined>(
          ALLOW_LARGE_BODY_KEY,
          handlerFn,
        );
        const limit = allowLarge ?? DEFAULT_JSON_BODY_LIMIT_BYTES;
        this.routeLimits.set(routeKey, limit);
      }
    }
  }

  /** Effective JSON body limit for this HTTP method + URL path (e.g. Express `req.originalUrl` pathname). */
  getLimitFor(method: string, path: string): number {
    const key = `${method.toUpperCase()} ${path}`;
    return this.routeLimits.get(key) ?? DEFAULT_JSON_BODY_LIMIT_BYTES;
  }
}
