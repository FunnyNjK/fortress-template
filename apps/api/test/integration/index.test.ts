import 'reflect-metadata';

import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

/**
 * Aggregated Phase 2 checks: API boots through the Nest stack (`AppModule`).
 * Operational `/healthz` is exercised here; readiness and security suites live
 * alongside in this folder and run via `pnpm --filter api test:integration`.
 */
describe('Phase 2 integration manifest / API boot', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('boots with AppModule and GET /healthz returns ok (liveness ignores datastore health)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({
      bufferLogs: true,
      logger: false,
      bodyParser: false,
    });
    await app.init();

    const server = app.getHttpServer() as Server;
    const res = await request(server).get('/healthz').expect(200);
    const body = res.body as { status: unknown; uptime: unknown; version: unknown };
    expect(body).toMatchObject({ status: 'ok' });
    expect(typeof body.uptime).toBe('number');
    expect(typeof body.version).toBe('string');
    await request(server).get('/').expect(404);
  });

  it('GET /healthz is not Redis rate limited (121 requests stay 200)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({
      bufferLogs: true,
      logger: false,
      bodyParser: false,
    });
    await app.init();

    const server = app.getHttpServer() as Server;
    for (let i = 0; i < 121; i++) {
      await request(server).get('/healthz').expect(200);
    }
  }, 120_000);
});
