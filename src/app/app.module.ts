import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { environmentValidationSchema } from './config/environment.validation';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { DatabaseModule } from '../shared/infrastructure/database/database.module';
import { ProductsModule } from '../modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: environmentValidationSchema,
    }),
    DatabaseModule,
    ProductsModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
