import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { StandardErrorDto } from './../src/shared/presentation/http/dto/standard-error.dto';
import { AppModule } from './../src/app.module';
import { setupHttp } from './../src/app/config/http.config';

describe('Rate limit (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ bodyParser: false });
    setupHttp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 429 when an origin exceeds the configured request limit', async () => {
    for (let index = 0; index < 10; index += 1) {
      await request(app.getHttpServer()).get('/products').expect(200);
    }

    await request(app.getHttpServer())
      .get('/products')
      .expect(429)
      .expect((response) => {
        const body = response.body as StandardErrorDto;

        expect(response.headers['x-trace-id']).toEqual(expect.any(String));
        expect(body.code).toBe('A0429');
        expect(body.traceId).toEqual(expect.any(String));
      });
  });

  it('does not rate limit health checks', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
    await request(app.getHttpServer()).get('/health').expect(200);
  });
});
