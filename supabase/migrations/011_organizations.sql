-- ============================================================================
-- Migration 011 — organizations + org_id en todas las tablas de negocio
-- ============================================================================
--
-- Esta migración convierte el esquema single-tenant original
-- en multi-tenant ligero. Añade:
--   1. Tabla `organizations` (raíz del multi-tenant).
--   2. Tabla `super_admins` (rol global del SaaS, separado de profiles).
--   3. Columna `org_id` en todas las tablas de negocio.
--   4. Funciones helper `current_org_id()` y `is_super_admin()`.
--
-- IMPORTANTE:
--   - Esta migración NO modifica RLS todavía. Eso es la migración 012.
--   - Después de esta migración, hay que sembrar la primera organization
--     y asignar el `org_id` a las filas existentes (si hay datos previos).
--   - El esquema queda nullable en `org_id` deliberadamente para permitir
--     migración progresiva. La 012 marcará NOT NULL donde aplique.
--
-- Aplicar en Supabase Dashboard → SQL Editor, en una sola transacción
-- (envolver en BEGIN/COMMIT si se quiere ser explícito).

-- ============================================================================
-- 1. Tabla organizations
-- ============================================================================

create type org_status_enum as enum ('trial', 'active', 'suspended', 'churned');

create table public.organizations (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  status           org_status_enum not null default 'trial',
  plan             text not null default 'standard',
  billing_email    text,
  contact_name     text,
  contact_phone    text,
  fiscal_data      jsonb not null default '{}'::jsonb,
  trial_ends_at    timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index organizations_status_idx on public.organizations(status);
create index organizations_slug_idx   on public.organizations(slug);

comment on table public.organizations is
  'Cada fila es una empresa cliente del SaaS. Punto de partida del multi-tenant.';
comment on column public.organizations.slug is
  'Usado para path-prefix /o/[slug]/... — ascii, kebab-case, único globalmente.';
comment on column public.organizations.status is
  'trial: en periodo de prueba. active: pagando. suspended: impago u otro. churned: baja definitiva.';
comment on column public.organizations.fiscal_data is
  'Datos de facturación (razón social, CIF, dirección, etc.) en JSON flexible.';

-- Trigger para mantener updated_at automáticamente
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_touch_updated_at
  before update on public.organizations
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- 2. Tabla super_admins
-- ============================================================================
-- Decisión: mantenemos `super_admin` SEPARADO del enum `role` de profiles
-- para evitar mezclar conceptos. Un super_admin es global del SaaS, no
-- pertenece a ninguna org. Un usuario PUEDE ser super_admin Y a la vez
-- tener un perfil en una org (poco común, pero permitido).

create table public.super_admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  added_by    uuid references auth.users(id),
  added_at    timestamptz not null default now(),
  notes       text
);

comment on table public.super_admins is
  'Usuarios con acceso global al SaaS (proveedor del servicio). Acceso transversal a todas las orgs.';

-- ============================================================================
-- 3. Columna org_id en tablas de negocio
-- ============================================================================
-- Nullable por ahora para permitir migración progresiva de datos existentes.
-- La migración 012 marcará NOT NULL después de seed.

alter table public.locations
  add column if not exists org_id uuid references public.organizations(id) on delete cascade;
create index if not exists locations_org_idx on public.locations(org_id);
comment on column public.locations.org_id is 'Org propietaria de esta ficha Google.';

alter table public.profiles
  add column if not exists org_id uuid references public.organizations(id) on delete cascade;
create index if not exists profiles_org_idx on public.profiles(org_id);
comment on column public.profiles.org_id is
  'Org del usuario. NULL solo si el usuario es super_admin del SaaS.';

alter table public.clients
  add column if not exists org_id uuid references public.organizations(id) on delete cascade;
create index if not exists clients_org_idx on public.clients(org_id);

alter table public.share_links
  add column if not exists org_id uuid references public.organizations(id) on delete cascade;
create index if not exists share_links_org_idx on public.share_links(org_id, opened_at desc);

alter table public.reviews
  add column if not exists org_id uuid references public.organizations(id) on delete cascade;
create index if not exists reviews_org_idx on public.reviews(org_id, google_created_at desc);

alter table public.audit_log
  add column if not exists org_id uuid references public.organizations(id) on delete cascade;
create index if not exists audit_log_org_idx on public.audit_log(org_id, created_at desc);

-- location_secrets NO necesita org_id propio: ya está aislado vía location_id,
-- y la location tiene su org_id. La RLS de location_secrets (sin policies,
-- solo service-role) se mantiene igual.

-- ============================================================================
-- 4. Funciones helper
-- ============================================================================

-- current_org_id(): devuelve el org_id del usuario autenticado (vía profiles).
-- Si el usuario no tiene perfil (caso super_admin sin org), devuelve NULL.
-- SECURITY DEFINER para que pueda leer profiles sin depender de RLS recursiva.
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid()
$$;

comment on function public.current_org_id() is
  'Devuelve el org_id del usuario autenticado. Base de las policies RLS multi-tenant.';

-- is_super_admin(): true si el usuario está en super_admins.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.super_admins where user_id = auth.uid()
  )
$$;

comment on function public.is_super_admin() is
  'True si el usuario autenticado es super_admin del SaaS. Excepción a las policies multi-tenant.';

-- ============================================================================
-- 5. Constraints adicionales
-- ============================================================================

-- Un sales debe tener org_id (consistente con el constraint heredado de location_id).
-- Lo añadimos en la 012 para no romper datos existentes prematuramente.

-- ============================================================================
-- 6. Datos iniciales mínimos para testing
-- ============================================================================
-- NO se crean orgs automáticamente. El usuario debe ejecutar manualmente:
--
--   -- 1. Crear org de pruebas:
--   insert into public.organizations (name, slug, status, billing_email)
--   values ('Org de Pruebas', 'pruebas', 'active', 'tu-email@ejemplo.com')
--   returning id;
--   -- copia el id retornado
--
--   -- 2. (Opcional) asignar todos los datos existentes a esa org:
--   update public.locations    set org_id = '<id-de-arriba>' where org_id is null;
--   update public.profiles     set org_id = '<id-de-arriba>' where org_id is null;
--   update public.clients      set org_id = '<id-de-arriba>' where org_id is null;
--   update public.share_links  set org_id = '<id-de-arriba>' where org_id is null;
--   update public.reviews      set org_id = '<id-de-arriba>' where org_id is null;
--   update public.audit_log    set org_id = '<id-de-arriba>' where org_id is null;
--
--   -- 3. Añadir super_admin (yo):
--   insert into public.super_admins (user_id, notes)
--   values ('<tu-uuid-de-auth.users>', 'Propietario del SaaS');
--
-- Estas operaciones SE HACEN A MANO después de aplicar la migración.
-- No se incluyen aquí para evitar daños accidentales en BD con datos previos.

-- ============================================================================
-- Fin migración 011
-- ============================================================================
