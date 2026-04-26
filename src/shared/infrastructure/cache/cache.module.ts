import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { NoopCacheService } from './noop-cache.service';
import { RedisCacheService } from './redis-cache.service';

@Module({
  providers: [
    {
      provide: CacheService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): CacheService => {
        const cacheEnabled = configService.get<boolean>('CACHE_ENABLED', false);
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');

        if (!cacheEnabled || nodeEnv === 'test') {
          return new NoopCacheService();
        }

        return new RedisCacheService(configService);
      },
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
