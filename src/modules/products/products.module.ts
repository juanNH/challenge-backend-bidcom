import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { SearchProductsUseCase } from './application/use-cases/search-products.use-case';
import { ProductRepository } from './domain/repositories/product.repository';
import { TypeOrmBrandEntity } from './infrastructure/persistence/typeorm/entities/typeorm-brand.entity';
import { TypeOrmCategoryEntity } from './infrastructure/persistence/typeorm/entities/typeorm-category.entity';
import { TypeOrmProductEntity } from './infrastructure/persistence/typeorm/entities/typeorm-product.entity';
import { TypeOrmProductRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-product.repository';
import { ProductsController } from './presentation/http/controllers/products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TypeOrmProductEntity,
      TypeOrmCategoryEntity,
      TypeOrmBrandEntity,
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    TypeOrmProductRepository,
    {
      provide: ProductRepository,
      useExisting: TypeOrmProductRepository,
    },
    {
      provide: SearchProductsUseCase,
      useFactory: (productRepository: ProductRepository) =>
        new SearchProductsUseCase(productRepository),
      inject: [ProductRepository],
    },
    {
      provide: GetProductsUseCase,
      useFactory: (productRepository: ProductRepository) =>
        new GetProductsUseCase(productRepository),
      inject: [ProductRepository],
    },
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
