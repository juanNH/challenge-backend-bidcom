import * as Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  SWAGGER_PATH: Joi.string().default('docs'),
  API_BASE_URL: Joi.string().uri().default('http://localhost:3000'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_NAME: Joi.string().default('challenge_backend_bidcom'),
  DB_SCHEMA: Joi.string().default('public'),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_MIGRATIONS_RUN: Joi.boolean().default(false),
  POSTGRES_PORT: Joi.number().port().default(5432),
  CACHE_ENABLED: Joi.boolean().default(false),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_EXTERNAL_PORT: Joi.number().port().default(6379),
  CACHE_OPERATION_TIMEOUT_MS: Joi.number().integer().min(1).default(200),
  CACHE_PRODUCT_TTL_SECONDS: Joi.number().integer().min(1).default(120),
  CACHE_COLLECTION_TTL_SECONDS: Joi.number().integer().min(1).default(45),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),
  LOG_PRETTY: Joi.boolean().default(true),
  TEST_LOGS_ENABLED: Joi.boolean().default(false),
  THROTTLE_TTL_MS: Joi.number().integer().min(1).default(60000),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(100),
});
