import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiOkResponse({
    schema: {
      example: {
        name: 'challenge-backend-bidcom',
        status: 'ok',
        environment: 'development',
        docsPath: '/docs',
      },
    },
  })
  getStatus() {
    return this.healthService.getStatus();
  }
}
