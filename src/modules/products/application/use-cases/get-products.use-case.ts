import { Product } from '../../domain/entities/product.entity';

export abstract class GetProductsUseCase {
  abstract execute(): Promise<Product[]>;
}
