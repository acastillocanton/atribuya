# Spec — Atribuya

> **Fuente de verdad del producto.** Este documento define qué construimos, por qué, y cómo sabemos que está hecho. Si un cambio entra en conflicto con esta spec, **se actualiza la spec primero** y luego se implementa.
>
> Documento vivo · versión 0.1 · responsable: Alejandro Castillo

---

## 1. Objective

**Qué construimos**: un SaaS B2B multi-tenant llamado **Atribuya** que permite a empresas con red comercial atribuir las reseñas de Google Business Profile a cada comercial individual, automáticamente.

**Por qué**: cualquier empresa con red comercial que dependa de reseñas de Google (promotoras, apartamentos turísticos, clínicas, concesionarios, asesorías con visitas comerciales) tiene el mismo problema: saber qué comercial consiguió cada reseña. Hoy se hace a mano en Excel. La app automatiza la atribución por ventana temporal + similitud de nombres.

**Para quién** (en orden de prioridad de captación):
1. **Promotoras inmobiliarias** con piso piloto y red comercial propia. Avatar primario: director comercial de promotora mediana (5-30 comerciales, 3-15 promociones activas).
2. **Apartamentos turísticos vacacionales** con red comercial. Avatar: director comercial de cadena hotelera/apartamentos.
3. **Clínicas** (dentales, estética, fisio) con captación comercial activa. Avatar: gerente de clínica o director comercial de red de clínicas.
4. **Servicios B2B con visitas comerciales** (seguros, asesorías, consultoras). Avatar: director comercial.

**No para quién** (mercados explícitamente excluidos):
- Retail de paso (restaurantes, tiendas, supermercados) — el comercial no identifica al cliente por nombre.
- Marketplaces — la reseña va al producto, no al vendedor.
- Servicios totalmente online sin contacto humano — no hay "comercial" al que atribuir.

**Definition of Done del MVP comercial**: ver §8 Success Criteria.

---

## 2. Tech Stack

Idéntico al producto original Atribuya. Decisión deliberada: no reinventamos lo que ya funciona en producción.

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | Next.js (App Router, Turbopack) | 15.5.x |
| Lenguaje | TypeScript strict (+ `noUncheckedIndexedAccess`) | 5.7+ |
| UI | React 19 + CSS variables + Tailwind | 4.x |
| Backend / DB | Supabase (Postgres + Auth + RLS) | hosted |
| Auth | Magic-link vía Supabase Auth (Brevo SMTP) + roles aplicados con middleware + RLS | — |
| Integración externa | Google Places API (New) v1 + Google Business Profile API v1 + OAuth 2.0 | — |
| Email transaccional | Brevo SMTP vía Nodemailer | — |
| Hosting + Cron | Vercel Pro + Vercel Crons | — |
| Excel | ExcelJS (server-side, dynamic import) | 4.x |
| QR | qrcode.react | 4.x |
| Validación | Zod | 3.x |
| Tests | Vitest (unit) | 4.x |
| Pagos | Manual (Holded) en fase 1 · Stripe en fase 2 | — |

**Multi-tenant ligero**: una sola instancia técnica, una sola DB, aislamiento por `org_id` + RLS. Sin self-service.

---

## 3. Roles y permisos

### Roles dentro de una organización (mismos que en el original)
- **admin** — gestor global de la organización. Da de alta fichas Google, invita comerciales, ve dashboard, configura objetivos.
- **sales** (comercial) — genera enlaces personalizados, ve sus reseñas y ranking.
- **reviews_manager** — solo lectura + export Excel.

### Rol global del SaaS (nuevo)
- **super_admin** — yo, proveedor del servicio. Da de alta organizations, gestiona la facturación, monitoriza uso técnico. NO accede a datos de negocio de las orgs salvo emergencia explícitamente loggeada en audit.

### Matriz de permisos cross-org
- Un usuario pertenece a UNA org (campo `org_id` en `profiles`).
- Salvo el super_admin, que no pertenece a ninguna org en concreto (`org_id IS NULL` + flag `is_super_admin = true`).
- Excepción futura (V2): grupos empresariales que necesiten ver varias orgs. NO ahora.

---

## 4. Modelo de datos

