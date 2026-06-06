# Tests de aislamiento multi-tenant

Este documento describe cómo verificar que el aislamiento por `org_id` + RLS funciona correctamente tras la migración 012 (Fase 2).

Los tests se ejecutan vía la Supabase Management API contra el proyecto `atribuya-dev` y simulan sesiones autenticadas con `set local request.jwt.claims`.

## Fixtures requeridas

1. **Migraciones 001-012 aplicadas** en el proyecto Supabase.
2. **Seed de orgs y locations**: `supabase/dev-seeds/01_orgs_and_locations.sql` (2 orgs, 4 locations).
3. **Seed de usuarios test**: `supabase/dev-seeds/02_test_users.sql` (5 profiles + 1 super_admin, con auth.users sintéticos).

## UUIDs sintéticos usados

| UUID | Rol | Org |
|---|---|---|
| `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | admin | Acme Promotora |
| `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | sales | Acme Promotora |
| `cccccccc-cccc-cccc-cccc-cccccccccccc` | reviews_manager | Acme Promotora |
| `dddddddd-dddd-dddd-dddd-dddddddddddd` | admin | Beta Apartamentos |
| `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee` | admin (sin org) | super_admin |

## Patrón de query

Cada test envía un bloque SQL al endpoint `/v1/projects/<ref>/database/query` con el patrón:

```sql
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}';
<query bajo prueba>;
rollback;
```

El `set local role authenticated` cambia el rol de la conexión a `authenticated` (que es el que el SDK usa con sesiones JWT), lo cual fuerza la aplicación de las policies RLS — el rol `postgres` (que usa la Management API por defecto) BYPASS RLS.

## Resultados esperados

Última corrida verde: **2026-05-24 — 15/15 tests pasan.**

| # | Como | Query | Esperado | Obtenido | Status |
|---|---|---|---|---|---|
| A1 | Admin Acme | `count(*) from locations` | 2 | 2 | ✅ |
| A2 | Admin Acme | `count(*) from organizations` | 1 | 1 | ✅ |
| A3 | Admin Acme | `count(*) from super_admins` | 0 | 0 | ✅ |
| B1 | Sales Acme | `count(*) from locations` | 2 | 2 | ✅ |
| B2 | Sales Acme | `count(*) from organizations` | 1 | 1 | ✅ |
| B3 | Sales Acme | self profile visible | 1 | 1 | ✅ |
| C1 | Manager Acme | `count(*) from locations` | 2 | 2 | ✅ |
| C2 | Manager Acme | `count(*) from organizations` | 1 | 1 | ✅ |
| C3 | Manager Acme | profiles en su org | 3 | 3 | ✅ |
| D1 | Admin Beta | `count(*) from locations` | 2 | 2 | ✅ |
| D2 | Admin Beta | `count(*) from organizations` | 1 | 1 | ✅ |
| D3 | Admin Beta | `name from organizations` | "Beta Apartamentos" | "Beta Apartamentos" | ✅ |
| E1 | Super Admin | `count(*) from locations` | 4 | 4 | ✅ |
| E2 | Super Admin | `count(*) from organizations` | 2 | 2 | ✅ |
| E3 | Super Admin | `count(*) from super_admins` | 1 | 1 | ✅ |

Lo crítico:
- **A vs D**: Admin Acme y Admin Beta ven SÓLO sus 2 locations cada uno, nunca las 4. **Aislamiento cross-org demostrado.**
- **A3 vs E3**: Un admin normal NO ve la tabla `super_admins`. Solo el propio super_admin la ve.
- **E1, E2**: super_admin ve TODO (4 locations, 2 orgs) — acceso transversal vía `is_super_admin()` en cada policy.

## Cómo correr los tests

Hay un snippet completo en el repo como referencia rápida — el bloque de comandos que generó la tabla de arriba está en el historial de Claude Code para Phase 2 (commit que añade este archivo). Para volver a correrlos:

```bash
PAT=<tu Personal Access Token sbp_*>
URL="https://api.supabase.com/v1/projects/iuiveiznvwjeoyhescmx/database/query"

# Aplicar fixtures si la BD se ha reseteado:
# (vía Management API enviando el contenido de cada .sql)
# supabase/dev-seeds/01_orgs_and_locations.sql
# supabase/dev-seeds/02_test_users.sql

# Ejemplo de un test:
curl -s -X POST "$URL" \
  -H "Authorization: Bearer $PAT" \
  -H "Content-Type: application/json" \
  -d '{"query":"begin; set local role authenticated; set local request.jwt.claims = '"'"'{\"sub\":\"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa\",\"role\":\"authenticated\"}'"'"'; select count(*)::int as n from public.locations; rollback;"}'
# → [{"n":2}]
```

## Deuda conocida

- **`audit_log_self_insert`**: la policy de inserción en `audit_log` permite a cualquier usuario insertar con `actor_id = auth.uid()` pero **NO filtra por `org_id`**. En la práctica `recordAudit()` corre via service-role y la deuda es teórica, pero conviene corregirlo cuando reescribamos el helper de audit (Fase 3 o 5).

- **`set not null` de `org_id`**: la sección 9 de la migración 012 deja como comentario los `alter table ... alter column org_id set not null`. Aplicar cuando hayamos hecho los seeds finales de PROD (Fase 9 onwards).
