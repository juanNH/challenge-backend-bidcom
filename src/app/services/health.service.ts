import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type HealthStatus = {
  name: string;
  status: 'ok';
  environment: string;
  docsPath: string;
};

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getStatus(): HealthStatus {
    const swaggerPath = this.configService.get<string>('SWAGGER_PATH', 'docs');

    return {
      name: 'challenge-backend-bidcom',
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      docsPath: `/${swaggerPath}`,
    };
  }
}
