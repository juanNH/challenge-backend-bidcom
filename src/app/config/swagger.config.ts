import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (
  app: INestApplication,
  configService: ConfigService,
): void => {
  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'docs');
  const apiBaseUrl = configService.get<string>(
    'API_BASE_URL',
    'http://localhost:3000',
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription(
      'Base API aligned with Clean Architecture, TypeORM and PostgreSQL.',
    )
    .setVersion('1.0.0')
    .addServer(apiBaseUrl)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document);
};
