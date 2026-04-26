import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Brand } from '../../domain/entities/brand.entity';
import { Category } from '../../domain/entities/category.entity';
import { Product } from '../../domain/entities/product.entity';
import {
  ProductRepository,
  ProductSearchFilters,
  SearchProductsResult,
} from '../../domain/repositories/product.repository';
import { CacheService } from '../../../../shared/infrastructure/cache/cache.service';
import { TypeOrmProductRepository } from '../persistence/typeorm/repositories/typeorm-product.repository';

type CachedBrand = {
  id: string;
  name: string;
  createdAt: string;
};

type CachedCategory = {
  id: string;
  name: string;
  createdAt: string;
};

type CachedProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: CachedCategory;
  brand: CachedBrand;
  createdAt: string;
};

type CachedSearchProductsResult = {
  total: number;
  items: CachedProduct[];
};

@Injectable()
export class CachedProductRepository implements ProductRepository {
  private readonly productTtlSeconds = 120;
  private readonly collectionTtlSeconds = 45;

  constructor(
    private readonly origin: TypeOrmProductRepository,
    private readonly cacheService: CacheService,
  ) {}

  findCategoryById(id: string): Promise<Category | null> {
    return this.origin.findCategoryById(id);
  }

  findBrandById(id: string): Promise<Brand | null> {
    return this.origin.findBrandById(id);
  }

  async search(filters: ProductSearchFilters): Promise<SearchProductsResult> {
    const key = `products:search:${this.hash(filters)}`;
    const cached = await this.cacheService.get<CachedSearchProductsResult>(key);

    if (cached) {
      return {
        total: cached.total,
        items: cached.items.map((product) => this.toProduct(product)),
      };
    }

    const result = await this.origin.search(filters);
    await this.cacheService.set(
      key,
      {
        total: result.total,
        items: result.items.map((product) => this.toCachedProduct(product)),
      },
      this.collectionTtlSeconds,
    );

    return result;
  }

  async findAll(): Promise<Product[]> {
    const key = 'products:list:all';
    const cached = await this.cacheService.get<CachedProduct[]>(key);

    if (cached) {
      return cached.map((product) => this.toProduct(product));
    }

    const products = await this.origin.findAll();
    await this.cacheService.set(
      key,
      products.map((product) => this.toCachedProduct(product)),
      this.collectionTtlSeconds,
    );

    return products;
  }

  async findById(id: string): Promise<Product | null> {
    const key = this.productKey(id);
    const cached = await this.cacheService.get<CachedProduct>(key);

    if (cached) {
      return this.toProduct(cached);
    }

    const product = await this.origin.findById(id);

    if (product) {
      await this.cacheService.set(
        key,
        this.toCachedProduct(product),
        this.productTtlSeconds,
      );
    }

    return product;
  }

  async create(product: Product): Promise<Product> {
    const createdProduct = await this.origin.create(product);
    await this.invalidateCollections();

    return createdProduct;
  }

  async update(id: string, product: Product): Promise<Product> {
    const updatedProduct = await this.origin.update(id, product);
    await this.invalidateProduct(id);

    return updatedProduct;
  }

  async patch(
    id: string,
    payload: Partial<{
      name: string;
      description: string | null;
      price: number;
      stock: number;
      category: Category;
      brand: Brand;
    }>,
  ): Promise<Product> {
    const patchedProduct = await this.origin.patch(id, payload);
    await this.invalidateProduct(id);

    return patchedProduct;
  }

  async delete(id: string): Promise<void> {
    await this.origin.delete(id);
    await this.invalidateProduct(id);
  }

  private async invalidateProduct(id: string): Promise<void> {
    await this.cacheService.delete(this.productKey(id));
    await this.invalidateCollections();
  }

  private async invalidateCollections(): Promise<void> {
    await this.cacheService.delete('products:list:all');
    await this.cacheService.deleteByPrefix('products:search:');
  }

  private productKey(id: string): string {
    return `product:${id}`;
  }

  private hash(filters: ProductSearchFilters): string {
    return createHash('sha1')
      .update(JSON.stringify(this.sortObject(filters)))
      .digest('hex');
  }

  private sortObject(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortObject(item));
    }

    if (typeof value === 'object' && value !== null) {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((result, key) => {
          result[key] = this.sortObject(
            (value as Record<string, unknown>)[key],
          );

          return result;
        }, {});
    }

    return value;
  }

  private toCachedProduct(product: Product): CachedProduct {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: {
        id: product.category.id,
        name: product.category.name,
        createdAt: product.category.createdAt.toISOString(),
      },
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        createdAt: product.brand.createdAt.toISOString(),
      },
      createdAt: product.createdAt.toISOString(),
    };
  }

  private toProduct(product: CachedProduct): Product {
    return new Product({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: new Category(
        product.category.id,
        product.category.name,
        new Date(product.category.createdAt),
      ),
      brand: new Brand(
        product.brand.id,
        product.brand.name,
        new Date(product.brand.createdAt),
      ),
      createdAt: new Date(product.createdAt),
    });
  }
}
