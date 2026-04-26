import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule } from '@nestjs/throttler';
import { environmentValidationSchema } from './config/environment.validation';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { DatabaseModule } from '../shared/infrastructure/database/database.module';
import { ProductsModule } from '../modules/products/products.module';
import { TraceModule } from '../shared/infrastructure/trace/trace.module';
import { StandardErrorFilter } from '../shared/presentation/http/filters/standard-error.filter';
import { RateLimitGuard } from '../shared/presentation/http/guards/rate-limit.guard';
import { RequestLoggingInterceptor } from '../shared/presentation/http/interceptors/request-logging.interceptor';
import { TraceContextInterceptor } from '../shared/presentation/http/interceptors/trace-context.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: environmentValidationSchema,
    }),
    TraceModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL_MS', 60_000),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const configuredLogLevel = configService.get<string>(
          'LOG_LEVEL',
          'info',
        );
        const logPretty = configService.get<boolean>(
          'LOG_PRETTY',
          nodeEnv !== 'production',
        );

        return {
          pinoHttp: {
            level:
              nodeEnv === 'test' && !process.env.LOG_LEVEL
                ? 'silent'
                : configuredLogLevel,
            genReqId: (request) => {
              const traceId = request.headers['x-trace-id'];

              return typeof traceId === 'string' && traceId.trim().length > 0
                ? traceId
                : randomUUID();
            },
            customProps: (request) => ({
              traceId: request.id,
            }),
            transport: logPretty
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
          },
        };
      },
    }),
    DatabaseModule,
    ProductsModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    StandardErrorFilter,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule {}
