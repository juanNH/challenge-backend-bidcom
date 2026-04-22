import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AppStatus = {
  name: string;
  status: 'ok';
  environment: string;
  docsPath: string;
};

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getStatus(): AppStatus {
    const swaggerPath = this.configService.get<string>('SWAGGER_PATH', 'docs');

    return {
      name: 'challenge-backend-bidcom',
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      docsPath: `/${swaggerPath}`,
    };
  }
}
