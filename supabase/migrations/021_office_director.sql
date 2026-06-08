-- Fase 5 del portado ReseñaHub → Atribuya: rol director de oficina (parte 2/2).
-- Consolida y adapta las migraciones 012 + 013 del original al modelo
-- multi-tenant: cada policy del director lleva además
-- `and org_id = public.current_org_id()` (el original es single-tenant).
--
-- Modelo: el office_director es un PRODUCTOR (vende, tiene su panel/enlace/
-- clientes/reseñas como un sales) Y un GESTOR de SU EQUIPO (los sales con
-- director_id = su id) sobre SU ficha. Ve y gestiona solo su equipo, dentro de
-- su org. admin global y reviews_manager no cambian. super_admin tiene sus
-- propias policies (no se tocan). Requiere que la 020 (enum) esté aplicada.

-- ── 1. Columna director_id (FK auto-referencial al director del sales) ───────
alter table public.profiles
  add column if not exists director_id uuid references public.profiles(id) on delete set null;

create index if not exists profiles_director_idx on public.profiles(director_id);

-- ── 2. Constraint: sales y office_director exigen location_id ────────────────
alter table public.profiles drop constraint if exists sales_must_have_location;
alter table public.profiles drop constraint if exists role_requires_location;
alter table public.profiles
  add constraint role_requires_location
  check (role not in ('sales', 'office_director') or location_id is not null);

-- ── 3. Helper: location del director actual (NULL si no es office_director) ──
create or replace function public.current_office_location()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select location_id
  from public.profiles
  where id = auth.uid()
    and role = 'office_director';
$$;

grant execute on function public.current_office_location() to authenticated;

-- ── 4. RLS locations: el director ve y actualiza SOLO su ficha (su org) ──────
drop policy if exists locations_director_select on public.locations;
create policy locations_director_select on public.locations
  for select to authenticated
  using (
    public.current_role() = 'office_director'
    and id = public.current_office_location()
    and org_id = public.current_org_id()
  );

drop policy if exists locations_director_update on public.locations;
create policy locations_director_update on public.locations
  for update to authenticated
  using (
    public.current_role() = 'office_director'
    and id = public.current_office_location()
    and org_id = public.current_org_id()
  )
  with check (
    public.current_role() = 'office_director'
    and id = public.current_office_location()
    and org_id = public.current_org_id()
  );

-- ── 5. RLS profiles: el director gestiona los SALES de SU EQUIPO ─────────────
drop policy if exists profiles_director_select on public.profiles;
create policy profiles_director_select on public.profiles
  for select to authenticated
  using (
    public.current_role() = 'office_director'
    and role = 'sales'
    and director_id = auth.uid()
    and org_id = public.current_org_id()
  );

drop policy if exists profiles_director_insert_sales on public.profiles;
create policy profiles_director_insert_sales on public.profiles
  for insert to authenticated
  with check (
    public.current_role() = 'office_director'
    and role = 'sales'
    and director_id = auth.uid()
    and location_id = public.current_office_location()
    and org_id = public.current_org_id()
  );

drop policy if exists profiles_director_update_sales on public.profiles;
create policy profiles_director_update_sales on public.profiles
  for update to authenticated
  using (
    public.current_role() = 'office_director'
    and role = 'sales'
    and director_id = auth.uid()
    and org_id = public.current_org_id()
  )
  with check (
    public.current_role() = 'office_director'
    and role = 'sales'
    and director_id = auth.uid()
    and org_id = public.current_org_id()
  );

drop policy if exists profiles_director_delete_sales on public.profiles;
create policy profiles_director_delete_sales on public.profiles
  for delete to authenticated
  using (
    public.current_role() = 'office_director'
    and role = 'sales'
    and director_id = auth.uid()
    and org_id = public.current_org_id()
  );

-- ── 6. RLS reviews: reseñas de los sales del equipo del director ─────────────
drop policy if exists reviews_director_select on public.reviews;
create policy reviews_director_select on public.reviews
  for select to authenticated
  using (
    public.current_role() = 'office_director'
    and org_id = public.current_org_id()
    and sales_id in (select id from public.profiles where director_id = auth.uid())
  );

drop policy if exists reviews_director_update on public.reviews;
create policy reviews_director_update on public.reviews
  for update to authenticated
  using (
    public.current_role() = 'office_director'
    and org_id = public.current_org_id()
    and sales_id in (select id from public.profiles where director_id = auth.uid())
  )
  with check (
    public.current_role() = 'office_director'
    and org_id = public.current_org_id()
    and sales_id in (select id from public.profiles where director_id = auth.uid())
  );

-- ── 7. RLS clients y share_links del equipo del director ─────────────────────
drop policy if exists clients_director_select on public.clients;
create policy clients_director_select on public.clients
  for select to authenticated
  using (
    public.current_role() = 'office_director'
    and org_id = public.current_org_id()
    and exists (
      select 1 from public.profiles p
      where p.id = clients.sales_id and p.director_id = auth.uid()
    )
  );

drop policy if exists share_links_director_select on public.share_links;
create policy share_links_director_select on public.share_links
  for select to authenticated
  using (
    public.current_role() = 'office_director'
    and org_id = public.current_org_id()
    and sales_id in (select id from public.profiles where director_id = auth.uid())
  );

-- ── 8. Lockdown self-update: congelar también director_id ────────────────────
-- (un sales no puede cambiarse de equipo por PostgREST). Mantiene el resto del
-- lockdown de la mig 018.
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
    and director_id     is not distinct from (select p.director_id     from public.profiles p where p.id = auth.uid())
    and (
      status = (select p.status from public.profiles p where p.id = auth.uid())
      or (
        (select p.status from public.profiles p where p.id = auth.uid()) = 'invited'
        and status = 'active'
      )
    )
  );

-- location_secrets y audit_log: SIN policies para office_director (igual que el
-- original). El acceso OAuth va por endpoints server-side con service-role.
