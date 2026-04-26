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
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=challenge_backend_bidcom
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true
```

## Base de datos local

Levantar PostgreSQL:

```bash
docker compose up -d postgres
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

## Docker

Solo base de datos para desarrollo local:

```bash
docker compose up -d postgres
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

## Arquitectura

El modulo de productos separa:

- `domain`: entidades y contratos de repositorio.
- `application`: casos de uso y comandos/queries.
- `infrastructure`: entidades TypeORM y adaptadores de persistencia.
- `presentation`: controllers y DTOs HTTP/Swagger.

El cache se implementa como decorator de `ProductRepository`, separando la politica de cache del adaptador TypeORM.

El proyecto sigue TDD, SOLID, Clean Architecture, clean code y lineamientos OOP definidos en `AGENTS.md`.
