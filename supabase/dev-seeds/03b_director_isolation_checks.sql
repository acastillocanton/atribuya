-- ============================================================================
-- Tests de aislamiento del rol office_director (mig 020/021)
-- Requiere los seeds 01, 02 y 03 aplicados.
--
-- IMPORTANTE: el SQL Editor solo muestra el resultado del ÚLTIMO statement. Por
-- eso el BLOQUE A acumula los checks 1-5 en una variable y la lee al final →
-- una sola fila `resultado` con todo. El BLOQUE B (check 6, lockdown) hay que
-- ejecutarlo POR SEPARADO porque debe terminar en ERROR.
--
-- D1=ffffffff…  D2=f2f2f2f2…  super=eeeeeeee…  Acme=7ee47f36…  Beta=89af2880…
-- ============================================================================

-- ───────────────────────── BLOQUE A: checks 1-5 (solo lectura) ─────────────
-- Resultado esperado (una fila):
--   1·D1 equipo=1 | 3·D1 Beta=0 | 4·D1 sales_D2=0 || 2·D2 equipo=1 || 5·super sales>=3
begin;
  set local role authenticated;

  -- Sesión D1
  set local request.jwt.claims = '{"sub":"ffffffff-ffff-ffff-ffff-ffffffffffff","role":"authenticated"}';
  select set_config(
    'atribuya.checks',
    '1·D1 equipo=' || (select count(*) from public.profiles where role = 'sales')
    || ' | 3·D1 Beta=' || (select count(*) from public.profiles where org_id = '89af2880-ffa9-48c5-a5b0-506c964a7d54')
    || ' | 4·D1 sales_D2=' || (select count(*) from public.profiles where id = 'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4'),
    false);

  -- Sesión D2
  set local request.jwt.claims = '{"sub":"f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2","role":"authenticated"}';
  select set_config(
    'atribuya.checks',
    current_setting('atribuya.checks')
    || ' || 2·D2 equipo=' || (select count(*) from public.profiles where role = 'sales'),
    false);

  -- Sesión super_admin
  set local request.jwt.claims = '{"sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee","role":"authenticated"}';
  select set_config(
    'atribuya.checks',
    current_setting('atribuya.checks')
    || ' || 5·super sales=' || (select count(*) from public.profiles where role = 'sales'),
    false);

  select current_setting('atribuya.checks') as resultado;
rollback;

-- ───────────────────────── BLOQUE B: check 6 (lockdown) ────────────────────
-- Ejecutar SOLO este bloque (selecciónalo y Run). Espera: ERROR
-- "new row violates row-level security policy" — el comercial S1 no puede
-- cambiarse de equipo por PostgREST.
-- begin;
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3","role":"authenticated"}';
--   update public.profiles set director_id = 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2'
--     where id = 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3';
-- rollback;
