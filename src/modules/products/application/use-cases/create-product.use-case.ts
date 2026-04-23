import { randomUUID } from 'crypto';
import { CreateProductCommand } from '../commands/create-product.command';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    const category = await this.productRepository.findCategoryById(
      command.categoryId,
    );

    if (!category) {
      throw new Error('Category not found');
    }

    const brand = await this.productRepository.findBrandById(command.brandId);

    if (!brand) {
      throw new Error('Brand not found');
    }

    const product = new Product({
      id: randomUUID(),
      name: command.name,
      description: command.description ?? null,
      price: command.price,
      stock: command.stock ?? 0,
      category,
      brand,
      createdAt: new Date(),
    });

    return this.productRepository.create(product);
  }
}
