import { NestFactory } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../../../../app.module';
import { TypeOrmBrandEntity } from '../../../../modules/products/infrastructure/persistence/typeorm/entities/typeorm-brand.entity';
import { TypeOrmCategoryEntity } from '../../../../modules/products/infrastructure/persistence/typeorm/entities/typeorm-category.entity';

const DEFAULT_CATEGORY = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Electronics',
};

const DEFAULT_BRAND = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Lenovo',
};

const ensureCategory = async (
  repository: Repository<TypeOrmCategoryEntity>,
): Promise<void> => {
  const category = await repository.findOne({
    where: [{ id: DEFAULT_CATEGORY.id }, { name: DEFAULT_CATEGORY.name }],
  });

  if (category) {
    console.log(`Category ready: ${category.name} (${category.id})`);
    return;
  }

  await repository.save(DEFAULT_CATEGORY);
  console.log(
    `Category created: ${DEFAULT_CATEGORY.name} (${DEFAULT_CATEGORY.id})`,
  );
};

const ensureBrand = async (
  repository: Repository<TypeOrmBrandEntity>,
): Promise<void> => {
  const brand = await repository.findOne({
    where: [{ id: DEFAULT_BRAND.id }, { name: DEFAULT_BRAND.name }],
  });

  if (brand) {
    console.log(`Brand ready: ${brand.name} (${brand.id})`);
    return;
  }

  await repository.save(DEFAULT_BRAND);
  console.log(`Brand created: ${DEFAULT_BRAND.name} (${DEFAULT_BRAND.id})`);
};

const run = async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const dataSource = app.get(DataSource);

    await ensureCategory(dataSource.getRepository(TypeOrmCategoryEntity));
    await ensureBrand(dataSource.getRepository(TypeOrmBrandEntity));
  } finally {
    await app.close();
  }
};

void run();
