/* eslint-disable @typescript-eslint/unbound-method */
import { Brand } from '../../domain/entities/brand.entity';
import { Category } from '../../domain/entities/category.entity';
import { Product } from '../../domain/entities/product.entity';
import {
  ProductRepository,
  SearchProductsResult,
} from '../../domain/repositories/product.repository';
import { CreateProductUseCase } from './create-product.use-case';
import { DeleteProductUseCase } from './delete-product.use-case';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { GetProductsUseCase } from './get-products.use-case';
import { PatchProductUseCase } from './patch-product.use-case';
import { SearchProductsUseCase } from './search-products.use-case';
import { UpdateProductUseCase } from './update-product.use-case';

const CATEGORY_ID = '11111111-1111-4111-8111-111111111111';
const BRAND_ID = '22222222-2222-4222-8222-222222222222';
const PRODUCT_ID = '33333333-3333-4333-8333-333333333333';
const UNKNOWN_PRODUCT_ID = '44444444-4444-4444-8444-444444444444';
const CREATED_AT = new Date('2026-03-18T10:30:00Z');

type ProductRepositoryMock = jest.Mocked<ProductRepository>;

const createRepositoryMock = (): ProductRepositoryMock => ({
  findCategoryById: jest.fn(),
  findBrandById: jest.fn(),
  search: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
});

const createCategory = (): Category =>
  new Category(CATEGORY_ID, 'Electronics', CREATED_AT);

const createBrand = (): Brand => new Brand(BRAND_ID, 'Lenovo', CREATED_AT);

const createProduct = (overrides: Partial<Product> = {}): Product =>
  new Product({
    id: PRODUCT_ID,
    name: overrides.name ?? 'Laptop',
    description: overrides.description ?? 'Laptop de 16GB RAM',
    price: overrides.price ?? 1200.5,
    stock: overrides.stock ?? 10,
    category: overrides.category ?? createCategory(),
    brand: overrides.brand ?? createBrand(),
    createdAt: overrides.createdAt ?? CREATED_AT,
  });

