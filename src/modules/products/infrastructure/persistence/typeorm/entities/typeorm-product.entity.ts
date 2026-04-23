import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypeOrmBrandEntity } from './typeorm-brand.entity';
import { TypeOrmCategoryEntity } from './typeorm-category.entity';

@Entity({ name: 'products' })
export class TypeOrmProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'integer', default: 0 })
  stock!: number;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(
    () => TypeOrmCategoryEntity,
    (category: TypeOrmCategoryEntity) => category.products,
  )
  @JoinColumn({ name: 'category_id' })
  category!: TypeOrmCategoryEntity;

  @ManyToOne(
    () => TypeOrmBrandEntity,
    (brand: TypeOrmBrandEntity) => brand.products,
  )
  @JoinColumn({ name: 'brand_id' })
  brand!: TypeOrmBrandEntity;
}
