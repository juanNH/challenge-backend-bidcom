import { PatchProductCommand } from '../commands/patch-product.command';
import { Product } from '../../domain/entities/product.entity';

export abstract class PatchProductUseCase {
  abstract execute(command: PatchProductCommand): Promise<Product>;
}
