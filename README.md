# TuFinanciera

Sistema de gestion de creditos y cobranzas. Monorepo con backend (Express + TypeScript + Supabase), frontend (React + Vite + Tailwind) y landing page (React + JS + PWA).

## Stack

### Backend
- Express 4 + TypeScript 5
- Supabase (PostgreSQL) con Prisma-style wrapper
- JWT, Zod, PDFKit, node-cron

### Frontend
- React 18 + TypeScript + Vite 6
- Zustand, TanStack Query, Recharts
- Tailwind CSS tema oscuro

### Landing
- React 19 + JavaScript + Vite 8
- PWA con vite-plugin-pwa
- ChatBot interactivo

## Comandos

- `npm run dev` - Inicia backend y frontend
- `npm run build` - Build completo
- `npm run setup` - Instala dependencias y configura DB
- `npm run lint` - Lintea backend y frontend

## Estructura

tufinanciera/
+-- backend/    # API REST (puerto 3001)
+-- frontend/   # Panel admin (puerto 5173)
+-- landing/    # Pagina publica (puerto 5174)