### Tablas heredadas del original (con `org_id` añadido por migración 011)
- `locations` (fichas Google) — añade `org_id`
- `profiles` (usuarios) — añade `org_id` (nullable solo para super_admin)
- `clients` (clientes finales) — añade `org_id`
- `share_links` — añade `org_id` (denormalizado para queries rápidas)
- `reviews` — añade `org_id` (denormalizado)
- `audit_log` — añade `org_id`
- `location_secrets` — NO necesita `org_id` (ya está aislada vía `location_id` y la location tiene `org_id`)

### Tablas nuevas del fork
- `organizations` — tabla raíz del multi-tenant
- `super_admins` — quiénes tienen acceso global (opcional, alternativa al flag en profiles)

### Detalle de `organizations` (mínimo viable)
```
id              uuid PK
name            text — razón social o nombre comercial visible
slug            text unique — para path prefix (`/o/[slug]/...`)
status          enum ('trial', 'active', 'suspended', 'churned')
plan            text — placeholder para tiering futuro
billing_email   text — email del responsable de facturación
contact_name    text
contact_phone   text
fiscal_data     jsonb — datos de facturación (CIF, dirección, etc.)
trial_ends_at   timestamptz nullable
created_at      timestamptz
updated_at      timestamptz
```

### Helper Postgres: `current_org_id()`
Función `security definer` que lee el `org_id` del profile del usuario autenticado. Es la base de todas las policies RLS multi-tenant.

---

## 5. RLS multi-tenant (resumen)

Cada policy de las tablas de negocio se convierte en:

```sql
-- Antes (single-tenant)
using (public.current_role() = 'admin')

-- Después (multi-tenant)
using (
  public.current_role() = 'admin'
  and (org_id = public.current_org_id() or public.is_super_admin())
)
```

Patrón:
- Admin de la org X: ve solo datos de X.
- Sales de la org X: ve solo datos suyos dentro de X.
- Manager de la org X: ve solo datos de X (solo lectura).
- Super-admin: ve todo (con audit log obligatorio).

Detalles completos en el SQL de la migración 012.

---

## 6. Flujo de usuario final (sin cambios respecto al original)

1. Admin de una org da de alta una ficha Google y la conecta vía OAuth.
2. Admin invita comerciales con email + objetivo mensual.
3. Comercial completa onboarding por magic-link.
4. Comercial registra un cliente en su panel (nombre y opcionalmente email/teléfono).
5. App genera enlace `/o/[org-slug]/c/[sales-slug]/[client-slug]` (o ruta equivalente según decisión §5 de CLAUDE.md).
6. Comercial comparte enlace por WhatsApp/email/SMS/QR.
7. Cliente abre enlace → app registra `share_link` → 302 a "Escribir reseña" en Google.
8. Cliente deja reseña en Google.
9. Cron diario (Places API + Business Profile API) trae reseñas nuevas.
10. Matcher las atribuye al comercial por ventana temporal (48h) + similitud de nombre.
11. Comercial recibe email transaccional cuando hay match `counted`.
12. Reseña aparece en su panel; agregados se actualizan; ranking se reconstruye.

---

## 7. Algoritmo de matching

**Idéntico al del producto original.** No tocar sin razón justificada y aprobación explícita.

Resumen:
- Ventana temporal: 48h desde la apertura del enlace.
- Bonus temporal: si la reseña llega en las primeras 4h, +8 a la confianza.
- Penalización: si llega más allá de 24h, -10.
- Similitud de nombre: heurística que compara tokens normalizados con sets, contempla iniciales ("Antonio R."), maneja anónimos.
- Thresholds: `AUTO_THRESHOLD = 75` (counted automático), `PENDING_THRESHOLD = 40` (a verificación manual).
- Modo `anonymous_author`: si Google no devuelve nombre, ventana corta 4h + único candidato = pending.

Tests existentes en `lib/matching/__tests__/attribute-review.test.ts` (22 tests). Cualquier cambio al matcher requiere actualizar tests y `Ask first`.

---

## 8. Success Criteria

### MVP comercial (fase 1) — Definition of Done

El MVP comercial está listo para captar el primer cliente cuando **todas** estas condiciones son verdad:

