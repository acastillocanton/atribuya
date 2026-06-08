-- ============================================================================
-- DEV SEED 03 — directores de oficina de prueba (Fase 5: rol office_director)
-- ============================================================================
--
-- NO es una migración. Crea 2 directores + 2 comerciales asignados en la org
-- Acme, para validar el aislamiento por equipo del rol office_director
-- (mig 020/021). Idempotente. UUIDs sintéticos identificables:
--   ffffffff… → Director 1 (D1)        f2f2f2f2… → Director 2 (D2)
--   f3f3f3f3… → Sales S1 (equipo D1)   f4f4f4f4… → Sales S2 (equipo D2)
--
-- Requiere SOLO el seed 01 (orgs/locations) aplicado. NO depende del seed 02.
-- La org Acme y su ficha se buscan DINÁMICAMENTE por slug (`acme-promotora`),
-- porque el seed 01 las recrea con gen_random_uuid() — sus ids NO son fijos.
-- Si Acme no existe, el insert falla con error de constraint (señal de que hay
-- que aplicar el seed 01 primero).
-- ============================================================================

begin;

-- 1. Limpieza idempotente.
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
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'test+dir1-acme@atribuya.test',     'authenticated', 'authenticated'),
  ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'test+dir2-acme@atribuya.test',     'authenticated', 'authenticated'),
  ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'test+sales-d1-acme@atribuya.test', 'authenticated', 'authenticated'),
  ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'test+sales-d2-acme@atribuya.test', 'authenticated', 'authenticated');

-- 3. profiles. org_id y location_id se resuelven por slug de Acme + su 1ª ficha.
with acme as (
  select id as org_id from public.organizations where slug = 'acme-promotora' limit 1
),
loc as (
  select l.id as location_id
  from public.locations l
  join acme a on l.org_id = a.org_id
  order by l.name
  limit 1
)
insert into public.profiles
  (id, full_name, role, org_id, location_id, director_id, slug, email, monthly_goal, status)
select v.id, v.full_name, v.role,
       (select org_id from acme),
       (select location_id from loc),
       v.director_id, v.slug, v.email, 5, 'active'
from (
  values
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Test Dir 1 Acme', 'office_director'::role_enum, null::uuid,                                   'test-dir1-acme', 'test+dir1-acme@atribuya.test'),
    ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2'::uuid, 'Test Dir 2 Acme', 'office_director'::role_enum, null::uuid,                                   'test-dir2-acme', 'test+dir2-acme@atribuya.test'),
    ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3'::uuid, 'Test Sales D1',   'sales'::role_enum,           'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'test-sales-d1',  'test+sales-d1-acme@atribuya.test'),
    ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4'::uuid, 'Test Sales D2',   'sales'::role_enum,           'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2'::uuid, 'test-sales-d2',  'test+sales-d2-acme@atribuya.test')
) as v(id, full_name, role, director_id, slug, email);

commit;

-- 4. Verificación inmediata (debe devolver 4). Si devuelve 0 o da error de
--    constraint, el seed 01 (org acme-promotora + su ficha) no está aplicado.
select count(*) as fixtures_creados
from public.profiles
where id in (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
  'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
  'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4'
);

-- 5. Limpieza tras los tests:
--   delete from public.profiles where id::text like 'ffffffff-%' or id::text like 'f2f2f2f2-%' or id::text like 'f3f3f3f3-%' or id::text like 'f4f4f4f4-%';
--   delete from auth.users     where id::text like 'ffffffff-%' or id::text like 'f2f2f2f2-%' or id::text like 'f3f3f3f3-%' or id::text like 'f4f4f4f4-%';
