-- ============================================================================
-- Migration 014 — leads table for the public landing form
-- ============================================================================
--
-- Pre-org commercial lead capture. The landing page at `/` has a form
-- (name + email + company + optional message) for prospects who want a demo.
--
-- Why a dedicated table (vs. an email-only mailto: link):
--   - Persistence: no email = lost lead if the inbox filter eats it.
--   - Auditability: super_admin can review prospects from the panel.
--   - Anti-spam: server-side validation + honeypot + future rate-limit.
--   - Future-proof: once Brevo is wired, a trigger or background job can
--     notify the team on insert.
--
-- Tenancy model:
--   - `leads` is pre-org by definition: prospects don't have an org_id yet.
--   - Therefore NO `org_id` column. The table is super_admin-only.
--   - Insertion happens server-side via the service-role client (bypasses RLS).
--   - Anon / authenticated users CANNOT SELECT or INSERT directly: there is
--     no policy for them, and RLS denies by default.
--
-- Aplicar en una sola transacción.

begin;

-- ---------------------------------------------------------------------------
-- 1. Tabla
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  company     text not null,
  message     text,
  source      text not null default 'landing',
  user_agent  text,
  ip          inet,
  created_at  timestamptz not null default now()
);

comment on table public.leads is
  'Captación de prospects desde la landing pública. Tabla pre-org: no tiene org_id porque los leads aún no son clientes. Solo super_admin la lee. La INSERT ocurre server-side con service-role.';

-- Índices: orden por fecha (listado super_admin) y búsqueda por email.
create index if not exists leads_created_at_desc_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

-- ---------------------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------------------
alter table public.leads enable row level security;

-- SELECT solo para super_admin. Anon/authenticated normales se quedan fuera
-- (sin policy → RLS niega).
create policy leads_super_admin_select on public.leads
  for select
  to authenticated
  using (public.is_super_admin());

-- DELETE solo para super_admin (limpieza manual de spam, etc.).
create policy leads_super_admin_delete on public.leads
  for delete
  to authenticated
  using (public.is_super_admin());

-- NO definimos policy de INSERT ni UPDATE para anon/authenticated:
--   - INSERT lo hace exclusivamente el server action vía service-role
--     (bypass RLS automático en Supabase).
--   - UPDATE no se necesita: un lead es inmutable; si hay que corregirlo,
--     el super_admin borra y reinserta.

commit;

-- ============================================================================
-- Post-apply verification:
--
--   -- 1. Tabla existe y RLS está activa:
--   select relname, relrowsecurity from pg_class
--    where relname = 'leads' and relkind = 'r';
--   -- → leads | t
--
--   -- 2. Policies creadas:
--   select polname, polcmd from pg_policy
--    where polrelid = 'public.leads'::regclass
--    order by polname;
--   -- → leads_super_admin_delete | d
--   -- → leads_super_admin_select | r
--
--   -- 3. Smoke test: como anon, SELECT debe devolver 0 rows / error de RLS.
--   --    Como super_admin, SELECT funciona. INSERT vía service-role funciona
--   --    desde la server action.
-- ============================================================================
