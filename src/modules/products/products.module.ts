import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { PatchProductUseCase } from './application/use-cases/patch-product.use-case';
import { SearchProductsUseCase } from './application/use-cases/search-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { ProductRepository } from './domain/repositories/product.repository';
import { CachedProductRepository } from './infrastructure/cache/cached-product.repository';
import { TypeOrmBrandEntity } from './infrastructure/persistence/typeorm/entities/typeorm-brand.entity';
import { TypeOrmCategoryEntity } from './infrastructure/persistence/typeorm/entities/typeorm-category.entity';
import { TypeOrmProductEntity } from './infrastructure/persistence/typeorm/entities/typeorm-product.entity';
import { TypeOrmProductRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-product.repository';
import { ProductsController } from './presentation/http/controllers/products.controller';
import { CacheModule } from '../../shared/infrastructure/cache/cache.module';

const productUseCaseProviders = [
  SearchProductsUseCase,
  GetProductsUseCase,
  GetProductByIdUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  PatchProductUseCase,
  DeleteProductUseCase,
].map((useCase) => ({
  provide: useCase,
  useFactory: (productRepository: ProductRepository) =>
    new useCase(productRepository),
  inject: [ProductRepository],
}));

@Module({
  imports: [
    CacheModule,
    TypeOrmModule.forFeature([
      TypeOrmProductEntity,
      TypeOrmCategoryEntity,
      TypeOrmBrandEntity,
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    TypeOrmProductRepository,
    CachedProductRepository,
    {
      provide: ProductRepository,
      useExisting: CachedProductRepository,
    },
    ...productUseCaseProviders,
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
