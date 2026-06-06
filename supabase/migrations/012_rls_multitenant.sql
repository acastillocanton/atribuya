-- ============================================================================
-- Migration 012 — RLS rewrite multi-tenant
-- ============================================================================
--
-- Reescribe todas las policies RLS heredadas para añadir el filtro por
-- `org_id = public.current_org_id() OR public.is_super_admin()`.
--
-- IMPORTANTE — Pre-requisitos antes de aplicar:
--   1. Migración 011 aplicada (tabla organizations + columnas org_id).
--   2. Todas las filas existentes ya tienen `org_id` rellenado (ver §6 de
--      la migración 011 para el SQL de seed).
--   3. Hay al menos un super_admin registrado (yo) — si no, después de
--      aplicar esto te quedas sin acceso a tus propios datos hasta que
--      crees el primer super_admin.
--
-- Patrón general:
--   - Las policies existentes hacen DROP y se recrean con filtro org_id.
--   - Super_admin tiene acceso transversal pero todo queda en audit_log.
--
-- Aplicar en una transacción única para evitar estados intermedios donde
-- la RLS queda parcialmente aplicada.

begin;

-- ============================================================================
-- 1. RLS de organizations (NUEVA — no existía en single-tenant)
-- ============================================================================

alter table public.organizations enable row level security;

-- Los miembros de una org pueden ver SU PROPIA org.
create policy organizations_own_select on public.organizations
  for select to authenticated
  using (id = public.current_org_id() or public.is_super_admin());

-- Solo el super_admin crea, modifica o elimina orgs.
create policy organizations_super_admin_all on public.organizations
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ============================================================================
-- 2. RLS de super_admins (NUEVA)
-- ============================================================================

alter table public.super_admins enable row level security;

-- Solo otros super_admins pueden ver/modificar la tabla super_admins.
-- (En la práctica el primer super_admin se inserta via service-role).
create policy super_admins_super_admin_all on public.super_admins
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ============================================================================
-- 3. RLS de locations (REESCRITAS)
-- ============================================================================

drop policy if exists locations_admin_all on public.locations;
drop policy if exists locations_select_others on public.locations;

create policy locations_admin_all on public.locations
  for all to authenticated
  using (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy locations_select_others on public.locations
  for select to authenticated
  using (
    public.current_role() in ('sales', 'reviews_manager')
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- ============================================================================
-- 4. RLS de profiles (REESCRITAS)
-- ============================================================================

drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists profiles_self_select on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_manager_select on public.profiles;
drop policy if exists profiles_manager_insert_sales on public.profiles;
drop policy if exists profiles_manager_update_sales on public.profiles;
drop policy if exists profiles_manager_delete_sales on public.profiles;

create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- El usuario siempre puede leerse a sí mismo (no necesita filtro org).
create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- Update propio: igual que el original, sin filtro org porque ya filtra por id.
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy profiles_manager_select on public.profiles
  for select to authenticated
  using (
    public.current_role() = 'reviews_manager'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy profiles_manager_insert_sales on public.profiles
  for insert to authenticated
  with check (
    public.current_role() = 'reviews_manager'
    and role = 'sales'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy profiles_manager_update_sales on public.profiles
  for update to authenticated
  using (
    public.current_role() = 'reviews_manager'
    and role = 'sales'
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    public.current_role() = 'reviews_manager'
    and role = 'sales'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy profiles_manager_delete_sales on public.profiles
  for delete to authenticated
  using (
    public.current_role() = 'reviews_manager'
    and role = 'sales'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- ============================================================================
-- 5. RLS de clients (REESCRITAS)
-- ============================================================================

drop policy if exists clients_admin_all on public.clients;
drop policy if exists clients_sales_own on public.clients;
drop policy if exists clients_manager_select on public.clients;

create policy clients_admin_all on public.clients
  for all to authenticated
  using (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy clients_sales_own on public.clients
  for all to authenticated
  using (
    sales_id = auth.uid()
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    sales_id = auth.uid()
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy clients_manager_select on public.clients
  for select to authenticated
  using (
    public.current_role() = 'reviews_manager'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- ============================================================================
-- 6. RLS de share_links (REESCRITAS)
-- ============================================================================

drop policy if exists share_links_admin_all on public.share_links;
drop policy if exists share_links_sales_own_select on public.share_links;

create policy share_links_admin_all on public.share_links
  for all to authenticated
  using (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy share_links_sales_own_select on public.share_links
  for select to authenticated
  using (
    sales_id = auth.uid()
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- Manager también necesita leer share_links para informes (heredado del original
-- que en realidad no tenía esta policy explícita pero el manager hereda de
-- profiles_manager_select sobre clientes y reviews — añadimos por consistencia).
create policy share_links_manager_select on public.share_links
  for select to authenticated
  using (
    public.current_role() = 'reviews_manager'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- ============================================================================
-- 7. RLS de reviews (REESCRITAS)
-- ============================================================================

drop policy if exists reviews_admin_all on public.reviews;
drop policy if exists reviews_sales_own_select on public.reviews;
drop policy if exists reviews_manager_select on public.reviews;

create policy reviews_admin_all on public.reviews
  for all to authenticated
  using (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy reviews_sales_own_select on public.reviews
  for select to authenticated
  using (
    sales_id = auth.uid()
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy reviews_manager_select on public.reviews
  for select to authenticated
  using (
    public.current_role() = 'reviews_manager'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- ============================================================================
-- 8. RLS de audit_log (REESCRITAS)
-- ============================================================================

drop policy if exists audit_log_admin_select on public.audit_log;

-- Admin de la org lee su audit log
create policy audit_log_admin_select on public.audit_log
  for select to authenticated
  using (
    public.current_role() = 'admin'
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- Insert: el helper recordAudit() corre via service-role en single-tenant.
-- Si en el futuro se quiere permitir insert con cookie-context (como hace
-- la migración 008 con audit_log_self_insert), recordar añadir filtro org_id.

-- ============================================================================
-- 9. Marcar columnas org_id como NOT NULL (después de seed)
-- ============================================================================
--
-- IMPORTANTE: solo descomentar y ejecutar DESPUÉS de haber rellenado
-- todos los org_id de las filas existentes (ver §6 de migración 011).
--
-- alter table public.locations    alter column org_id set not null;
-- alter table public.clients      alter column org_id set not null;
-- alter table public.share_links  alter column org_id set not null;
-- alter table public.reviews      alter column org_id set not null;
-- alter table public.audit_log    alter column org_id set not null;
--
-- profiles.org_id se queda NULLABLE porque los super_admins NO tienen org.
--
-- Si quieres garantizar que SOLO super_admins puedan tener org_id NULL en
-- profiles, descomenta este constraint:
--
-- alter table public.profiles add constraint profiles_org_or_super_admin
--   check (
--     org_id is not null
--     or id in (select user_id from public.super_admins)
--   );
--
-- Nota: este constraint con subquery a otra tabla no es estándar en Postgres
-- antes de v18. Mejor implementarlo como trigger BEFORE INSERT/UPDATE.

commit;

-- ============================================================================
-- Fin migración 012
-- ============================================================================
