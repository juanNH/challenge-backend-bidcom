/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { setupHttp } from './../src/app/config/http.config';
import { TypeOrmBrandEntity } from './../src/modules/products/infrastructure/persistence/typeorm/entities/typeorm-brand.entity';
import { TypeOrmCategoryEntity } from './../src/modules/products/infrastructure/persistence/typeorm/entities/typeorm-category.entity';
import { TypeOrmProductEntity } from './../src/modules/products/infrastructure/persistence/typeorm/entities/typeorm-product.entity';

const CATEGORY_ID = '11111111-1111-4111-8111-111111111111';
const BRAND_ID = '22222222-2222-4222-8222-222222222222';
const PRODUCT_ID = '33333333-3333-4333-8333-333333333333';
const SECOND_PRODUCT_ID = '44444444-4444-4444-8444-444444444444';
const UNKNOWN_PRODUCT_ID = '55555555-5555-4555-8555-555555555555';

type ProductResponseExpectation = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: {
    id: string;
    name: string;
    createdAt: expect.Any;
  };
  brand: {
    id: string;
    name: string;
    createdAt: expect.Any;
  };
  createdAt: expect.Any;
};

const expectedProduct = (
  overrides: Partial<ProductResponseExpectation> = {},
): ProductResponseExpectation => ({
  id: PRODUCT_ID,
  name: 'Laptop',
  description: 'Laptop de 16GB RAM',
  price: 1200.5,
  stock: 10,
  category: {
    id: CATEGORY_ID,
    name: 'Electronics',
    createdAt: expect.any(String),
  },
  brand: {
    id: BRAND_ID,
    name: 'Lenovo',
    createdAt: expect.any(String),
  },
  createdAt: expect.any(String),
  ...overrides,
});

const seedProducts = async (dataSource: DataSource): Promise<void> => {
  await dataSource.getRepository(TypeOrmCategoryEntity).save({
    id: CATEGORY_ID,
    name: 'Electronics',
  });

  await dataSource.getRepository(TypeOrmBrandEntity).save({
    id: BRAND_ID,
    name: 'Lenovo',
  });

  await dataSource.getRepository(TypeOrmProductEntity).save([
    {
      id: PRODUCT_ID,
      name: 'Laptop',
      description: 'Laptop de 16GB RAM',
      price: 1200.5,
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
    },
    {
      id: SECOND_PRODUCT_ID,
      name: 'Mouse',
      description: 'Wireless mouse',
      price: 50,
      stock: 25,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
    },
  ]);
};