**Multi-tenant funcional:**
- [ ] Migración 011 aplicada: tabla `organizations` + `org_id` en todas las tablas de negocio.
- [ ] Migración 012 aplicada: RLS rewrite multi-tenant.
- [ ] Función `current_org_id()` y, si aplica, `is_super_admin()` operativas.
- [ ] Crear 2 orgs ficticias en dev y verificar aislamiento total: usuario de org A no puede ver datos de org B ni a través de UI ni a través de API directa.
- [ ] Tests automatizados que verifican aislamiento multi-tenant.

**Onboarding manual operativo:**
- [ ] Panel `/super` accesible solo por super-admin.
- [ ] Desde `/super` se puede crear una org nueva con admin inicial y enviarle invitación.
- [ ] Audit log de toda acción de super-admin.

**Branding completo:**
- [ ] Marca "Atribuya" consistente en el código y en la UI.
- [ ] Logo, favicon, og-image nuevos.
- [ ] Términos del servicio, política de privacidad, aviso legal nuevos (validados por abogado).
- [ ] Dominio comercial registrado y apuntando al nuevo Vercel.

**Despliegue:**
- [ ] Cuenta Vercel con proyecto propio.
- [ ] Proyecto Supabase propio.
- [ ] Proyecto Google Cloud con OAuth consent screen propio.
- [ ] Cuenta Brevo (o subaccount).
- [ ] CRON_SECRET, llaves OAuth y service-role independientes.

**Pre-comercial:**
- [ ] Landing comercial mínima (una página) con caso anonimizado.
- [ ] Dossier comercial PDF con metodología y, cuando haya datos, números reales.

### Fase 2 — Crecimiento (no es DoD del MVP, solo orientación)
- Stripe integration cuando se llegue a 5-8 clientes activos.
- Onboarding self-service cuando se llegue a 10+ clientes.
- Google Verification + CASA cuando se rebase el límite de test users.

---

## 9. Boundaries

### Always do
- Validar inputs externos en el límite del sistema.
- Aplicar RLS en TODA tabla con datos de orgs.
- Filtrar siempre por `org_id` también en código de aplicación (defensa en profundidad).
- Usar `recordAudit()` para escribir en `audit_log`.
- `npm run typecheck` y `npm test` antes de cerrar tarea.
- Actualizar la spec cuando una decisión cambie.

### Ask first
- Migraciones de DB nuevas.
- Cambios al modelo de matching.
- Cambios al modelo multi-tenant.
- Cualquier cambio al sidebar / IA de las pantallas.
- Eliminar funcionalidad heredada del original.

### Never do
- Commitear secretos.
- Exponer service-role en cliente.
- Devolver tokens OAuth o location_secrets al cliente.
- Aceptar `org_id` del cliente sin validar contra el del usuario.
- Permitir queries cross-org sin RLS explícita (excepto super-admin).
- Confiar en validación cliente como límite de seguridad.

---

## 10. Open questions

(Mismas que en CLAUDE.md §8 — sincronizar cuando cambien.)

1. Nombre comercial definitivo
2. Dominio definitivo
3. Path prefix vs subdominio
4. ~~Pricing tiers exactos~~ — **decidido (2026-06-07, v2)**: se factura **por nº de fichas** (no por comerciales), **comerciales ilimitados** en todos los planes. **2 tiers + a medida** (la mayoría del mercado es de una ficha): Starter (hasta 2 fichas, 45 €/mes, el más vendido), Professional (hasta 10 fichas, 149 €/mes), A medida (+10 / cadenas). Entrada a 45 € porque el coste de infra es de plataforma compartido entre tenants → margen desde el 2º cliente. *Enforcement técnico del tope de fichas pendiente (hoy `organizations.plan` es placeholder sin validación).*
5. ~~Qué incluye el setup pagado~~ — **decidido (2026-06-07; revisado a 129 € el 2026-06-08)**: **129 € plano** para todas las fichas. Incluye conexión de fichas, alta del equipo, formación y soporte inicial. **Nota (2026-06-07)**: el programa **Cliente Insignia** y la **garantía de 90 días** se retiraron de la landing (ES+EN) y de la FAQ por decisión del usuario.
6. Cuándo introducir Stripe

---

## 11. Versioning

- v0.1 (este documento) — versión inicial.
- Cambios futuros: actualizar version + fecha + responsable.
