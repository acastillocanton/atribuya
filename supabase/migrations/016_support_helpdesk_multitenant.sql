-- 016_support_helpdesk_multitenant.sql
-- Helpdesk interno multi-tenant. Portado de la migración 023 del producto base
-- single-tenant (ReseñaHub) y adaptado a Atribuya:
--   • org_id NOT NULL en las 3 tablas (FK a organizations, ON DELETE CASCADE).
--   • RLS con el patrón multi-tenant `(org_id = current_org_id() OR is_super_admin())`
--     (igual que la migración 012), usando los helpers current_role()/current_org_id().
--   • SIN rol office_director (Atribuya no lo tiene): respondedores = admin +
--     reviews_manager; asker = sales. El soporte es INTRA-ORG (cada org ve solo
--     su propio helpdesk). Un canal cliente↔super_admin sería otra tabla futura.
--
-- Aislamiento: un comercial de la org A jamás ve conversaciones de la org B.

-- ============================================================
-- 1. TABLES
-- ============================================================

create table public.support_conversations (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  subject         text not null,
  -- CHECK constraint (no enum) para evitar 55P04 al añadir categorías.
  category        text not null default 'general'
    check (category in ('general','review_question','technical','billing')),
  status          text not null default 'open'
    check (status in ('open','closed')),
  opener_id       uuid not null references public.profiles(id) on delete cascade,
  -- Vínculo contextual opcional
  linked_review_id  uuid references public.reviews(id) on delete set null,
  linked_client_id  uuid references public.clients(id) on delete set null,
  created_at      timestamptz not null default now(),
  closed_at       timestamptz,
  -- Denormalizado para ordenar la bandeja por actividad sin JOIN+aggregation.
  last_message_at timestamptz not null default now()
);

create index support_conversations_org_idx
  on public.support_conversations(org_id);
create index support_conversations_opener_idx
  on public.support_conversations(opener_id);
create index support_conversations_status_activity_idx
  on public.support_conversations(org_id, status, last_message_at desc);

create table public.support_messages (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  conversation_id   uuid not null references public.support_conversations(id) on delete cascade,
  author_id         uuid not null references public.profiles(id) on delete cascade,
  body              text not null,
  created_at        timestamptz not null default now()
);

create index support_messages_thread_idx
  on public.support_messages(conversation_id, created_at asc);
create index support_messages_org_idx
  on public.support_messages(org_id);

-- Read tracking: una fila por usuario × conversación. UPSERT al abrir.
create table public.support_read_receipts (
  user_id           uuid not null references public.profiles(id) on delete cascade,
  conversation_id   uuid not null references public.support_conversations(id) on delete cascade,
  org_id            uuid not null references public.organizations(id) on delete cascade,
  last_read_at      timestamptz not null default now(),
  primary key (user_id, conversation_id)
);

create index support_read_receipts_org_idx
  on public.support_read_receipts(org_id);

-- ============================================================
-- 2. RLS
-- ============================================================

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_read_receipts enable row level security;

-- ---- support_conversations ----

-- Admin + reviews_manager: acceso total DENTRO DE SU ORG (son los respondedores).
create policy support_conv_responder_all
  on public.support_conversations for all to authenticated
  using (
    public.current_role() in ('admin', 'reviews_manager')
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    public.current_role() in ('admin', 'reviews_manager')
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

-- Sales: solo ve/crea/actualiza las suyas, dentro de su org.
create policy support_conv_sales_select
  on public.support_conversations for select to authenticated
  using (
    public.current_role() = 'sales'
    and opener_id = auth.uid()
    and (org_id = public.current_org_id() or public.is_super_admin())
  );

create policy support_conv_sales_insert
  on public.support_conversations for insert to authenticated
  with check (
    public.current_role() = 'sales'
    and opener_id = auth.uid()
    and org_id = public.current_org_id()
  );

create policy support_conv_sales_update
  on public.support_conversations for update to authenticated
  using (
    public.current_role() = 'sales'
    and opener_id = auth.uid()
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    public.current_role() = 'sales'
    and opener_id = auth.uid()
    and org_id = public.current_org_id()
  );

-- ---- support_messages ----
-- Hereda la visibilidad de la conversación via EXISTS (Postgres re-aplica la RLS
-- de support_conversations en la subconsulta) + filtro de org como defensa.

create policy support_msg_select
  on public.support_messages for select to authenticated
  using (
    (org_id = public.current_org_id() or public.is_super_admin())
    and exists (
      select 1 from public.support_conversations c
      where c.id = support_messages.conversation_id
    )
  );

-- Cualquiera que vea la conversación puede postear. Fuerza author_id = self.
create policy support_msg_insert
  on public.support_messages for insert to authenticated
  with check (
    author_id = auth.uid()
    and org_id = public.current_org_id()
    and exists (
      select 1 from public.support_conversations c
      where c.id = support_messages.conversation_id
    )
  );

-- ---- support_read_receipts ----
-- Solo las propias (dentro de su org).

create policy support_read_own
  on public.support_read_receipts for all to authenticated
  using (
    user_id = auth.uid()
    and (org_id = public.current_org_id() or public.is_super_admin())
  )
  with check (
    user_id = auth.uid()
    and org_id = public.current_org_id()
  );

-- ============================================================
-- 3. FUNCIÓN: support_unread_count()
-- ============================================================
-- Conversaciones con mensajes no leídos para el usuario actual, scoped a su org.
-- SECURITY DEFINER para leer profiles.role sin RLS. Llamar via
-- supabase.rpc("support_unread_count").

create or replace function public.support_unread_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from support_conversations c
  left join support_read_receipts r
    on r.conversation_id = c.id and r.user_id = auth.uid()
  where
    -- Solo conversaciones con actividad posterior a la última lectura
    (r.last_read_at is null or c.last_message_at > r.last_read_at)
    -- Aislamiento por org (super_admin no participa en el helpdesk de orgs)
    and c.org_id = public.current_org_id()
    -- Scope por rol (misma lógica que las RLS policies)
    and case public.current_role()
      when 'admin' then true
      when 'reviews_manager' then true
      when 'sales' then c.opener_id = auth.uid()
      else false
    end;
$$;

grant execute on function public.support_unread_count() to authenticated;
