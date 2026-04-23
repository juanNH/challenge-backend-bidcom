import { UpdateProductCommand } from '../commands/update-product.command';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(command: UpdateProductCommand): Promise<Product> {
    void this.productRepository;
    void command;
    return Promise.reject(new Error('Not implemented'));
  }
}
