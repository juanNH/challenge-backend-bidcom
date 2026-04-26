import { INestApplication, ValidationPipe } from '@nestjs/common';
import { json, Request, urlencoded } from 'express';
import { StandardErrorFilter } from '../../shared/presentation/http/filters/standard-error.filter';

export type RequestWithRawBody = Request & {
  rawBody?: string;
};

export const setupHttp = (app: INestApplication): void => {
  app.use(
    json({
      verify: (request, _response, buffer) => {
        (request as RequestWithRawBody).rawBody = buffer.toString('utf8');
      },
    }),
  );
  app.use(
    urlencoded({
      extended: true,
      verify: (request, _response, buffer) => {
        (request as RequestWithRawBody).rawBody = buffer.toString('utf8');
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(app.get(StandardErrorFilter));
};
