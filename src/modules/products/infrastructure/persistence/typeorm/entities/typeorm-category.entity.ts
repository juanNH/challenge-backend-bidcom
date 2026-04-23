import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypeOrmProductEntity } from './typeorm-product.entity';

@Entity({ name: 'categories' })
export class TypeOrmCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(
    () => TypeOrmProductEntity,
    (product: TypeOrmProductEntity) => product.category,
  )
  products!: TypeOrmProductEntity[];
}
