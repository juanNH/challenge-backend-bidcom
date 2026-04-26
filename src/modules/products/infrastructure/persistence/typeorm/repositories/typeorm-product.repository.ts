import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { sanitizeLogPayload } from '../../../../../../shared/infrastructure/logging/log-sanitizer';
import { TraceContextService } from '../../../../../../shared/infrastructure/trace/trace-context.service';
import { Brand } from '../../../../domain/entities/brand.entity';
import { Category } from '../../../../domain/entities/category.entity';
import { Product } from '../../../../domain/entities/product.entity';
import {
  ProductRepository,
  ProductSearchFilters,
  SearchProductsResult,
} from '../../../../domain/repositories/product.repository';
import { TypeOrmBrandEntity } from '../entities/typeorm-brand.entity';
import { TypeOrmCategoryEntity } from '../entities/typeorm-category.entity';
import { TypeOrmProductEntity } from '../entities/typeorm-product.entity';

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(TypeOrmProductEntity)
    private readonly productRepository: Repository<TypeOrmProductEntity>,
    @InjectRepository(TypeOrmCategoryEntity)
    private readonly categoryRepository: Repository<TypeOrmCategoryEntity>,
    @InjectRepository(TypeOrmBrandEntity)
    private readonly brandRepository: Repository<TypeOrmBrandEntity>,
    @Optional()
    @InjectPinoLogger(TypeOrmProductRepository.name)
    private readonly logger?: PinoLogger,
    @Optional()
    private readonly traceContextService?: TraceContextService,
  ) {}

  async findCategoryById(id: string): Promise<Category | null> {
    return this.executeLogged(
      'findCategoryById',
      { categoryId: id },
      async () => {
        const category = await this.categoryRepository.findOne({
          where: { id },
        });

        return category ? this.toCategory(category) : null;
      },
      (category) => ({ found: Boolean(category) }),
    );
  }

  async findBrandById(id: string): Promise<Brand | null> {
    return this.executeLogged(
      'findBrandById',
      { brandId: id },
      async () => {
        const brand = await this.brandRepository.findOne({ where: { id } });

        return brand ? this.toBrand(brand) : null;
      },
      (brand) => ({ found: Boolean(brand) }),
    );
  }

  async search(filters: ProductSearchFilters): Promise<SearchProductsResult> {
    return this.executeLogged(
      'search',
      { filters },
      async () => {
        const queryBuilder = this.productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.category', 'category')
          .leftJoinAndSelect('product.brand', 'brand')
          .orderBy('product.createdAt', 'ASC')
          .addOrderBy('product.id', 'ASC')
          .skip(filters.offset)
          .take(filters.limit);

        const name = filters.name?.trim();

        if (name) {
          queryBuilder.andWhere('LOWER(product.name) LIKE :name', {
            name: `%${name.toLowerCase()}%`,
          });
        }

        if (filters.categoryId) {
          queryBuilder.andWhere('product.categoryId = :categoryId', {
            categoryId: filters.categoryId,
          });
        }

        if (filters.brandId) {
          queryBuilder.andWhere('product.brandId = :brandId', {
            brandId: filters.brandId,
          });
        }

        if (filters.minPrice !== undefined) {
          queryBuilder.andWhere('product.price >= :minPrice', {
            minPrice: filters.minPrice,
          });
        }

        if (filters.maxPrice !== undefined) {
          queryBuilder.andWhere('product.price <= :maxPrice', {
            maxPrice: filters.maxPrice,
          });
        }

        const [products, total] = await queryBuilder.getManyAndCount();

        return {
          total,
          items: products.map((product) => this.toProduct(product)),
        };
      },
      (result) => ({ total: result.total, items: result.items.length }),
    );
  }

  async findAll(): Promise<Product[]> {
    return this.executeLogged(
      'findAll',
      {},
      async () => {
        const products = await this.productRepository.find({
          relations: {
            category: true,
            brand: true,
          },
          order: {
            createdAt: 'ASC',
            id: 'ASC',
          },
        });

        return products.map((product) => this.toProduct(product));
      },
      (products) => ({ items: products.length }),
    );
  }

  async findById(id: string): Promise<Product | null> {
    return this.executeLogged(
      'findById',
      { productId: id },
      async () => {
        const product = await this.productRepository.findOne({
          where: { id },
          relations: {
            category: true,
            brand: true,
          },
        });

        return product ? this.toProduct(product) : null;
      },
      (product) => ({ found: Boolean(product) }),
    );
  }

  async create(product: Product): Promise<Product> {
    return this.executeLogged(
      'create',
      {
        productId: product.id,
        categoryId: product.category.id,
        brandId: product.brand.id,
      },
      async () => {
        await this.productRepository.save(this.toTypeOrmProduct(product));

        return this.findPersistedProductById(product.id);
      },
      (createdProduct) => ({ productId: createdProduct.id }),
    );
  }

  async update(id: string, product: Product): Promise<Product> {
    return this.executeLogged(
      'update',
      {
        productId: id,
        categoryId: product.category.id,
        brandId: product.brand.id,
      },
      async () => {
        await this.productRepository.save({
          ...this.toTypeOrmProduct(product),
          id,
        });

        return this.findPersistedProductById(id);
      },
      (updatedProduct) => ({ productId: updatedProduct.id }),
    );
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
    return this.executeLogged(
      'patch',
      {
        productId: id,
        fields: Object.keys(payload),
      },
      async () => {
        const updatePayload: Partial<TypeOrmProductEntity> = {};

        if (payload.name !== undefined) {
          updatePayload.name = payload.name;
        }

        if (payload.description !== undefined) {
          updatePayload.description = payload.description;
        }

        if (payload.price !== undefined) {
          updatePayload.price = payload.price;
        }

        if (payload.stock !== undefined) {
          updatePayload.stock = payload.stock;
        }

        if (payload.category !== undefined) {
          updatePayload.categoryId = payload.category.id;
        }

        if (payload.brand !== undefined) {
          updatePayload.brandId = payload.brand.id;
        }

        await this.productRepository.update(id, updatePayload);

        return this.findPersistedProductById(id);
      },
      (patchedProduct) => ({ productId: patchedProduct.id }),
    );
  }

  async delete(id: string): Promise<void> {
    await this.executeLogged(
      'delete',
      { productId: id },
      async () => {
        await this.productRepository.delete(id);
      },
      () => ({ productId: id }),
    );
  }

  private async findPersistedProductById(id: string): Promise<Product> {
    const product = await this.findById(id);

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  private toProduct(product: TypeOrmProductEntity): Product {
    return new Product({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      category: this.toCategory(product.category),
      brand: this.toBrand(product.brand),
      createdAt: product.createdAt,
    });
  }

  private toTypeOrmProduct(product: Product): Partial<TypeOrmProductEntity> {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category.id,
      brandId: product.brand.id,
      createdAt: product.createdAt,
    };
  }

  private toCategory(category: TypeOrmCategoryEntity): Category {
    return new Category(category.id, category.name, category.createdAt);
  }

  private toBrand(brand: TypeOrmBrandEntity): Brand {
    return new Brand(brand.id, brand.name, brand.createdAt);
  }

  private async executeLogged<T>(
    operation: string,
    context: Record<string, unknown>,
    action: () => Promise<T>,
    successContext: (result: T) => Record<string, unknown> = () => ({}),
  ): Promise<T> {
    const startedAt = Date.now();
    this.logger?.info(
      {
        traceId: this.getTraceId(),
        operation,
        context: sanitizeLogPayload(context),
      },
      'Product repository operation started',
    );

    try {
      const result = await action();

      this.logger?.info(
        {
          traceId: this.getTraceId(),
          operation,
          durationMs: Date.now() - startedAt,
          context: sanitizeLogPayload(context),
          result: sanitizeLogPayload(successContext(result)),
        },
        'Product repository operation completed',
      );

      return result;
    } catch (error: unknown) {
      this.logger?.error(
        {
          traceId: this.getTraceId(),
          err: error,
          operation,
          durationMs: Date.now() - startedAt,
          context: sanitizeLogPayload(context),
        },
        'Product repository operation failed',
      );

      throw error;
    }
  }

  private getTraceId(): string | undefined {
    return this.traceContextService?.getTraceId();
  }
}
