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
-- Ficha Acme · Centro = c9d17be1-9f4e-4a53-a1dc-02e0be756bb4
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

-- 3. profiles: 2 directores (Acme/Centro) + 2 sales asignados a cada uno.
insert into public.profiles
  (id,                                      full_name,        role,              org_id,                                 location_id,                            director_id,                            slug,              email,                              monthly_goal, status)
values
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Test Dir 1 Acme', 'office_director', '7ee47f36-1977-4f80-be5c-05508ce55550', 'c9d17be1-9f4e-4a53-a1dc-02e0be756bb4', null,                                   'test-dir1-acme',  'test+dir1-acme@atribuya.test',      5, 'active'),
  ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Test Dir 2 Acme', 'office_director', '7ee47f36-1977-4f80-be5c-05508ce55550', 'c9d17be1-9f4e-4a53-a1dc-02e0be756bb4', null,                                   'test-dir2-acme',  'test+dir2-acme@atribuya.test',      5, 'active'),
  ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'Test Sales D1',   'sales',           '7ee47f36-1977-4f80-be5c-05508ce55550', 'c9d17be1-9f4e-4a53-a1dc-02e0be756bb4', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'test-sales-d1',   'test+sales-d1-acme@atribuya.test',  5, 'active'),
  ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'Test Sales D2',   'sales',           '7ee47f36-1977-4f80-be5c-05508ce55550', 'c9d17be1-9f4e-4a53-a1dc-02e0be756bb4', 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'test-sales-d2',   'test+sales-d2-acme@atribuya.test',  5, 'active');

commit;

-- 4. Limpieza tras los tests:
--   delete from public.profiles where id::text like 'ffffffff-%' or id::text like 'f2f2f2f2-%' or id::text like 'f3f3f3f3-%' or id::text like 'f4f4f4f4-%';
--   delete from auth.users     where id::text like 'ffffffff-%' or id::text like 'f2f2f2f2-%' or id::text like 'f3f3f3f3-%' or id::text like 'f4f4f4f4-%';
