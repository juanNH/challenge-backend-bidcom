import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductCatalogTables1776900000000 implements MigrationInterface {
  name = 'CreateProductCatalogTables1776900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_brands_name" UNIQUE ("name"),
        CONSTRAINT "PK_brands_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL,
        "stock" integer NOT NULL DEFAULT 0,
        "category_id" uuid NOT NULL,
        "brand_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_products_category_id" ON "products" ("category_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_products_brand_id" ON "products" ("brand_id")',
    );

    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_category_id"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_brand_id"
      FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "products" DROP CONSTRAINT "FK_products_brand_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "products" DROP CONSTRAINT "FK_products_category_id"',
    );
    await queryRunner.query('DROP INDEX "IDX_products_brand_id"');
    await queryRunner.query('DROP INDEX "IDX_products_category_id"');
    await queryRunner.query('DROP TABLE "products"');
    await queryRunner.query('DROP TABLE "brands"');
    await queryRunner.query('DROP TABLE "categories"');
  }
}
