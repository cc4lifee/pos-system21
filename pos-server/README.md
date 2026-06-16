# POS System - Backend API

API backend para un sistema de punto de venta (POS). Esta app administra productos,
categorias, usuarios, roles, ordenes de venta, promociones, pagos e inventario.

El servidor esta construido con Node.js, Express, TypeScript y Prisma sobre
PostgreSQL. Forma parte del monorepo `pos-system21`, junto con el frontend Angular
ubicado en `../pos-client`.

## Stack

- Node.js + TypeScript
- Express
- PostgreSQL
- Prisma ORM
- JWT para autenticacion
- bcrypt para contrasenas
- Railway/Supabase como opcion de despliegue

## Requisitos

- Node.js 18 o superior
- npm
- Una base de datos PostgreSQL disponible

Nota: este README anterior mencionaba Docker Compose, pero actualmente no existe un
`docker-compose.yml` en `pos-server`. Si quieres usar Docker localmente, agrega ese
archivo o configura PostgreSQL por tu cuenta.

## Instalacion local

Desde la raiz del monorepo:

```bash
cd pos-server
npm install
```

Crea el archivo de entorno:

```bash
cp .env.example .env
```

Ejemplo de variables:

```env
DATABASE_URL=postgres://posuser:pospass@localhost:5432/posdb
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:4200
API_VERSION=v1
JWT_SECRET=pos_system_jwt_secret
JWT_EXPIRES_IN=1h
```

Prepara Prisma y la base de datos:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Levanta el servidor:

```bash
npm run dev
```

La API queda disponible en:

```text
http://localhost:3000
http://localhost:3000/api/v1
```

## Scripts disponibles

```bash
npm run dev              # Servidor en modo desarrollo con tsx watch
npm run build            # Compila TypeScript a dist/
npm start                # Ejecuta dist/index.js
npm run db:generate      # Genera Prisma Client
npm run db:migrate       # Ejecuta migraciones en desarrollo
npm run db:migrate:prod  # Ejecuta migraciones en produccion
npm run db:push          # Sincroniza schema sin crear migracion
npm run db:seed          # Inserta datos iniciales
npm run db:studio        # Abre Prisma Studio
npm run db:add-constraints
npm run lint
```

## Autenticacion

La mayoria de rutas requieren un JWT en el header:

```http
Authorization: Bearer <token>
```

El token se obtiene con:

```http
POST /api/v1/auth/login
```

Usuarios creados por el seed:

```text
admin@posystem.com    / admin123    / ADMIN
cashier1@posystem.com / cashier123  / CASHIER
cashier2@posystem.com / cashier123  / CASHIER
```

Algunas rutas requieren roles especificos:

- `ADMIN`: administracion de usuarios y escritura de promociones.
- `ADMIN`, `MANAGER` o `STOCK`: ajustes de inventario.

## Endpoints

### Health

```http
GET /health
GET /
```

### Auth

```http
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Productos

```http
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

`DELETE` no elimina fisicamente el producto: marca `isActive=false`.

### Categorias

```http
GET    /api/v1/categories
GET    /api/v1/categories/:id
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

No se puede eliminar una categoria que tenga productos asignados.

### Usuarios

```http
GET  /api/v1/users
GET  /api/v1/users/:id
POST /api/v1/users
PUT  /api/v1/users/:id
```

`GET /users`, `POST /users` y `PUT /users/:id` requieren rol `ADMIN`.
Un usuario no administrador solo puede consultar su propio registro por ID.

### Ordenes

```http
GET   /api/v1/orders
GET   /api/v1/orders/:id
POST  /api/v1/orders
PATCH /api/v1/orders/:id/status
```

Estados permitidos:

```text
PENDING, COMPLETED, CANCELLED, REFUNDED
```

Metodos de pago permitidos:

```text
CASH, CARD, CHECK, TRANSFER
```

Al crear una orden, el backend valida productos, promociones, total y stock. Si un
producto tiene `trackInventory=true`, la venta descuenta inventario.

### Promociones

```http
GET  /api/v1/promotions
GET  /api/v1/promotions/:id
POST /api/v1/promotions
PUT  /api/v1/promotions/:id
```

Crear y actualizar promociones requiere rol `ADMIN`.

### Inventario

```http
POST /api/v1/inventory/adjust
GET  /api/v1/inventory/:productId/transactions
```

`POST /inventory/adjust` actualiza la cantidad de un producto y registra una
transaccion de inventario con cantidad anterior, cantidad nueva, cambio y motivo.

## Modelo de datos principal

El schema de Prisma esta en `prisma/schema.prisma`.

Entidades principales:

- `User` y `Role`
- `Product` y `Category`
- `Order`, `OrderItem` y `Payment`
- `Promotion`
- `InventoryTransaction`

Enums principales:

- `OrderStatus`: `PENDING`, `COMPLETED`, `CANCELLED`, `REFUNDED`
- `PaymentMethod`: `CASH`, `CARD`, `CHECK`, `TRANSFER`
- `PaymentStatus`: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
- `InventoryType`: `SALE`, `ADJUSTMENT`, `PURCHASE`, `RETURN`, `SPOILAGE`, `COUNT`

## Ejemplos rapidos

Login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@posystem.com","password":"admin123"}'
```

Crear producto:

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Latte",
    "description": "Cafe con leche vaporizada",
    "price": 3.8,
    "cost": 1.1,
    "quantity": 100,
    "categoryId": "<category-id>"
  }'
```

Ajustar inventario:

```bash
curl -X POST http://localhost:3000/api/v1/inventory/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "productId": "<product-id>",
    "newQuantity": 25,
    "reason": "Conteo fisico",
    "type": "COUNT"
  }'
```

## Estructura

```text
pos-server/
  prisma/
    migrations/
    schema.prisma
    seed.ts
  src/
    db/
      prisma.ts
    middleware/
      auth.ts
    routes/
      auth.ts
      categories.ts
      inventory.ts
      orders.ts
      products.ts
      promotions.ts
      users.ts
    types/
      express.d.ts
    index.ts
  package.json
  tsconfig.json
  .env.example
```

## Desarrollo

Despues de cambiar `prisma/schema.prisma`, crea una migracion:

```bash
npm run db:migrate -- --name nombre_de_la_migracion
```

Para inspeccionar la base de datos:

```bash
npm run db:studio
```

## Produccion

Variables minimas recomendadas:

```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-frontend.com
API_VERSION=v1
JWT_SECRET=<secreto-largo-y-privado>
JWT_EXPIRES_IN=1h
```

Antes de iniciar la app en produccion:

```bash
npm run db:migrate:prod
npm run build
npm start
```

Si se despliega en Railway dentro del monorepo, configura el root directory del
servicio como `pos-server`.

## Notas de seguridad pendientes

- Validacion de payloads con una libreria como Zod o Joi.
- Rate limiting para endpoints publicos como login.
- Revisar que el frontend envie siempre el header `Authorization`.
- Usar un `JWT_SECRET` fuerte en produccion.
- Evitar logs temporales en rutas de autenticacion antes de desplegar.
