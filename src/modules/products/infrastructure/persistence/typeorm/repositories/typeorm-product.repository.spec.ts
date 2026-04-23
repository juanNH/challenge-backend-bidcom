import { DataSource, Repository } from 'typeorm';
import { Brand } from '../../../../domain/entities/brand.entity';
import { Category } from '../../../../domain/entities/category.entity';
import { Product } from '../../../../domain/entities/product.entity';
import { TypeOrmBrandEntity } from '../entities/typeorm-brand.entity';
import { TypeOrmCategoryEntity } from '../entities/typeorm-category.entity';
import { TypeOrmProductEntity } from '../entities/typeorm-product.entity';
import { TypeOrmProductRepository } from './typeorm-product.repository';

const CATEGORY_ID = '11111111-1111-4111-8111-111111111111';
const BRAND_ID = '22222222-2222-4222-8222-222222222222';
const OTHER_CATEGORY_ID = '55555555-5555-4555-8555-555555555555';
const OTHER_BRAND_ID = '66666666-6666-4666-8666-666666666666';
const PRODUCT_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_PRODUCT_ID = '77777777-7777-4777-8777-777777777777';
const CREATED_AT = new Date('2026-03-18T10:30:00Z');

const seedCatalog = async (
  categoryRepository: Repository<TypeOrmCategoryEntity>,
  brandRepository: Repository<TypeOrmBrandEntity>,
  productRepository: Repository<TypeOrmProductEntity>,
): Promise<void> => {
  await categoryRepository.save([
    {
      id: CATEGORY_ID,
      name: 'Electronics',
      createdAt: CREATED_AT,
    },
    {
      id: OTHER_CATEGORY_ID,
      name: 'Accessories',
      createdAt: CREATED_AT,
    },
  ]);

  await brandRepository.save([
    {
      id: BRAND_ID,
      name: 'Lenovo',
      createdAt: CREATED_AT,
    },
    {
      id: OTHER_BRAND_ID,
      name: 'Logitech',
      createdAt: CREATED_AT,
    },
  ]);

  await productRepository.save([
    {
      id: PRODUCT_ID,
      name: 'Laptop ThinkPad',
      description: 'Laptop de 16GB RAM',
      price: 1200.5,
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      createdAt: CREATED_AT,
    },
    {
      id: OTHER_PRODUCT_ID,
      name: 'Mouse MX',
      description: 'Wireless mouse',
      price: 80,
      stock: 25,
      categoryId: OTHER_CATEGORY_ID,
      brandId: OTHER_BRAND_ID,
      createdAt: CREATED_AT,
    },
  ]);
};

describe('TypeOrmProductRepository', () => {
  let dataSource: DataSource;
  let repository: TypeOrmProductRepository;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [
        TypeOrmProductEntity,
        TypeOrmCategoryEntity,
        TypeOrmBrandEntity,
      ],
      synchronize: true,
      dropSchema: true,
    });

    await dataSource.initialize();

    const productRepository = dataSource.getRepository(TypeOrmProductEntity);
    const categoryRepository = dataSource.getRepository(TypeOrmCategoryEntity);
    const brandRepository = dataSource.getRepository(TypeOrmBrandEntity);

    repository = new TypeOrmProductRepository(
      productRepository,
      categoryRepository,
      brandRepository,
    );

    await seedCatalog(categoryRepository, brandRepository, productRepository);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('should find a category by id', async () => {
    await expect(repository.findCategoryById(CATEGORY_ID)).resolves.toEqual(
      new Category(CATEGORY_ID, 'Electronics', expect.any(Date) as Date),
    );
  });

  it('should find a brand by id', async () => {
    await expect(repository.findBrandById(BRAND_ID)).resolves.toEqual(
      new Brand(BRAND_ID, 'Lenovo', expect.any(Date) as Date),
    );
  });

  it('should find all products with category and brand entities', async () => {
    const products = await repository.findAll();

    expect(products).toHaveLength(2);
    expect(products[0]).toBeInstanceOf(Product);
    expect(products[0]?.id).toBe(PRODUCT_ID);
    expect(products[0]?.name).toBe('Laptop ThinkPad');
    expect(products[0]?.category.id).toBe(CATEGORY_ID);
    expect(products[0]?.brand.id).toBe(BRAND_ID);
  });

  it('should find a product by id', async () => {
    const product = await repository.findById(PRODUCT_ID);

    expect(product?.id).toBe(PRODUCT_ID);
    expect(product?.name).toBe('Laptop ThinkPad');
    expect(product?.category.id).toBe(CATEGORY_ID);
    expect(product?.brand.id).toBe(BRAND_ID);
  });

  it('should return null when a product does not exist', async () => {
    await expect(
      repository.findById('99999999-9999-4999-8999-999999999999'),
    ).resolves.toBeNull();
  });

  it('should search products by filters and return paginated totals', async () => {
    const result = await repository.search({
      name: 'lap',
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      minPrice: 1000,
      maxPrice: 1300,
      limit: 20,
      offset: 0,
    });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe(PRODUCT_ID);
    expect(result.items[0]?.name).toBe('Laptop ThinkPad');
    expect(result.items[0]?.category.id).toBe(CATEGORY_ID);
    expect(result.items[0]?.brand.id).toBe(BRAND_ID);
  });
});
