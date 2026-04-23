import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(): Promise<Product[]> {
    void this.productRepository;
    return Promise.reject(new Error('Not implemented'));
  }
}
