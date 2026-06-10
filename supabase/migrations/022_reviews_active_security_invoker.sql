-- Atribuya — migration 022
-- Fix de seguridad: la vista reviews_active (mig 010) se creó sin
-- security_invoker, así que ejecutaba con los permisos de su dueño
-- (postgres) y se saltaba la RLS de public.reviews. Resultado: cualquiera
-- con la anon key podía leer reseñas de todas las orgs vía PostgREST
-- (verificado E2E el 2026-06-10: la tabla devolvía [] y la vista la fila
-- completa). Detectado por el Security Advisor de Supabase
-- ("Security Definer View", CRITICAL).
--
-- Con security_invoker = true la vista evalúa permisos y RLS como el
-- usuario que consulta, igual que la tabla base.
--
-- Idempotente: ALTER VIEW SET es declarativo.
-- Reversible: alter view public.reviews_active set (security_invoker = false);

alter view public.reviews_active set (security_invoker = true);
