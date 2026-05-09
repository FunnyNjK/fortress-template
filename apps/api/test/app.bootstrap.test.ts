import 'reflect-metadata';

import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, it } from 'vitest';

import { AppModule } from '../src/app.module.js';

describe('API bootstrap', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('instantiates and GET / returns 404 (no controllers yet)', async () => {
    process.env.NODE_ENV = 'test';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({
      bufferLogs: true,
      logger: false,
      bodyParser: false,
    });
    await app.init();

    await request(app.getHttpServer() as Server).get('/').expect(404);
  });
});
