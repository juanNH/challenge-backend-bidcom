import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
