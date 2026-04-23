import { UpdateProductCommand } from '../commands/update-product.command';
import { Product } from '../../domain/entities/product.entity';

export abstract class UpdateProductUseCase {
  abstract execute(command: UpdateProductCommand): Promise<Product>;
}
