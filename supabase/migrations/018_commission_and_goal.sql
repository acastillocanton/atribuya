-- Fase 1 del portado ReseñaHub → Atribuya: comisiones € por reseña + objetivo
-- por defecto más realista. Adaptado de las migraciones 020 (commission_rate) y
-- 018 (monthly_goal default 5) del proyecto original, más el addendum de
-- lockdown de la 021. Multi-tenant: no se necesita RLS nueva para escribir la
-- tarifa (la cubren las policies de UPDATE de profiles ya existentes para
-- admin/manager, scopeadas por org_id); aquí solo congelamos commission_rate
-- en la auto-edición del propio usuario para que un comercial no se suba la
-- tarifa por PostgREST (el panel calcula € = counted × commission_rate).

-- 1) Tarifa de comisión por reseña (€) por productor. Nullable y sin default:
--    NULL = tarifa no configurada → la UI muestra solo el número de reseñas.
alter table public.profiles
  add column if not exists commission_rate numeric(8,2);

-- 2) Objetivo mensual por defecto 50 → 5 (más realista). Actualiza los perfiles
--    que aún tengan el valor heredado 50.
alter table public.profiles
  alter column monthly_goal set default 5;

update public.profiles
set monthly_goal = 5
where monthly_goal = 50;

-- 3) Endurecer profiles_self_update: congelar también commission_rate (fraude).
--    Se mantiene el resto del lockdown multi-tenant de la mig 015 (org_id,
--    location_id, role, slug, monthly_goal) y la excepción invited → active.
drop policy if exists profiles_self_update on public.profiles;

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role            =                (select p.role            from public.profiles p where p.id = auth.uid())
    and slug            =                (select p.slug            from public.profiles p where p.id = auth.uid())
    and monthly_goal    =                (select p.monthly_goal    from public.profiles p where p.id = auth.uid())
    and commission_rate is not distinct from (select p.commission_rate from public.profiles p where p.id = auth.uid())
    and org_id          is not distinct from (select p.org_id          from public.profiles p where p.id = auth.uid())
    and location_id     is not distinct from (select p.location_id     from public.profiles p where p.id = auth.uid())
    and (
      status = (select p.status from public.profiles p where p.id = auth.uid())
      or (
        (select p.status from public.profiles p where p.id = auth.uid()) = 'invited'
        and status = 'active'
      )
    )
  );
