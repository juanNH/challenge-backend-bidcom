import { INestApplication, ValidationPipe } from '@nestjs/common';
import { StandardErrorFilter } from '../../shared/presentation/http/filters/standard-error.filter';

export const setupHttp = (app: INestApplication): void => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new StandardErrorFilter());
};