describe('Products API (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ bodyParser: false });
    setupHttp(app);
    await app.init();

    dataSource = app.get(DataSource);
    await seedProducts(dataSource);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /products/search', () => {
    it('returns paginated products that match the provided filters', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({
          name: 'Lap',
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
          minPrice: 1000,
          maxPrice: 1300,
          limit: 20,
          offset: 0,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual({
            total: 1,
            items: [expectedProduct()],
          });
        });
    });

    it('returns 400 when query params are invalid', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ minPrice: 'invalid-price' })
        .expect(400)
        .expect((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              error: expect.any(String),
              code: 'A0400',
              traceId: expect.any(String),
            }),
          );
        });
    });
  });

  describe('GET /products', () => {
    it('returns the products list', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual([
            expectedProduct(),
            expectedProduct({
              id: SECOND_PRODUCT_ID,
              name: 'Mouse',
              description: 'Wireless mouse',
              price: 50,
              stock: 25,
            }),
          ]);
        });
    });
  });

  describe('POST /products', () => {
    it('returns 400 when request body is malformed JSON', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Content-Type', 'application/json')
        .send('{"name":"Keyboard",}')
        .expect(400)
        .expect((response) => {
          expect(response.headers['x-trace-id']).toEqual(expect.any(String));
          expect(response.body).toEqual(
            expect.objectContaining({
              error: expect.stringContaining('Invalid JSON request body'),
              code: 'A0400',
              traceId: expect.any(String),
            }),
          );
        });
    });

    it('creates a product from a valid payload', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('x-trace-id', 'test-create-product-trace-id')
        .send({
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          price: 150,
          stock: 15,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        })
        .expect(201)
        .expect((response) => {
          expect(response.headers['x-trace-id']).toBe(
            'test-create-product-trace-id',
          );
          expect(response.body).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: 'Keyboard',
              description: 'Mechanical keyboard',
              price: 150,
              stock: 15,
              category: expect.objectContaining({
                id: CATEGORY_ID,
                name: 'Electronics',
              }),
              brand: expect.objectContaining({
                id: BRAND_ID,
                name: 'Lenovo',
              }),
              createdAt: expect.any(String),
            }),
          );
        });
    });

    it('returns 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          price: 150,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        })
        .expect(400)
        .expect((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              error: expect.any(String),
              code: 'A0400',
              traceId: expect.any(String),
            }),
          );
        });
    });
  });

  describe('GET /products/:id', () => {
    it('returns a product by id', () => {
      return request(app.getHttpServer())
        .get(`/products/${PRODUCT_ID}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual(expectedProduct());
        });
    });

    it('returns 400 when id is not a UUID', () => {
      return request(app.getHttpServer())
        .get('/products/not-a-uuid')
        .expect(400);
    });

    it('returns 404 when product does not exist', () => {
      return request(app.getHttpServer())
        .get(`/products/${UNKNOWN_PRODUCT_ID}`)
        .expect(404)
        .expect((response) => {
          expect(response.body).toEqual({
            error: 'Product not found',
            code: 'A0404',
            traceId: expect.any(String),
          });
        });
    });
  });

  describe('PUT /products/:id', () => {
    it('replaces a product from a valid payload', () => {
      return request(app.getHttpServer())
        .put(`/products/${PRODUCT_ID}`)
        .send({
          name: 'Updated laptop',
          description: 'Updated description',
          price: 1300,
          stock: 8,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual(
            expectedProduct({
              name: 'Updated laptop',
              description: 'Updated description',
              price: 1300,
              stock: 8,
            }),
          );
        });
    });

    it('returns 400 when payload is invalid', () => {
      return request(app.getHttpServer())
        .put(`/products/${PRODUCT_ID}`)
        .send({
          name: 'Invalid laptop',
          price: -1,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        })
        .expect(400);
    });

    it('returns 404 when product does not exist', () => {
      return request(app.getHttpServer())
        .put(`/products/${UNKNOWN_PRODUCT_ID}`)
        .send({
          name: 'Updated laptop',
          description: 'Updated description',
          price: 1300,
          stock: 8,
          categoryId: CATEGORY_ID,
          brandId: BRAND_ID,
        })
        .expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('partially updates a product from a valid payload', () => {
      return request(app.getHttpServer())
        .patch(`/products/${PRODUCT_ID}`)
        .send({
          stock: 7,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual(
            expectedProduct({
              stock: 7,
            }),
          );
        });
    });

    it('returns 400 when payload is invalid', () => {
      return request(app.getHttpServer())
        .patch(`/products/${PRODUCT_ID}`)
        .send({
          price: -1,
        })
        .expect(400);
    });

    it('returns 404 when product does not exist', () => {
      return request(app.getHttpServer())
        .patch(`/products/${UNKNOWN_PRODUCT_ID}`)
        .send({
          stock: 7,
        })
        .expect(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('deletes a product', () => {
      return request(app.getHttpServer())
        .delete(`/products/${PRODUCT_ID}`)
        .expect(204)
        .expect('');
    });

    it('returns 404 when product does not exist', () => {
      return request(app.getHttpServer())
        .delete(`/products/${UNKNOWN_PRODUCT_ID}`)
        .expect(404);
    });
  });
});
