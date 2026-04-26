import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { CacheService } from './cache.service';

@Injectable()
export class RedisCacheService
  implements CacheService, OnModuleInit, OnModuleDestroy
{
  private readonly client: RedisClientType;
  private enabled = true;

  constructor(configService: ConfigService) {
    const host = configService.get<string>('REDIS_HOST', 'localhost');
    const port = configService.get<number>('REDIS_PORT', 6379);

    this.client = createClient({
      socket: {
        host,
        port,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    this.client.on('error', () => {
      this.enabled = false;
    });

    try {
      await this.client.connect();
      this.enabled = true;
    } catch {
      this.enabled = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client.isReady) {
      return null;
    }

    try {
      const value = await this.client.get(key);

      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.enabled || !this.client.isReady) {
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch {
      this.enabled = false;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.enabled || !this.client.isReady) {
      return;
    }

    try {
      await this.client.del(key);
    } catch {
      this.enabled = false;
    }
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    if (!this.enabled || !this.client.isReady) {
      return;
    }

    try {
      for await (const keys of this.client.scanIterator({
        MATCH: `${prefix}*`,
        COUNT: 100,
      })) {
        const batch = Array.isArray(keys) ? keys : [keys];

        if (batch.length > 0) {
          await this.client.del(batch);
        }
      }
    } catch {
      this.enabled = false;
    }
  }
}
