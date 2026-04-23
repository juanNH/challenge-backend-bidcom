import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async findCategoryById(id: string): Promise<Category | null> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    return category ? this.toCategory(category) : null;
  }

  async findBrandById(id: string): Promise<Brand | null> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    return brand ? this.toBrand(brand) : null;
  }

  async search(filters: ProductSearchFilters): Promise<SearchProductsResult> {
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
  }

  async findAll(): Promise<Product[]> {
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
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        brand: true,
      },
    });

    return product ? this.toProduct(product) : null;
  }

  async create(product: Product): Promise<Product> {
    await this.productRepository.save(this.toTypeOrmProduct(product));

    return this.findPersistedProductById(product.id);
  }

  async update(id: string, product: Product): Promise<Product> {
    await this.productRepository.save({
      ...this.toTypeOrmProduct(product),
      id,
    });

    return this.findPersistedProductById(id);
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
  }

  async delete(id: string): Promise<void> {
    await this.productRepository.delete(id);
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
}
