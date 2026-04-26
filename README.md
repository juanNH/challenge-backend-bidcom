# challenge-backend-bidcom

API backend en NestJS para gestion de productos, organizada con Clean Architecture, TypeORM y PostgreSQL.

## Requisitos

- Node.js 22+
- pnpm via Corepack
- Docker y Docker Compose

## Instalacion

```bash
corepack enable
pnpm install
```

Si no existe `.env`, crearlo desde el ejemplo:

```powershell
Copy-Item .env.example .env
```

Valores principales para desarrollo:

```env
NODE_ENV=development
PORT=3000
SWAGGER_PATH=docs
API_BASE_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=challenge_backend_bidcom
DB_SCHEMA=public
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_MIGRATIONS_RUN=true
POSTGRES_PORT=5432
CACHE_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_EXTERNAL_PORT=6379
CACHE_OPERATION_TIMEOUT_MS=200
CACHE_PRODUCT_TTL_SECONDS=120
CACHE_COLLECTION_TTL_SECONDS=45
LOG_LEVEL=info
LOG_PRETTY=true
TEST_LOGS_ENABLED=false
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=100
```

## Base de datos local

Levantar PostgreSQL y Redis:

```bash
docker compose up -d postgres redis
```

Con `DB_MIGRATIONS_RUN=true`, TypeORM ejecuta las migraciones pendientes cuando la app o el seed inicializan la conexion.

## Seed de desarrollo

Crear los datos minimos para poder crear productos desde Swagger:

```bash
pnpm seed:dev
```

El seed crea, si no existen:

```text
Category: Electronics
categoryId: 11111111-1111-4111-8111-111111111111

Brand: Lenovo
brandId: 22222222-2222-4222-8222-222222222222
```

Ejemplo de body para `POST /products`:

```json
{
  "name": "Laptop",
  "description": "Laptop de 16GB RAM",
  "price": 1200.5,
  "stock": 10,
  "categoryId": "11111111-1111-4111-8111-111111111111",
  "brandId": "22222222-2222-4222-8222-222222222222"
}
```

## Ejecutar la app

```bash
pnpm start:dev
```

URLs locales:

```text
API: http://localhost:3000
Swagger: http://localhost:3000/docs
Swagger JSON: http://localhost:3000/docs-json
Health: http://localhost:3000/health
```

## Tests

```bash
pnpm test
pnpm test:e2e
pnpm lint
pnpm build
```

Los tests de integracion usan SQLite en memoria. No requieren Docker ni PostgreSQL.

Para correr un archivo e2e puntual:

```bash
pnpm test:e2e -- --runTestsByPath test/products.e2e-spec.ts --verbose
```

En `NODE_ENV=test` los logs se silencian por defecto para que los errores esperados, como tests de 400/404, no ensucien la salida. Si se necesita diagnosticar un test:

```env
TEST_LOGS_ENABLED=true
```

## Docker

Solo infraestructura para desarrollo local:

```bash
docker compose up -d postgres redis
```

App + base de datos:

```bash
docker compose up --build
```

El compose tambien levanta Redis para cache de lecturas. La API usa cache-aside sobre demanda con TTL bajo:

- `GET /products/:id`: cache por producto durante 120 segundos.
- `GET /products` y `GET /products/search`: cache de colecciones/busquedas durante 45 segundos.
- `POST`, `PUT`, `PATCH` y `DELETE`: invalidan el producto afectado y los caches de colecciones/busquedas.

Para desarrollo local sin Docker se puede desactivar con:

```env
CACHE_ENABLED=false
```

Si Redis no esta disponible, la app sigue funcionando sin cache efectivo. Las operaciones de cache tienen timeout corto para no bloquear las requests.

## Logging y trazabilidad

La app usa Pino mediante `nestjs-pino`.

- Cada request se loguea con metodo, URL, parametros, query, body sanitizado, status code y duracion.
- Los errores se centralizan en `StandardErrorFilter` y devuelven un formato uniforme: `error`, `code`, `traceId`.
- Los errores de JSON invalido incluyen el `rawBody` truncado en logs para diagnosticar payloads mal formados.
- Campos sensibles se sanitizan antes de escribir logs.

Cada operacion HTTP recibe un `traceId`:

- Si el cliente envia `x-trace-id`, se reutiliza.
- Si no lo envia, se genera un UUID.
- La respuesta siempre incluye el header `x-trace-id`.
- Los logs de controller, cache y repositorio incluyen ese mismo `traceId`.

## Rate limiting

La app aplica rate limiting global con `@nestjs/throttler`.

```env
THROTTLE_TTL_MS= 10000
THROTTLE_LIMIT=10
```

Por defecto permite 10 requests por origen cada 10 segundos a modo de prueba de funcionalidad. El endpoint `/health` queda excluido para no afectar health checks de infraestructura.

Al superar el limite, la API responde `429` con el mismo formato estandar de error.

## Arquitectura

El modulo de productos separa:

- `domain`: entidades y contratos de repositorio.
- `application`: casos de uso y comandos/queries.
- `infrastructure`: entidades TypeORM y adaptadores de persistencia.
- `presentation`: controllers y DTOs HTTP/Swagger.

El cache se implementa como decorator de `ProductRepository`, separando la politica de cache del adaptador TypeORM.

Los endpoints principales son:

- `GET /products`
- `GET /products/search`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`

El proyecto sigue TDD, SOLID, Clean Architecture, clean code y lineamientos OOP definidos en `AGENTS.md`.
