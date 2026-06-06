-- Atribuya — demo seed (idempotent-ish, run once on dev environments)
-- Creates demo locations only. Profiles must be created via Supabase Auth + invite flow.

insert into public.locations (name, oauth_status)
values
  ('Demo Apartamentos — Oropesa',  'disconnected'),
  ('Demo Apartamentos — Peñíscola', 'disconnected'),
  ('Demo Apartamentos — Cullera',   'disconnected')
on conflict do nothing;
