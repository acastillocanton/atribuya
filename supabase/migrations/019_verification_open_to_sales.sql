-- Fase 3 del portado ReseñaHub → Atribuya: abrir la verificación al comercial.
-- Adaptado de la migración 016 del original (verification_open_to_all), con el
-- filtro multi-tenant `org_id = current_org_id()` añadido a cada policy (el
-- original es single-tenant y no lo tiene).
--
-- Decisión de producto: quien mejor identifica una reseña huérfana (la que dejó
-- un cliente sin pasar por el enlace personal) es el propio comercial, que
-- conoce al cliente por nombre. Le damos:
--   • Ver las huérfanas (sales_id IS NULL) SOLO de SU ficha (location_id) y org.
--   • "Reclamar": unmatched → counted con sales_id = self. Nada más.
-- admin/reviews_manager no cambian (siguen con sus policies de la mig 005/012).
-- El rol office_director llegará en la Fase 5 y ampliará el SELECT a su equipo.

-- A · Helper: location_id del usuario actual. Para admin/manager es NULL (no
--     aplican las policies que lo usan). Para sales siempre non-null por el
--     constraint sales_must_have_location de la mig 001.
create or replace function public.current_user_location()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select location_id from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_user_location() to authenticated;

-- B · SELECT: el comercial ve las huérfanas de su ficha (y su org).
drop policy if exists reviews_unmatched_location_select on public.reviews;
create policy reviews_unmatched_location_select on public.reviews
  for select
  to authenticated
  using (
    sales_id is null
    and removed_at is null
    and location_id = public.current_user_location()
    and org_id = public.current_org_id()
    and public.current_role() = 'sales'
  );

-- C · UPDATE "Reclamar". Estricta:
--   USING: solo unmatched, no eliminadas, de mi ficha y mi org, rol sales.
--   WITH CHECK: la fila resultante DEBE quedar con sales_id = auth.uid() y
--   match_state='counted' en mi org. Imposible reasignar a otro o desatribuir.
drop policy if exists reviews_sales_claim_update on public.reviews;
create policy reviews_sales_claim_update on public.reviews
  for update
  to authenticated
  using (
    public.current_role() = 'sales'
    and sales_id is null
    and removed_at is null
    and location_id = public.current_user_location()
    and org_id = public.current_org_id()
  )
  with check (
    public.current_role() = 'sales'
    and sales_id = auth.uid()
    and match_state = 'counted'
    and removed_at is null
    and location_id = public.current_user_location()
    and org_id = public.current_org_id()
  );
