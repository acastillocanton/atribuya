-- Fase 5 del portado ReseñaHub → Atribuya: rol director de oficina (parte 1/2).
-- Adaptado de la migración 011 del original. ESTA migración SOLO añade el valor
-- al enum; el constraint, helper, columna director_id y policies RLS viven en la
-- 021.
--
-- ¿Por qué dos archivos? Postgres no deja usar un nuevo valor de enum como
-- literal en la misma transacción en que se añadió (ERROR 55P04: "unsafe use of
-- new value"). El SQL Editor de Supabase envuelve cada ejecución en UNA
-- transacción, así que esta migración tiene que COMMIT antes de la 021.
-- Aplicar la 020 y, en una ejecución separada, la 021.

alter type role_enum add value if not exists 'office_director';
