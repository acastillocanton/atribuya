-- ============================================================================
-- DEV SEED 02 — usuarios de prueba para validar RLS multi-tenant (Fase 2)
-- ============================================================================
--
-- NO es una migración. Crea 5 profiles ficticios CON UUIDs SINTÉTICOS para
-- poder simular sesiones autenticadas en tests de aislamiento.
--
-- IMPORTANTE: profiles.id NO tiene FK a auth.users en este schema, así que
-- estos UUIDs son "virtuales" — no hay user real en auth.users. Sirven
-- exclusivamente para validar RLS vía `set local request.jwt.claims`.
--
-- Para poder limpiar luego, todos los UUIDs siguen el patrón
-- `aaaaaaaa...` `bbbbbbbb...` etc — fáciles de identificar y borrar.
--
-- Aplicación: vía Supabase Management API o SQL Editor. Idempotente.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Limpieza idempotente
-- ---------------------------------------------------------------------------
delete from public.super_admins where user_id::text like '%-eeee-%';
delete from public.profiles
 where id in (
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'dddddddd-dddd-dddd-dddd-dddddddddddd',
   'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
 );
delete from auth.users
 where id in (
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'dddddddd-dddd-dddd-dddd-dddddddddddd',
   'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
 );

-- ---------------------------------------------------------------------------
-- 1b. Insert into auth.users (required because profiles.id has FK to it)
--     We don't go through the GoTrue flow because we don't need real auth;
--     we just need an auth.users row whose id matches profiles.id.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, aud, role)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'test+admin-acme@atribuya.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'test+sales-acme@atribuya.test', 'authenticated', 'authenticated'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'test+mgr-acme@atribuya.test',   'authenticated', 'authenticated'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'test+admin-beta@atribuya.test', 'authenticated', 'authenticated'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'test+super@atribuya.test',      'authenticated', 'authenticated');

-- ---------------------------------------------------------------------------
-- 2. Insert 5 test profiles
--    Org slugs:
--      Acme  → org_id = 7ee47f36-1977-4f80-be5c-05508ce55550
--      Beta  → org_id = 89af2880-ffa9-48c5-a5b0-506c964a7d54
--    Location IDs (Acme, used by sales):
--      Centro → c9d17be1-9f4e-4a53-a1dc-02e0be756bb4
-- ---------------------------------------------------------------------------
insert into public.profiles
  (id,                                       full_name,                  role,              org_id,                                  location_id,                            slug,              email,                       monthly_goal, status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  'Test Admin Acme',          'admin',           '7ee47f36-1977-4f80-be5c-05508ce55550',  null,                                   'test-admin-acme', 'test+admin-acme@atribuya.test',   0, 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',  'Test Sales Acme',          'sales',           '7ee47f36-1977-4f80-be5c-05508ce55550',  'c9d17be1-9f4e-4a53-a1dc-02e0be756bb4', 'test-sales-acme', 'test+sales-acme@atribuya.test',  10, 'active'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',  'Test Manager Acme',        'reviews_manager', '7ee47f36-1977-4f80-be5c-05508ce55550',  null,                                   'test-mgr-acme',   'test+mgr-acme@atribuya.test',     0, 'active'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',  'Test Admin Beta',          'admin',           '89af2880-ffa9-48c5-a5b0-506c964a7d54',  null,                                   'test-admin-beta', 'test+admin-beta@atribuya.test',   0, 'active'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',  'Test Super Admin',         'admin',           null,                                    null,                                   'test-super',      'test+super@atribuya.test',        0, 'active');

-- ---------------------------------------------------------------------------
-- 3. Mark the last one as super_admin
-- ---------------------------------------------------------------------------
insert into public.super_admins (user_id, notes)
values ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Test super admin for RLS isolation tests');

commit;

-- ---------------------------------------------------------------------------
-- 4. To clean up after tests:
--
--   delete from public.super_admins where user_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
--   delete from public.profiles where id::text like '%-aaaa-aaaa-aaaaaaaaaaaa'
--                                  or id::text like '%-bbbb-bbbb-bbbbbbbbbbbb'
--                                  or id::text like '%-cccc-cccc-cccccccccccc'
--                                  or id::text like '%-dddd-dddd-dddddddddddd'
--                                  or id::text like '%-eeee-eeee-eeeeeeeeeeee';
-- ---------------------------------------------------------------------------
