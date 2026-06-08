-- ============================================================================
-- DEV SEED 03 — directores de oficina de prueba (Fase 5: rol office_director)
-- ============================================================================
--
-- NO es una migración. Crea 2 directores y 2 comerciales asignados a ellos en
-- la org Acme / ficha Centro, para validar el aislamiento por equipo del rol
-- office_director (mig 020/021). Idempotente. UUIDs sintéticos identificables:
--   ffffffff… → Director 1 (D1)        f2f2f2f2… → Director 2 (D2)
--   f3f3f3f3… → Sales S1 (equipo D1)   f4f4f4f4… → Sales S2 (equipo D2)
--
-- Requiere el seed 01 (orgs/locations) y 02 (test users) aplicados.
-- Org Acme = 7ee47f36-1977-4f80-be5c-05508ce55550
-- La ficha (location_id) se busca dinámicamente: el seed 01 las recrea con
-- gen_random_uuid() cada vez, así que NO se puede hardcodear su id.
--
-- Aplicación: Management API o SQL Editor.
-- ============================================================================

begin;

-- 1. Limpieza idempotente (borra los 4 fixtures de este archivo).
delete from public.profiles
 where id in (
   'ffffffff-ffff-ffff-ffff-ffffffffffff',
   'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
   'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
   'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4'
 );
delete from auth.users
 where id in (
   'ffffffff-ffff-ffff-ffff-ffffffffffff',
   'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
   'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
   'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4'
 );

-- 2. auth.users (FK de profiles.id).
insert into auth.users (id, email, aud, role)
values
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'test+dir1-acme@atribuya.test',  'authenticated', 'authenticated'),
  ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'test+dir2-acme@atribuya.test',  'authenticated', 'authenticated'),
  ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'test+sales-d1-acme@atribuya.test', 'authenticated', 'authenticated'),
  ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'test+sales-d2-acme@atribuya.test', 'authenticated', 'authenticated');

-- 3. profiles: 2 directores + 2 sales asignados, todos en la misma ficha de
--    Acme (la primera por nombre), buscada dinámicamente vía subquery `acme_loc`.
with acme_loc as (
  select id
  from public.locations
  where org_id = '7ee47f36-1977-4f80-be5c-05508ce55550'
  order by name
  limit 1
)
insert into public.profiles
  (id, full_name, role, org_id, location_id, director_id, slug, email, monthly_goal, status)
select v.id, v.full_name, v.role, '7ee47f36-1977-4f80-be5c-05508ce55550', acme_loc.id,
       v.director_id, v.slug, v.email, 5, 'active'
from acme_loc, (
  values
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Test Dir 1 Acme', 'office_director'::role_enum, null::uuid,                                       'test-dir1-acme', 'test+dir1-acme@atribuya.test'),
    ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2'::uuid, 'Test Dir 2 Acme', 'office_director'::role_enum, null::uuid,                                       'test-dir2-acme', 'test+dir2-acme@atribuya.test'),
    ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3'::uuid, 'Test Sales D1',   'sales'::role_enum,           'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,     'test-sales-d1',  'test+sales-d1-acme@atribuya.test'),
    ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4'::uuid, 'Test Sales D2',   'sales'::role_enum,           'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2'::uuid,     'test-sales-d2',  'test+sales-d2-acme@atribuya.test')
) as v(id, full_name, role, director_id, slug, email);

commit;

-- 4. Limpieza tras los tests:
--   delete from public.profiles where id::text like 'ffffffff-%' or id::text like 'f2f2f2f2-%' or id::text like 'f3f3f3f3-%' or id::text like 'f4f4f4f4-%';
--   delete from auth.users     where id::text like 'ffffffff-%' or id::text like 'f2f2f2f2-%' or id::text like 'f3f3f3f3-%' or id::text like 'f4f4f4f4-%';
