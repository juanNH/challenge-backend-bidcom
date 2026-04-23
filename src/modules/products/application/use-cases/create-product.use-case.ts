import { CreateProductCommand } from '../commands/create-product.command';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(command: CreateProductCommand): Promise<Product> {
    void this.productRepository;
    void command;
    return Promise.reject(new Error('Not implemented'));
  }
}
