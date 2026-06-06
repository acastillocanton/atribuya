-- ============================================================================
-- pre-011 — rollback script para revertir la migración 011
-- ============================================================================
--
-- Este archivo NO es un pg_dump completo (no había Docker disponible en la
-- máquina donde se aplicó 011). En su lugar, contiene los DROPs exactos que
-- revierten la migración 011 al estado post-010.
--
-- El estado post-010 es DETERMINISTA: aplicar las migraciones
--   supabase/migrations/001_initial_schema.sql
--   ... hasta
--   supabase/migrations/010_review_removed_at.sql
-- en orden, en un proyecto Supabase vacío, reproduce el mismo estado al 100%.
--
-- Por tanto, ante una catástrofe en 011:
--   1. Ejecutar este archivo en el SQL Editor del dashboard, o
--   2. Reset del proyecto Supabase y re-apply de 001-010 vía
--      `supabase db push --linked`.
--
-- Aplicado por primera vez el: 2026-05-24
-- Proyecto Supabase: atribuya-dev (iuiveiznvwjeoyhescmx)
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Drop functions
-- ---------------------------------------------------------------------------
drop function if exists public.current_org_id();
drop function if exists public.is_super_admin();

-- ---------------------------------------------------------------------------
-- 2. Drop org_id columns (cascade indexes & FKs)
-- ---------------------------------------------------------------------------
alter table public.audit_log    drop column if exists org_id;
alter table public.reviews      drop column if exists org_id;
alter table public.share_links  drop column if exists org_id;
alter table public.clients      drop column if exists org_id;
alter table public.profiles     drop column if exists org_id;
alter table public.locations    drop column if exists org_id;

-- ---------------------------------------------------------------------------
-- 3. Drop super_admins
-- ---------------------------------------------------------------------------
drop table if exists public.super_admins;

-- ---------------------------------------------------------------------------
-- 4. Drop trigger + touch_updated_at function
-- ---------------------------------------------------------------------------
drop trigger if exists organizations_touch_updated_at on public.organizations;
drop function if exists public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Drop organizations table + status enum
-- ---------------------------------------------------------------------------
drop table if exists public.organizations;
drop type  if exists public.org_status_enum;

-- ---------------------------------------------------------------------------
-- 6. Remove 011 from the migration history table so `supabase db push`
--    re-applies it cleanly the next time.
-- ---------------------------------------------------------------------------
delete from supabase_migrations.schema_migrations where version = '011';

commit;

-- ============================================================================
-- Post-rollback verification queries (run manually):
--
--   select to_regclass('public.organizations');             -- → NULL
--   select to_regclass('public.super_admins');              -- → NULL
--   select column_name from information_schema.columns
--     where table_schema='public' and column_name='org_id'; -- → 0 rows
--   select proname from pg_proc
--     where proname in ('current_org_id','is_super_admin'); -- → 0 rows
-- ============================================================================
