import { CreateProductCommand } from '../commands/create-product.command';
import { Product } from '../../domain/entities/product.entity';

export abstract class CreateProductUseCase {
  abstract execute(command: CreateProductCommand): Promise<Product>;
}
