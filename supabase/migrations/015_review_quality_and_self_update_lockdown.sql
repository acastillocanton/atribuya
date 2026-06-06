-- ============================================================================
-- Migration 015 — Calidad de reseñas (duplicados, alertas, plantillas) +
--                 endurecimiento del auto-update de perfil
-- ============================================================================
--
-- Agrupa 4 mejoras portadas del producto base, adaptadas al modelo
-- multi-tenant de Atribuya (las tablas `reviews` y `profiles` ya tienen
-- `org_id` desde la migración 011, así que estas columnas no necesitan
-- `org_id` propio — quedan aisladas por la fila a la que pertenecen):
--
--   1. reviews.is_duplicate       — anti-fraude por client_id.
--   2. reviews.low_rating_alerted_at — idempotencia de alertas ≤2★.
--   3. profiles.message_templates — plantillas de mensaje por comercial.
--   4. profiles_self_update       — lockdown de columnas sensibles (incl. org_id).
--
-- Todas las columnas se escriben SOLO desde el service-client (cron) o desde
-- server actions que derivan el contexto del JWT; ninguna es exposable al
-- cliente. No añaden policies nuevas salvo el rewrite del punto 4.

-- ----------------------------------------------------------------------------
-- 1. reviews.is_duplicate — marca anti-fraude por client_id
-- ----------------------------------------------------------------------------
-- Cuando un cliente reenvía su enlace a varias personas, el matcher atribuye
-- todas las reseñas al mismo client_id. Las N siguen vinculadas al comercial
-- (útil), pero solo la primera (por google_created_at) cuenta en KPIs/Excel.
--   • Principal por client_id = google_created_at más antiguo
--     (tie-break: fetched_at ASC, luego id ASC).
--   • Las demás → is_duplicate = true.
--   • removed_at NOT NULL se ignora; client_id NULL no entra en la lógica.

alter table public.reviews
  add column if not exists is_duplicate boolean not null default false;

with ranked as (
  select
    id,
    row_number() over (
      partition by client_id
      order by google_created_at asc, fetched_at asc, id asc
    ) as rn
  from public.reviews
  where client_id is not null
    and removed_at is null
)
update public.reviews r
set is_duplicate = true
from ranked
where r.id = ranked.id
  and ranked.rn > 1;

-- Índice parcial para que los KPIs cuenten rápido las principales por sales.
create index if not exists reviews_active_principal_idx
  on public.reviews (sales_id, google_created_at desc)
  where is_duplicate = false
    and removed_at is null
    and sales_id is not null;

-- ----------------------------------------------------------------------------
-- 2. reviews.low_rating_alerted_at — idempotencia de alertas ≤2★
-- ----------------------------------------------------------------------------
-- El cron envía un email a admin/manager (+ sales atribuido) cuando entra una
-- reseña ≤2★. Para no reenviar cuando una reseña pasa de unmatched → counted
-- en syncs posteriores (mismo google_review_id, distinto match_state),
-- marcamos esta columna tras el primer envío.

alter table public.reviews
  add column if not exists low_rating_alerted_at timestamptz;

create index if not exists reviews_low_rating_pending_alert_idx
  on public.reviews (id)
  where rating <= 2 and low_rating_alerted_at is null;

-- ----------------------------------------------------------------------------
-- 3. profiles.message_templates — plantillas de mensaje por comercial
-- ----------------------------------------------------------------------------
-- 3 plantillas base (post-visita / reavivar / breve) que cada comercial puede
-- reescribir "a su forma". Se guardan como JSONB keyed por id de plantilla:
--   { "post_visita": "<texto con {nombre_cliente}/{nombre_comercial}/{url}>",
--     "reavivar": "...", "breve": "..." }
-- Claves ausentes/en blanco → se usa la plantilla base de código. NULL = nunca
-- personalizó. Escritura server-only filtrando por id = auth.uid().

alter table public.profiles
  add column if not exists message_templates jsonb;

-- ----------------------------------------------------------------------------
-- 4. profiles_self_update — lockdown de columnas sensibles
-- ----------------------------------------------------------------------------
-- La policy de la 012 solo congelaba `role`. Un usuario autenticado podía,
-- llamando a PostgREST directamente con su JWT, modificar SU PROPIA fila:
-- slug, monthly_goal, location_id, status (auto-reactivarse) y —lo más grave
-- en multi-tenant— `org_id` (saltar a otra organización). El gating de las
-- server actions no protege esto porque el atacante va directo a la BD, que es
-- justo el borde que RLS debe defender.
--
-- FIX: congelamos las columnas sensibles en el WITH CHECK comparándolas contra
-- su valor actual. El único cambio de estado legítimo desde contexto-usuario es
-- el flip invited → active de /auth/confirm, permitido explícitamente. Columnas
-- auto-editables que siguen abiertas: full_name, phone, avatar_url, email.
--
-- No afecta a admin/reviews_manager: sus UPDATE pasan por sus propias policies
-- permisivas (profiles_admin_all, profiles_manager_update_sales), que se
-- evalúan en OR con esta.

drop policy if exists profiles_self_update on public.profiles;

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role         =                (select p.role         from public.profiles p where p.id = auth.uid())
    and slug         =                (select p.slug         from public.profiles p where p.id = auth.uid())
    and monthly_goal =                (select p.monthly_goal from public.profiles p where p.id = auth.uid())
    and org_id       is not distinct from (select p.org_id      from public.profiles p where p.id = auth.uid())
    and location_id  is not distinct from (select p.location_id from public.profiles p where p.id = auth.uid())
    and (
      status = (select p.status from public.profiles p where p.id = auth.uid())
      -- Excepción: primer login (flip invited → active en /auth/confirm).
      or (
        (select p.status from public.profiles p where p.id = auth.uid()) = 'invited'
        and status = 'active'
      )
    )
  );
