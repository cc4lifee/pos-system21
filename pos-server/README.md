# POS System - Backend API

Backend API para el sistema de punto de venta construido con Node.js, Express y Prisma.

## 🚀 Stack Tecnológico

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Desarrollo**: Docker + Docker Compose
- **Deploy**: Railway (Backend) + Supabase (Base de Datos)

## 📋 Requisitos

- Node.js 18+
- Docker y Docker Compose (para desarrollo)
- npm o yarn

## 🛠️ Instalación Local

### 1. Instalar dependencias

```bash
cd pos-server
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con los valores locales (ya debe estar configurado para Docker):

```env
DATABASE_URL=postgres://posuser:pospass@localhost:5432/posdb
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:4200
API_VERSION=v1
```

### 3. Levantar PostgreSQL con Docker

```bash
docker-compose up -d
```

Verifica la conexión:

```bash
docker-compose ps
```

Accede a pgAdmin (web UI para Postgres):

- URL: http://localhost:5050
- Email: admin@example.com
- Password: admin

### 4. Crear esquema de base de datos y aplicar migraciones

```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed (datos iniciales)

```bash
npm run db:seed
```

### 6. Iniciar servidor de desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📡 Endpoints Principales

### Health Check

```
GET /health
```

### Productos

```
GET    /api/v1/products          # Listar todos
GET    /api/v1/products/:id      # Obtener uno
POST   /api/v1/products          # Crear
PUT    /api/v1/products/:id      # Actualizar
DELETE /api/v1/products/:id      # Eliminar (soft delete)
```

### Usuarios

```
GET    /api/v1/users             # Listar todos
GET    /api/v1/users/:id         # Obtener uno
POST   /api/v1/users             # Crear
PUT    /api/v1/users/:id         # Actualizar
```

### Órdenes

```
GET    /api/v1/orders            # Listar todas
GET    /api/v1/orders/:id        # Obtener una
POST   /api/v1/orders            # Crear
PATCH  /api/v1/orders/:id/status # Cambiar estado
```

## 🗄️ Estructura de Archivos

```
pos-server/
├── src/
│   ├── index.ts              # Servidor principal
│   ├── db/
│   │   └── prisma.ts         # Cliente Prisma (singleton)
│   ├── routes/
│   │   ├── products.ts       # Rutas de productos
│   │   ├── users.ts          # Rutas de usuarios
│   │   └── orders.ts         # Rutas de órdenes
│   └── middleware/           # Middlewares personalizados
├── prisma/
│   ├── schema.prisma         # Esquema de BD
│   └── seed.ts               # Script de seed
├── docker-compose.yml        # Configuración Docker
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔄 Flujo de Desarrollo

### Crear una nueva migración

Después de editar `prisma/schema.prisma`:

```bash
npm run db:migrate -- --name nombre_migracion
```

### Visualizar BD con Prisma Studio

```bash
npm run db:studio
```

Se abrirá `http://localhost:5555` con UI interactiva.

### Detener y limpiar Docker

```bash
docker-compose down
docker-compose down -v  # También elimina volúmenes (BD)
```

## 🚀 Deploy en Production (Railway)

### 1. Conectar repo a Railway

- Crea cuenta en [railway.app](https://railway.app)
- Conecta tu repo de GitHub
- Railway detecta automáticamente Node.js

### 2. Configurar variables de entorno en Railway

En el dashboard de Railway, añade:

```
DATABASE_URL=postgresql://...@...@verceldb.com/...  # Supabase
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-dominio.vercel.app
API_VERSION=v1
```

### 3. Railway ejecutará automáticamente:

- `npm install`
- `npm run build`
- `npm start`

**Nota**: Railway ejecuta migraciones automáticamente si añades un servicio PostgreSQL, pero con Supabase externa, ejecuta manualmente o usa GitHub Actions (ver abajo).

### 4. Ejecutar migraciones en producción (GitHub Actions)

Crea `.github/workflows/migrate.yml`:

```yaml
name: Migrate Database

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: cd pos-server && npm ci
      - run: cd pos-server && npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}
```

## 🗂️ Base de Datos: Desarrollo vs Producción

### Desarrollo: Docker + Postgres Local

```bash
docker-compose up -d
```

- Rápido, sin conexión internet requerida
- Datos se pierden al hacer `docker-compose down -v`
- Ideal para desarrollo y testing

### Producción: Supabase

1. Crea proyecto en [supabase.com](https://supabase.com)
2. Obtén `DATABASE_URL` desde Settings → Database
3. Asigna a `DATABASE_URL` en Railway
4. Supabase maneja backups automáticos

## 🔐 Seguridad (Checklist)

- [ ] Encriptar contraseñas con `bcrypt` antes de guardar
- [ ] Añadir autenticación JWT
- [ ] Validar inputs (usar `zod` o `joi`)
- [ ] Implementar rate limiting
- [ ] HTTPS en producción
- [ ] CORS configurado correctamente
- [ ] Secretos en variables de entorno (nunca en código)
- [ ] Logs y monitoreo (Sentry, New Relic)

## 📚 Recursos

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Railway Deploy](https://docs.railway.app/)
- [Supabase Docs](https://supabase.com/docs)

## 📝 Ejemplo de Request

```bash
# Crear producto
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD001",
    "name": "Laptop",
    "price": 999.99,
    "quantity": 5
  }'
```

---

Made with ❤️ for POS Systems