describe('Products use cases', () => {
  let productRepository: ProductRepositoryMock;
  let category: Category;
  let brand: Brand;
  let product: Product;

  beforeEach(() => {
    productRepository = createRepositoryMock();
    category = createCategory();
    brand = createBrand();
    product = createProduct({ category, brand });
  });

  describe('SearchProductsUseCase', () => {
    it('should search products by name, category, brand and price range', async () => {
      const query = {
        name: 'Lap',
        categoryId: CATEGORY_ID,
        brandId: BRAND_ID,
        minPrice: 1000,
        maxPrice: 1300,
        limit: 20,
        offset: 0,
      };
      const result: SearchProductsResult = { total: 1, items: [product] };
      productRepository.search.mockResolvedValue(result);

      const useCase = new SearchProductsUseCase(productRepository);

      await expect(useCase.execute(query)).resolves.toEqual(result);
      expect(productRepository.search).toHaveBeenCalledWith(query);
    });

    it('should apply limit and offset pagination', async () => {
      const query = { limit: 10, offset: 20 };
      const result: SearchProductsResult = { total: 0, items: [] };
      productRepository.search.mockResolvedValue(result);

      const useCase = new SearchProductsUseCase(productRepository);

      await expect(useCase.execute(query)).resolves.toEqual(result);
      expect(productRepository.search).toHaveBeenCalledWith(query);
    });
  });

  describe('GetProductsUseCase', () => {
    it('should list all products with category and brand objects', async () => {
      productRepository.findAll.mockResolvedValue([product]);

      const useCase = new GetProductsUseCase(productRepository);

      await expect(useCase.execute()).resolves.toEqual([product]);
      expect(productRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('CreateProductUseCase', () => {
    it('should create a product from a valid command', async () => {
      productRepository.findCategoryById.mockResolvedValue(category);
      productRepository.findBrandById.mockResolvedValue(brand);
      productRepository.create.mockImplementation((newProduct) =>
        Promise.resolve(newProduct),
      );

      const useCase = new CreateProductUseCase(productRepository);

      const createdProduct = await useCase.execute({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 150,
        stock: 15,
        categoryId: CATEGORY_ID,
        brandId: BRAND_ID,
      });

      expect(productRepository.findCategoryById).toHaveBeenCalledWith(
        CATEGORY_ID,
      );
      expect(productRepository.findBrandById).toHaveBeenCalledWith(BRAND_ID);
      expect(productRepository.create).toHaveBeenCalledTimes(1);
      expect(createdProduct).toEqual(
        expect.objectContaining({
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          price: 150,
          stock: 15,
          category,
          brand,
        }),
      );
    });

    it('should fail when category does not exist', async () => {
      productRepository.findCategoryById.mockResolvedValue(null);

      const useCase = new CreateProductUseCase(productRepository);

      await expect(
        useCase.execute({
          name: 'Keyboard',
          price: 150,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        }),
      ).rejects.toThrow('Category not found');
      expect(productRepository.create).not.toHaveBeenCalled();
    });

    it('should fail when brand does not exist', async () => {
      productRepository.findCategoryById.mockResolvedValue(category);
      productRepository.findBrandById.mockResolvedValue(null);

      const useCase = new CreateProductUseCase(productRepository);

      await expect(
        useCase.execute({
          name: 'Keyboard',
          price: 150,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        }),
      ).rejects.toThrow('Brand not found');
      expect(productRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('GetProductByIdUseCase', () => {
    it('should return a product by id', async () => {
      productRepository.findById.mockResolvedValue(product);

      const useCase = new GetProductByIdUseCase(productRepository);

      await expect(useCase.execute(PRODUCT_ID)).resolves.toBe(product);
      expect(productRepository.findById).toHaveBeenCalledWith(PRODUCT_ID);
    });

    it('should return null when product does not exist', async () => {
      productRepository.findById.mockResolvedValue(null);

      const useCase = new GetProductByIdUseCase(productRepository);

      await expect(useCase.execute(UNKNOWN_PRODUCT_ID)).resolves.toBeNull();
      expect(productRepository.findById).toHaveBeenCalledWith(
        UNKNOWN_PRODUCT_ID,
      );
    });
  });

  describe('UpdateProductUseCase', () => {
    it('should replace a product from a valid command', async () => {
      const updatedProduct = createProduct({ name: 'Updated laptop' });
      productRepository.findById.mockResolvedValue(product);
      productRepository.findCategoryById.mockResolvedValue(category);
      productRepository.findBrandById.mockResolvedValue(brand);
      productRepository.update.mockResolvedValue(updatedProduct);

      const useCase = new UpdateProductUseCase(productRepository);

      await expect(
        useCase.execute({
          id: PRODUCT_ID,
          name: 'Updated laptop',
          description: 'Updated description',
          price: 1300,
          stock: 8,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        }),
      ).resolves.toBe(updatedProduct);
      expect(productRepository.findById).toHaveBeenCalledWith(PRODUCT_ID);
      expect(productRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should fail when product does not exist', async () => {
      productRepository.findById.mockResolvedValue(null);

      const useCase = new UpdateProductUseCase(productRepository);

      await expect(
        useCase.execute({
          id: UNKNOWN_PRODUCT_ID,
          name: 'Updated laptop',
          price: 1300,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        }),
      ).rejects.toThrow('Product not found');
      expect(productRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('PatchProductUseCase', () => {
    it('should partially update a product from a valid command', async () => {
      const patchedProduct = createProduct({ stock: 7 });
      productRepository.findById.mockResolvedValue(product);
      productRepository.patch.mockResolvedValue(patchedProduct);

      const useCase = new PatchProductUseCase(productRepository);

      await expect(useCase.execute({ id: PRODUCT_ID, stock: 7 })).resolves.toBe(
        patchedProduct,
      );
      expect(productRepository.findById).toHaveBeenCalledWith(PRODUCT_ID);
      expect(productRepository.patch).toHaveBeenCalledWith(PRODUCT_ID, {
        stock: 7,
      });
    });

    it('should fail when product does not exist', async () => {
      productRepository.findById.mockResolvedValue(null);

      const useCase = new PatchProductUseCase(productRepository);

      await expect(
        useCase.execute({ id: UNKNOWN_PRODUCT_ID, stock: 7 }),
      ).rejects.toThrow('Product not found');
      expect(productRepository.patch).not.toHaveBeenCalled();
    });
  });

  describe('DeleteProductUseCase', () => {
    it('should delete a product by id', async () => {
      productRepository.findById.mockResolvedValue(product);
      productRepository.delete.mockResolvedValue(undefined);

      const useCase = new DeleteProductUseCase(productRepository);

      await expect(useCase.execute(PRODUCT_ID)).resolves.toBeUndefined();
      expect(productRepository.findById).toHaveBeenCalledWith(PRODUCT_ID);
      expect(productRepository.delete).toHaveBeenCalledWith(PRODUCT_ID);
    });

    it('should fail when product does not exist', async () => {
      productRepository.findById.mockResolvedValue(null);

      const useCase = new DeleteProductUseCase(productRepository);

      await expect(useCase.execute(UNKNOWN_PRODUCT_ID)).rejects.toThrow(
        'Product not found',
      );
      expect(productRepository.delete).not.toHaveBeenCalled();
    });
  });
});
