import { Product } from '../../domain/entities/product.entity';

export abstract class GetProductByIdUseCase {
  abstract execute(id: string): Promise<Product | null>;
}
