# Atribuya

**SaaS B2B multi-tenant para atribuir las reseñas de Google Business Profile a comerciales individuales.**

Empresas con red comercial (promotoras inmobiliarias, apartamentos turísticos, clínicas) reciben reseñas de Google pero hoy no pueden saber qué comercial las ha conseguido. Atribuya automatiza esa atribución por ventana temporal + similitud de nombres.

## Stack

- Next.js 15.5 App Router + TypeScript strict
- Supabase (Postgres + Auth + RLS)
- Google Places API + Google Business Profile API
- Brevo SMTP · Vercel Pro + Crons

## Documentación

- [`CLAUDE.md`](CLAUDE.md) — contexto del proyecto, reglas, estado por fases.
- [`spec.md`](spec.md) — fuente de verdad del producto.
- [`docs/tests-multitenancy.md`](docs/tests-multitenancy.md) — cómo se verifica el aislamiento RLS.
- [`docs/handoff/`](docs/handoff/) — estado actual del proyecto para retomar.

## Scripts

```bash
npm install
npm run dev          # dev server con Turbopack
npm run build        # build producción
npm run typecheck    # tsc --noEmit
npm run lint
npm test             # vitest
```

Ver `CLAUDE.md §2` para más detalles.

## Autoría

Atribuya es un producto desarrollado por **Castillo Cantón** ([castillocanton.com](https://castillocanton.com)). Todo el código y la propiedad intelectual son propios.
