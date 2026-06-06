-- ============================================================================
-- pre-012 — rollback script para revertir la migración 012
-- ============================================================================
--
-- Este archivo NO es un pg_dump completo (no había Docker disponible al
-- aplicar 012). Documenta los cambios reversibles. Para un rollback total
-- al estado post-011, ejecutar este script Y RE-APLICAR las migraciones
-- legacy de RLS (002, 005, 006, 008) que la 012 había reescrito.
--
-- Estado al que volvemos: post-011 (organizations + super_admins existen
-- y org_id existe en las tablas de negocio, PERO las policies RLS son las
-- single-tenant originales del esquema base).
--
-- Aplicado por primera vez el: 2026-05-24
-- Proyecto Supabase: atribuya-dev (iuiveiznvwjeoyhescmx)
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Drop policies NUEVAS introducidas por la migración 012
--    (las que NO existían en single-tenant)
-- ---------------------------------------------------------------------------
drop policy if exists organizations_own_select        on public.organizations;
drop policy if exists organizations_super_admin_all   on public.organizations;
drop policy if exists super_admins_super_admin_all    on public.super_admins;
drop policy if exists share_links_manager_select      on public.share_links;

-- ---------------------------------------------------------------------------
-- 2. Drop policies RECREADAS con filtro org_id por la 012
--    (la re-aplicación de las migraciones legacy las vuelve a crear con
--    `create policy ... drop if exists` previo en algunos casos, pero por
--    seguridad las dropeamos explícitamente aquí.)
-- ---------------------------------------------------------------------------
drop policy if exists locations_admin_all              on public.locations;
drop policy if exists locations_select_others          on public.locations;
drop policy if exists profiles_admin_all               on public.profiles;
drop policy if exists profiles_self_select             on public.profiles;
drop policy if exists profiles_self_update             on public.profiles;
drop policy if exists profiles_manager_select          on public.profiles;
drop policy if exists profiles_manager_insert_sales    on public.profiles;
drop policy if exists profiles_manager_update_sales    on public.profiles;
drop policy if exists profiles_manager_delete_sales    on public.profiles;
drop policy if exists clients_admin_all                on public.clients;
drop policy if exists clients_sales_own                on public.clients;
drop policy if exists clients_manager_select           on public.clients;
drop policy if exists share_links_admin_all            on public.share_links;
drop policy if exists share_links_sales_own_select     on public.share_links;
drop policy if exists reviews_admin_all                on public.reviews;
drop policy if exists reviews_sales_own_select         on public.reviews;
drop policy if exists reviews_manager_select           on public.reviews;
drop policy if exists audit_log_admin_select           on public.audit_log;

-- ---------------------------------------------------------------------------
-- 3. Desactivar RLS en las tablas que 012 había habilitado por primera vez
-- ---------------------------------------------------------------------------
alter table public.organizations disable row level security;
alter table public.super_admins  disable row level security;

-- ---------------------------------------------------------------------------
-- 4. Quitar 012 del historial de migraciones de Supabase para que
--    `supabase db push --linked` la considere pendiente.
-- ---------------------------------------------------------------------------
delete from supabase_migrations.schema_migrations where version = '012';

commit;

-- ============================================================================
-- Paso siguiente: re-aplicar las policies legacy single-tenant
-- ============================================================================
--
-- Después de ejecutar este script, las tablas de negocio quedan SIN policies
-- (porque las dropeamos en §2). Para restaurar las originales, ejecutar en
-- orden el bloque CREATE POLICY de cada una de estas migraciones:
--
--   supabase/migrations/002_rls_policies.sql
--   supabase/migrations/005_manager_sales_admin.sql
--   supabase/migrations/006_profile_avatars.sql   -- (puede que no tenga policies, revisar)
--   supabase/migrations/008_audit_log_insert_policy.sql
--
-- Las 4 ya usan `drop policy if exists` antes de cada `create policy`, así que
-- son idempotentes y se pueden ejecutar tal cual desde el SQL Editor del
-- dashboard o vía Management API.
--
-- Verificación post-rollback (debería devolver 19 policies, no las 22 de 012):
--
--   select count(*) from pg_policies where schemaname='public';
--   select tablename, policyname from pg_policies where schemaname='public' order by 1,2;
--
-- ============================================================================
