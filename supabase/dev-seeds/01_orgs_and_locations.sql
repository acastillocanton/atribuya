-- ============================================================================
-- DEV SEED 01 — orgs ficticias + locations para probar multi-tenant
-- ============================================================================
--
-- NO es una migración. Vive aparte (supabase/dev-seeds/) para no aplicarse
-- accidentalmente en producción. Solo sirve para poblar atribuya-dev con
-- datos ficticios y poder verificar el aislamiento entre orgs.
--
-- Es idempotente: borra las locations heredadas del seed 003 (demo) y
-- recrea desde cero las orgs y locations ficticias.
--
-- Aplicación: vía Supabase Management API
--   POST https://api.supabase.com/v1/projects/<ref>/database/query
--   body: { "query": "<contenido de este archivo>" }
-- o pegar en SQL Editor del dashboard.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Reset idempotente
-- ---------------------------------------------------------------------------
-- Borra TODAS las locations del estado actual. En dev no hay datos reales,
-- todo lo que hay viene del seed 003 (demo) o de runs anteriores de este
-- mismo archivo, así que el borrado total es seguro y limpio.
delete from public.locations;

-- Borra cualquier org ficticia previa para que el INSERT no choque con el
-- unique constraint en slug.
delete from public.organizations
 where slug in ('acme-promotora', 'beta-apartamentos');

-- ---------------------------------------------------------------------------
-- 2. Crear 2 orgs ficticias
-- ---------------------------------------------------------------------------
insert into public.organizations
  (name,                slug,                status,    plan,        billing_email,                contact_name,    contact_phone)
values
  ('Acme Promotora',    'acme-promotora',    'active',  'standard',  'demo+acme@atribuya.test',    'Ana Pérez',     '+34 600 000 001'),
  ('Beta Apartamentos', 'beta-apartamentos', 'trial',   'standard',  'demo+beta@atribuya.test',    'Bruno Gómez',   '+34 600 000 002');

-- ---------------------------------------------------------------------------
-- 3. Crear 2 locations por org (4 totales)
-- ---------------------------------------------------------------------------
insert into public.locations (name, oauth_status, org_id)
select
  orgs.name || ' — ' || tpl.loc_name,
  'disconnected'::oauth_status_enum,
  orgs.id
from public.organizations orgs
cross join (
  values
    ('Piso Piloto Centro'),
    ('Piso Piloto Norte')
) as tpl(loc_name)
where orgs.slug in ('acme-promotora', 'beta-apartamentos');

commit;

-- ---------------------------------------------------------------------------
-- 4. Verificación posterior (no ejecutadas dentro de la transacción)
-- ---------------------------------------------------------------------------
-- select id, name, slug, status from public.organizations order by name;
-- select l.name, l.org_id, o.slug
--   from public.locations l
--   join public.organizations o on o.id = l.org_id
--   order by o.slug, l.name;
-- select count(*) from public.organizations;  -- → 2
-- select count(*) from public.locations;      -- → 4
