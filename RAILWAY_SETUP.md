# Railway vs Vercel Serverless para Backend POS

## ¿Qué es Railway?

Railway es una plataforma de deployment moderno que permite desplegar aplicaciones backend tradicionales con facilidad. Es similar a Heroku pero con mejor UX y mejor soporte para monorepos.

**Ventajas de Railway sobre Vercel Serverless:**

| Aspecto       | Railway                           | Vercel Serverless                    |
| ------------- | --------------------------------- | ------------------------------------ |
| Tipo          | Servidor persistente (contenedor) | Serverless (functions)               |
| Cold starts   | No (servidor siempre activo)      | Sí (demora inicial)                  |
| Conexiones DB | Múltiples conexiones simultáneas  | Limitadas (requiere pooling)         |
| WebSockets    | ✅ Soportados                     | ❌ No (limitado)                     |
| Precio        | $5-500/mes (pay-as-you-go)        | Pago por invocación + almacenamiento |
| Monorepo      | ✅ Fácil (selecciona carpeta)     | ⚠️ Complejo con serverless           |
| Logs          | Real-time via dashboard           | CloudWatch (menos intuitivo)         |

## Flujo de Deploy: Monorepo en Railway

Tu estructura actual:

```
pos-system21/
├── src/                  ← Frontend Angular
├── angular.json
├── package.json          ← Frontend deps
└── pos-server/           ← Backend Node.js
    ├── src/
    ├── package.json      ← Backend deps
    └── docker-compose.yml
```

### Paso 1: Crear cuenta en Railway

1. Ir a [railway.app](https://railway.app)
2. Sign up con GitHub
3. Autorizar Railway a acceder a tu repo

### Paso 2: Crear nuevo proyecto en Railway

1. Dashboard → New Project
2. Selecciona "Deploy from GitHub"
3. Elige tu repo `pos-system21`
4. Railway auto-detecta que tiene Node.js

### Paso 3: Configurar root path

**Aquí es donde Railway brilla con monorepos:**

1. En el dashboard del proyecto, abre el servicio Node.js
2. Ve a Settings → Source
3. En "Root Directory" escribe: `pos-server`
4. Railway ahora ejecutará:
   - `npm install` (dentro de `pos-server/`)
   - `npm run build` (detección automática)
   - `npm start`

### Paso 4: Variables de entorno

En el dashboard:

```
DATABASE_URL = postgresql://user:pass@db.supabase.co/postgres
NODE_ENV = production
PORT = 3000
CORS_ORIGIN = https://tu-frontend.vercel.app
```

### Paso 5: Conectar Supabase

1. Crea proyecto en [supabase.com](https://supabase.com)
2. En Supabase → Settings → Database → Connection string
3. Copia la URL (incluye usuario + contraseña)
4. Pégala como `DATABASE_URL` en Railway

### Paso 6: Deploy automático

Cada `git push` a main:

1. Railway detecta cambios
2. Instala dependencias
3. Ejecuta `npm run build`
4. Inicia la app
5. Genera URL pública: `https://pos-server-prod.railway.app`

## Migraciones automáticas en Production

Hay 2 opciones:

### Opción A: Build script en Railway (recomendado)

En `pos-server/package.json`, modifica:

```json
{
  "scripts": {
    "build": "tsc && npx prisma migrate deploy",
    "start": "node dist/index.js"
  }
}
```

Railway ejecutará `npm run build` que ya incluye migraciones.

### Opción B: GitHub Actions (más control)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - "pos-server/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd pos-server && npm ci
      - run: cd pos-server && npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}
      - name: Trigger Railway deploy
        run: |
          curl -X POST https://api.railway.app/webhooks/deploy \
            -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}"
```

## Configuración Final: Supabase + Railway

```
┌─────────────────────────────────────┐
│   GitHub Repo (Monorepo)            │
│  ├── src/          (Angular)        │
│  └── pos-server/   (Node.js)        │
└─────────────────────────────────────┘
         ↓ git push
    ┌─────────────┐    ┌─────────────┐
    │   Railway   │───→│  Supabase   │
    │ (Backend)   │    │ (Database)  │
    └─────────────┘    └─────────────┘
         ↑
    Vercel (Frontend)
```

### URLs finales:

- **Frontend**: https://pos-system21.vercel.app
- **Backend API**: https://pos-server-prod.railway.app
- **Base de datos**: Supabase PostgreSQL (conexión privada desde Railway)

## Costos Estimados (mes)

| Servicio     | Uso                          | Costo       |
| ------------ | ---------------------------- | ----------- |
| **Railway**  | 500 GB-hrs + 100 ejecutables | ~$20-50     |
| **Supabase** | BD hasta 5GB + API           | $25         |
| **Vercel**   | Frontend (siempre free)      | $0          |
| **Total**    | -                            | ~$50-80/mes |

_(Supabase free tier: 500MB BD, suficiente para MVP)_

## Comandos Quick Reference

### Local con Docker:

```bash
# Desarrollo
docker-compose -f pos-server/docker-compose.yml up -d
cd pos-server
npm install
npm run db:migrate
npm run db:seed
npm run dev

# Detener
docker-compose -f pos-server/docker-compose.yml down
```

### Deploy a Railway:

```bash
# Solo con git push (CI/CD automático)
git add .
git commit -m "feat: add backend API"
git push origin main
```

Railway automáticamente:

1. Detecta cambios en `pos-server/`
2. Instala, compila, migra y despliega
3. Publica logs en real-time

### Monitoreo en Railway:

```
Dashboard → Tu Proyecto → Backend service
- Logs en vivo
- Métricas (CPU, memoria)
- Environment variables
- Domain/URL pública
```

## Diferencia: Docker para DESARROLLO vs RAILWAY para PRODUCCIÓN

| Fase           | Herramienta            | Propósito                                   |
| -------------- | ---------------------- | ------------------------------------------- |
| **Desarrollo** | Docker Compose (local) | Simular prod sin internet, rápido iterativo |
| **Testing**    | Docker Compose (CI)    | Pruebas reproducibles                       |
| **Producción** | Railway + Supabase     | Escalable, managed, backups automáticos     |

**NO** necesitas Dockerfile en `pos-server/`. Railway auto-detecta Node.js y crea su propio contenedor.

## Siguiente Paso

1. Crea cuenta en Railway
2. Crea proyecto Supabase (free tier)
3. Conecta tu repo a Railway y selecciona `pos-server` como root
4. Configura variables de entorno
5. Haz `git push` y Railway despliega automáticamente

¿Tienes dudas sobre Railway o Supabase? Te puedo ayudar a configurarlos.
