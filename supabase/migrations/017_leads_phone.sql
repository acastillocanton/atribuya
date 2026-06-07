-- 017_leads_phone.sql
-- Añade el teléfono de contacto a los leads de la landing.
--
-- Se añade como NULLABLE para no romper los leads ya capturados (que no
-- tienen teléfono). La obligatoriedad de cara al usuario se aplica en el
-- formulario (HTML `required`) y en la validación Zod del server action
-- `app/actions/submit-lead.ts`. Si en el futuro se quiere forzar a nivel
-- BD, primero hay que rellenar/limpiar las filas históricas.

alter table public.leads
  add column if not exists phone text;
