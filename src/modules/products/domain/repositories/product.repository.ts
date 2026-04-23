import { Product } from '../entities/product.entity';
import { Brand } from '../entities/brand.entity';
import { Category } from '../entities/category.entity';

export type ProductSearchFilters = {
  name?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit: number;
  offset: number;
};

export type SearchProductsResult = {
  total: number;
  items: Product[];
};

export abstract class ProductRepository {
  abstract findCategoryById(id: string): Promise<Category | null>;
  abstract findBrandById(id: string): Promise<Brand | null>;
  abstract search(filters: ProductSearchFilters): Promise<SearchProductsResult>;
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract create(product: Product): Promise<Product>;
  abstract update(id: string, product: Product): Promise<Product>;
  abstract patch(
    id: string,
    payload: Partial<{
      name: string;
      description: string | null;
      price: number;
      stock: number;
      category: Category;
      brand: Brand;
    }>,
  ): Promise<Product>;
  abstract delete(id: string): Promise<void>;
}
