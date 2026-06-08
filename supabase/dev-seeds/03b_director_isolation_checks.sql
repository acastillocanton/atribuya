-- ============================================================================
-- Tests de aislamiento del rol office_director (mig 020/021)
-- Requiere los seeds 01, 02 y 03 aplicados. Cada bloque simula la sesión de un
-- usuario via `set local request.jwt.claims` y hace ROLLBACK (solo lee).
-- Ejecutar entero en el SQL Editor o vía Management API; comparar con "espera:".
-- D1 = ffffffff…  D2 = f2f2f2f2…  super = eeeeeeee…  Acme=7ee47f36…  Beta=89af2880…
-- ============================================================================

-- 1) D1 ve SOLO su equipo (Test Sales D1). espera: n=1, "Test Sales D1"
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"ffffffff-ffff-ffff-ffff-ffffffffffff","role":"authenticated"}';
  select count(*)::int as n, coalesce(string_agg(full_name, ', '), '∅') as equipo
    from public.profiles where role = 'sales';
rollback;

-- 2) D2 ve SOLO su equipo (Test Sales D2). espera: n=1, "Test Sales D2"
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2","role":"authenticated"}';
  select count(*)::int as n, coalesce(string_agg(full_name, ', '), '∅') as equipo
    from public.profiles where role = 'sales';
rollback;

-- 3) D1 NO ve nada de la org Beta. espera: n=0
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"ffffffff-ffff-ffff-ffff-ffffffffffff","role":"authenticated"}';
  select count(*)::int as n
    from public.profiles where org_id = '89af2880-ffa9-48c5-a5b0-506c964a7d54';
rollback;

-- 4) D1 NO ve al comercial del equipo de D2 (Test Sales D2). espera: n=0
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"ffffffff-ffff-ffff-ffff-ffffffffffff","role":"authenticated"}';
  select count(*)::int as n
    from public.profiles where id = 'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4';
rollback;

-- 5) super_admin ve TODOS los comerciales (de todas las orgs). espera: n >= 3
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee","role":"authenticated"}';
  select count(*)::int as n from public.profiles where role = 'sales';
rollback;

-- 6) Lockdown: el comercial S1 NO puede reasignarse de equipo por PostgREST.
--    espera: ERROR "new row violates row-level security policy" (lo bloquea el
--    WITH CHECK de profiles_self_update que congela director_id). Ejecutar este
--    bloque SOLO para confirmar el error; al fallar aborta su transacción.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3","role":"authenticated"}';
  update public.profiles set director_id = 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2'
    where id = 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3';
rollback;
