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

  private toCategory(category: TypeOrmCategoryEntity): Category {
    return new Category(category.id, category.name, category.createdAt);
  }

  private toBrand(brand: TypeOrmBrandEntity): Brand {
    return new Brand(brand.id, brand.name, brand.createdAt);
  }
}
