import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: string): Promise<Product | null> {
    void this.productRepository;
    void id;
    return Promise.reject(new Error('Not implemented'));
  }
}
