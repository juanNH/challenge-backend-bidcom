import { UpdateProductCommand } from '../commands/update-product.command';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    const currentProduct = await this.productRepository.findById(command.id);

    if (!currentProduct) {
      throw new Error('Product not found');
    }

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
      id: currentProduct.id,
      name: command.name,
      description: command.description ?? null,
      price: command.price,
      stock: command.stock ?? 0,
      category,
      brand,
      createdAt: currentProduct.createdAt,
    });

    return this.productRepository.update(command.id, product);
  }
}
