import { PatchProductCommand } from '../commands/patch-product.command';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class PatchProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(command: PatchProductCommand): Promise<Product> {
    void this.productRepository;
    void command;
    return Promise.reject(new Error('Not implemented'));
  }
}
