# TuFinanciera - Documentación del Proyecto

## Estructura del Monorepo

```
tufinanciera/
├── package.json          # Scripts raíz: dev, build, setup, lint
├── AGENTS.md             # Esta documentación
├── README.md
├── .gitignore
├── backend/              # Express + TypeScript + Supabase (puerto 3001)
├── frontend/             # React 18 + Vite + Tailwind + Zustand (puerto 5173)
└── landing/              # React 19 + Vite + JS + PWA (puerto 5174)
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia backend (3001) y frontend (5173) concurrentemente |
| `npm run dev:backend` | Solo backend con tsx watch |
| `npm run dev:frontend` | Solo frontend con vite |
| `npm run build` | Build de backend (tsc) y frontend (vite) |
| `npm run setup` | Instala dependencias, genera Prisma, pushea DB |
| `npm run lint` | Lintea backend y frontend |

## Arquitectura

### Backend (Express + TypeScript + Supabase/PostgreSQL)
- **Express** con CORS, Helmet, Morgan, Rate Limit
- **TypeScript** estricto (noUnusedLocals, noUnusedParameters)
- **Dos patrones de acceso a DB**:
  - `prisma.ts`: Wrapper custom que traduce camelCase ↔ snake_case para Supabase. Soporta findMany, findUnique, findFirst, create, update, delete, aggregate, groupBy, upsert.
  - `supabase.ts`: Cliente @supabase/supabase-js crudo (snake_case). Usado para tablas de inversores (creadas con SQL raw).
- **Auth**: JWT con 3 roles: ADMIN, INVESTOR, CLIENT
- **Validación**: Zod schemas
- **PDF**: PDFKit para reportes y recibos
- **Cron**: node-cron diario a medianoche para acreditaciones de inversores

### Frontend (React 18 + Vite + TypeScript)
- **Zustand** con persist para estado de autenticación
- **TanStack Query** para fetching de datos
- **React Router DOM v6** con Layout protegido
- **Recharts** para gráficos
- **Tailwind** con tema oscuro profesional
- **Proxy** de Vite: /api → localhost:3001

### Landing (React 19 + Vite + JavaScript + PWA)
- Sin TypeScript (JS plano)
- PWA con vite-plugin-pwa (autoUpdate, CacheFirst para Google Fonts)
- Modales para solicitar préstamo, cotizador, login inversor, login cliente
- ChatBot con quick replies e intents por regex
- SEO con Open Graph, Twitter Cards, JSON-LD

## Patrones de Acceso a DB

### prisma.ts (Wrapper custom)
- Traduce camelCase a snake_case para queries
- Mapeo de modelos: client→clients, loan→loans, payment→payments, etc.
- **IMPORTANTE**: create/update SIEMPRE setean createdAt y updatedAt
- **NO usar** para tablas sin esas columnas: payments, cash_entries, expenses, notifications, expense_categories, settings

### supabase.ts (Crudo)
- Cliente Supabase directo, usa snake_case
- Usado para tablas de inversores: investors, investor_movements, investor_accruals, investor_payouts
- Resuelve env vars con fallback a VITE_ prefixed

## Auth

- **ADMIN**: Login con name/email + password. Seed inicial: Marcelo / Milo@7590
- **INVESTOR**: Login con DNI + password (tabla investors, columna password)
- **CLIENT**: Login con DNI + password (tabla clients, columna password, requiere préstamo ACTIVE)

JWT con payload: { userId, role }
Expiración: 8h (configurable via JWT_EXPIRES_IN)

## Deploy en Vercel

3 proyectos separados:

| Proyecto | URL | Tipo |
|----------|-----|------|
| Frontend | app.tufinanciera.com | SPA con rewrites |
| Backend | tufinanciera-api.vercel.app | Serverless via api/index.ts |
| Landing | tufinanciera.com | Estático |

### Backend en Vercel
- `api/index.ts` exporta la app Express como Serverless Function
- tsconfig NO incluye api/ en include (rompe rootDir)
- maxDuration: 30s

## Convenciones Clave

1. **TS estricto** en backend y frontend (noUnusedLocals, noUnusedParameters)
2. **Landing es JS plano** - sin tsc, sin typecheck
3. **prisma.ts create/update** SIEMPRE setea createdAt y updatedAt → NO usar en tablas sin esas columnas
4. **Tablas inversores** son snake_case (creadas con SQL, no Prisma)
5. **Tabla clients** es camelCase (Prisma migration)
6. **Dashboard totalInvestors**: cuenta grupos distintos de clientId + inversores standalone (sin clientId)
7. **Admin seed**: Marcelo / Milo@7590 (idempotente)
