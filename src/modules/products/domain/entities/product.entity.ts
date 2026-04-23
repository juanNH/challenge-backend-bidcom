import { EntityBase } from '../../../../shared/domain/entity.base';
import { Brand } from './brand.entity';
import { Category } from './category.entity';

type ProductPrimitives = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: Category;
  brand: Brand;
  createdAt: Date;
};

export class Product extends EntityBase {
  public readonly name: string;
  public readonly description: string | null;
  public readonly price: number;
  public readonly stock: number;
  public readonly category: Category;
  public readonly brand: Brand;

  constructor(primitives: ProductPrimitives) {
    super(primitives.id, primitives.createdAt);
    this.name = primitives.name;
    this.description = primitives.description;
    this.price = primitives.price;
    this.stock = primitives.stock;
    this.category = primitives.category;
    this.brand = primitives.brand;
  }
}
