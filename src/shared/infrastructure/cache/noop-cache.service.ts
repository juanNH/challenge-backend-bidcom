import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';

@Injectable()
export class NoopCacheService implements CacheService {
  get<T>(): Promise<T | null> {
    return Promise.resolve(null);
  }

  set(): Promise<void> {
    return Promise.resolve();
  }

  delete(): Promise<void> {
    return Promise.resolve();
  }

  deleteByPrefix(): Promise<void> {
    return Promise.resolve();
  }
}
