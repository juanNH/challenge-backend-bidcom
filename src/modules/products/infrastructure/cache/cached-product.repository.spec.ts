/* eslint-disable @typescript-eslint/unbound-method */
import { CacheService } from '../../../../shared/infrastructure/cache/cache.service';
import { PinoLogger } from 'nestjs-pino';
import { Brand } from '../../domain/entities/brand.entity';
import { Category } from '../../domain/entities/category.entity';
import { Product } from '../../domain/entities/product.entity';
import { TypeOrmProductRepository } from '../persistence/typeorm/repositories/typeorm-product.repository';
import { CachedProductRepository } from './cached-product.repository';

const CATEGORY_ID = '11111111-1111-4111-8111-111111111111';
const BRAND_ID = '22222222-2222-4222-8222-222222222222';
const PRODUCT_ID = '33333333-3333-4333-8333-333333333333';
const CREATED_AT = new Date('2026-03-18T10:30:00Z');

type ProductRepositoryMock = jest.Mocked<TypeOrmProductRepository>;
type CacheServiceMock = jest.Mocked<CacheService>;
type PinoLoggerMock = jest.Mocked<Pick<PinoLogger, 'info'>>;

const createProduct = (): Product =>
  new Product({
    id: PRODUCT_ID,
    name: 'Laptop',
    description: 'Laptop de 16GB RAM',
    price: 1200.5,
    stock: 10,
    category: new Category(CATEGORY_ID, 'Electronics', CREATED_AT),
    brand: new Brand(BRAND_ID, 'Lenovo', CREATED_AT),
    createdAt: CREATED_AT,
  });

const createRepositoryMock = (): ProductRepositoryMock =>
  ({
    findCategoryById: jest.fn(),
    findBrandById: jest.fn(),
    search: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }) as unknown as ProductRepositoryMock;

const createCacheServiceMock = (): CacheServiceMock => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  deleteByPrefix: jest.fn(),
});

describe('CachedProductRepository', () => {
  let origin: ProductRepositoryMock;
  let cacheService: CacheServiceMock;
  let logger: PinoLoggerMock;
  let repository: CachedProductRepository;
  let product: Product;

  beforeEach(() => {
    origin = createRepositoryMock();
    cacheService = createCacheServiceMock();
    logger = {
      info: jest.fn(),
    };
    repository = new CachedProductRepository(origin, cacheService, logger);
    product = createProduct();
  });

  it('should return product from cache without hitting the origin repository', async () => {
    cacheService.get.mockResolvedValue({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: {
        id: product.category.id,
        name: product.category.name,
        createdAt: product.category.createdAt.toISOString(),
      },
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        createdAt: product.brand.createdAt.toISOString(),
      },
      createdAt: product.createdAt.toISOString(),
    });

    await expect(repository.findById(PRODUCT_ID)).resolves.toEqual(product);
    expect(origin.findById).not.toHaveBeenCalled();
  });

  it('should cache product by id when origin repository returns a product', async () => {
    cacheService.get.mockResolvedValue(null);
    origin.findById.mockResolvedValue(product);

    await expect(repository.findById(PRODUCT_ID)).resolves.toBe(product);

    expect(origin.findById).toHaveBeenCalledWith(PRODUCT_ID);
    expect(cacheService.set).toHaveBeenCalledWith(
      `product:${PRODUCT_ID}`,
      expect.objectContaining({
        id: PRODUCT_ID,
        name: 'Laptop',
      }),
      120,
    );
  });

  it('should cache search results by filter hash', async () => {
    const filters = {
      name: 'lap',
      limit: 20,
      offset: 0,
    };
    cacheService.get.mockResolvedValue(null);
    origin.search.mockResolvedValue({ total: 1, items: [product] });

    await expect(repository.search(filters)).resolves.toEqual({
      total: 1,
      items: [product],
    });

    expect(cacheService.set).toHaveBeenCalledWith(
      expect.stringMatching(/^products:search:/),
      {
        total: 1,
        items: [expect.objectContaining({ id: PRODUCT_ID })],
      },
      45,
    );
  });

  it('should invalidate product and collection cache after update', async () => {
    origin.update.mockResolvedValue(product);

    await expect(repository.update(PRODUCT_ID, product)).resolves.toBe(product);

    expect(cacheService.delete).toHaveBeenCalledWith(`product:${PRODUCT_ID}`);
    expect(cacheService.delete).toHaveBeenCalledWith('products:list:all');
    expect(cacheService.deleteByPrefix).toHaveBeenCalledWith(
      'products:search:',
    );
  });

  it('should invalidate collection cache after create', async () => {
    origin.create.mockResolvedValue(product);

    await expect(repository.create(product)).resolves.toBe(product);

    expect(cacheService.delete).toHaveBeenCalledWith('products:list:all');
    expect(cacheService.deleteByPrefix).toHaveBeenCalledWith(
      'products:search:',
    );
  });
});
