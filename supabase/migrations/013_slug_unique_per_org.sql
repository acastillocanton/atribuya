-- ============================================================================
-- Migration 013 — profiles.slug: UNIQUE global  →  UNIQUE per (org_id, slug)
-- ============================================================================
--
-- En el modelo single-tenant original todos los sales/managers viven en una sola
-- empresa, así que `profiles.slug` UNIQUE global era razonable: bloqueaba
-- duplicados involuntarios entre comerciales de la misma org.
--
-- En multi-tenant es una limitación grave: dos clientes del SaaS (org A y
-- org B) no podrían tener sendos comerciales con slug "juan-perez". Y como
-- la landing pública usa el slug en la URL, no había alternativa.
--
-- Esta migración:
--   1. Quita el UNIQUE global de `profiles.slug`.
--   2. Añade UNIQUE per (org_id, slug) — solo cuando org_id IS NOT NULL.
--      Los super_admins (org_id NULL) NO entran en el constraint; en la
--      práctica su slug también es único globalmente porque son pocos y los
--      damos de alta a mano, pero no se enforcea para no chocar con el
--      modelo "super_admin sin org".
--
-- Requisitos para aplicar sin conflictos:
--   - Todas las filas existentes con un slug duplicado al hacer el cambio
--     deberían tener org_id distintos. En atribuya-dev hoy no hay duplicados
--     (todos los slugs del seed son distintos).
--
-- Aplicar en una sola transacción.

begin;

-- ---------------------------------------------------------------------------
-- 1. Quitar el UNIQUE global heredado
-- ---------------------------------------------------------------------------
-- El nombre del constraint generado por postgres en la 001 es
-- "profiles_slug_key" (patrón estándar para columnas declaradas con UNIQUE
-- en CREATE TABLE).
alter table public.profiles drop constraint if exists profiles_slug_key;

-- ---------------------------------------------------------------------------
-- 2. UNIQUE compuesto por (org_id, slug) — partial: solo cuando org_id IS NOT NULL
-- ---------------------------------------------------------------------------
-- Postgres no acepta CHECK NULL en UNIQUE compuesto directamente, pero un
-- UNIQUE INDEX parcial sí. Filas con org_id NULL no entran al índice y por
-- tanto no chocan entre sí (caso super_admin).
create unique index if not exists profiles_org_slug_unique
  on public.profiles (org_id, slug)
  where org_id is not null;

comment on index public.profiles_org_slug_unique is
  'Cada org tiene su propio espacio de slugs para comerciales/managers. Super_admins (org_id NULL) quedan fuera del constraint.';

commit;

-- ============================================================================
-- Post-apply verification:
--
--   -- 1. El constraint global se ha ido:
--   select conname from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_slug_key';
--   -- → 0 rows
--
--   -- 2. El nuevo índice existe:
--   select indexname from pg_indexes where tablename = 'profiles' and indexname = 'profiles_org_slug_unique';
--   -- → 1 row
--
--   -- 3. Smoke test (debería fallar el segundo INSERT):
--   --    Crear dos profiles con slug='juan' en dos orgs DIFERENTES debe pasar.
--   --    Crear dos profiles con slug='juan' en la MISMA org debe fallar con
--   --    error 23505 (duplicate key violation).
-- ============================================================================
