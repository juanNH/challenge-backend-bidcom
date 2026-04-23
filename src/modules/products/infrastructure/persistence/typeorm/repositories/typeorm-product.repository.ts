import { Injectable } from '@nestjs/common';
import {
  ProductRepository,
  ProductSearchFilters,
  SearchProductsResult,
} from '../../../../domain/repositories/product.repository';
import { Brand } from '../../../../domain/entities/brand.entity';
import { Category } from '../../../../domain/entities/category.entity';
import { Product } from '../../../../domain/entities/product.entity';

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  search(filters: ProductSearchFilters): Promise<SearchProductsResult> {
    void filters;
    return Promise.reject(new Error('Not implemented'));
  }

  findAll(): Promise<Product[]> {
    return Promise.reject(new Error('Not implemented'));
  }

  findById(id: string): Promise<Product | null> {
    void id;
    return Promise.reject(new Error('Not implemented'));
  }

  create(product: Product): Promise<Product> {
    void product;
    return Promise.reject(new Error('Not implemented'));
  }

  update(id: string, product: Product): Promise<Product> {
    void id;
    void product;
    return Promise.reject(new Error('Not implemented'));
  }

  patch(
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
    void id;
    void payload;
    return Promise.reject(new Error('Not implemented'));
  }

  delete(id: string): Promise<void> {
    void id;
    return Promise.reject(new Error('Not implemented'));
  }
}
