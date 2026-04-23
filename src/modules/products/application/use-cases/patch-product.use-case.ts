import { PatchProductCommand } from '../commands/patch-product.command';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class PatchProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: PatchProductCommand): Promise<Product> {
    const product = await this.productRepository.findById(command.id);

    if (!product) {
      throw new Error('Product not found');
    }

    const payload: Parameters<ProductRepository['patch']>[1] = {};

    if (command.name !== undefined) {
      payload.name = command.name;
    }

    if (command.description !== undefined) {
      payload.description = command.description;
    }

    if (command.price !== undefined) {
      payload.price = command.price;
    }

    if (command.stock !== undefined) {
      payload.stock = command.stock;
    }

    if (command.categoryId !== undefined) {
      const category = await this.productRepository.findCategoryById(
        command.categoryId,
      );

      if (!category) {
        throw new Error('Category not found');
      }

      payload.category = category;
    }

    if (command.brandId !== undefined) {
      const brand = await this.productRepository.findBrandById(command.brandId);

      if (!brand) {
        throw new Error('Brand not found');
      }

      payload.brand = brand;
    }

    return this.productRepository.patch(command.id, payload);
  }
}
