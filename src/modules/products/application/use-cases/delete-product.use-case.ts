import { ProductRepository } from '../../domain/repositories/product.repository';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: string): Promise<void> {
    void this.productRepository;
    void id;
    return Promise.reject(new Error('Not implemented'));
  }
}
