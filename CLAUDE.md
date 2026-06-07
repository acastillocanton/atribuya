# CLAUDE.md

Este archivo lo lee Claude Code automáticamente al abrir el repo. Vive en git → viaja entre Macs → todas las sesiones arrancan con el mismo contexto.

> **Fuente de verdad del producto**: [`spec.md`](spec.md). Si entra en conflicto algo de aquí con la spec, gana la spec.

---

## 1. Resumen

**Atribuya** — SaaS B2B multi-tenant para atribución de reseñas de Google Business Profile a comerciales individuales. Producto desarrollado por **Castillo Cantón** ([castillocanton.com](https://castillocanton.com)).

**Mercado objetivo (en orden de prioridad):**
1. Promotoras inmobiliarias con piso piloto y red comercial propia
2. Apartamentos turísticos vacacionales con red comercial
3. Clínicas (dentales, estética, fisio) con captación comercial
4. Servicios B2B con visitas comerciales (seguros, asesorías)

**Por qué existe**: empresas con red comercial necesitan saber qué reseña de Google ha conseguido cada comercial, sin pedirle al cliente que escriba el nombre del vendedor en la reseña. Hoy se hace a mano en Excel. La app automatiza la atribución por ventana temporal + similitud de nombres.

**Tres roles dentro de cada organización** (heredados del producto original):
- **admin** — gestor global de la organización. Da de alta fichas Google, invita comerciales, ve dashboard agregado.
- **sales** (comercial) — genera enlaces personalizados por cliente, ve sus reseñas, su ranking.
- **reviews_manager** — solo lectura + export Excel. Útil para responsables de marketing o RRHH.

**Encima de esos tres, un cuarto rol global del SaaS**:
- **super_admin** — yo (proveedor del servicio). Da de alta organizations a mano. Ve métricas técnicas de uso por org. No tiene acceso a los datos de negocio de las orgs salvo emergencia.

**Modelo de tenancy**: multi-tenant ligero. Una sola instancia técnica (un Vercel project, un Supabase project). Aislamiento por `org_id` en cada tabla relevante + RLS de Postgres. Sin self-service. Alta manual por super-admin.

**Flujo de usuario final** (sin cambios respecto al original):
1. Comercial comparte `[brand-domain]/c/{sales-slug}/{client-slug}` con cliente
2. Cliente cae directo en "Escribir reseña" en Google (302)
3. Cron diario (Places API + Business Profile API) trae las reseñas nuevas
4. Algoritmo atribuye al comercial por ventana temporal + nombre del cliente
5. Comercial recibe email transaccional, reseña aparece en su panel

**Stack** (idéntico al original — punto deliberado, no reinventar):
- Next.js 15.5 App Router + Turbopack + TypeScript strict
- Supabase (Postgres + Auth + RLS + Storage)
- Google Places API (New) legacy con API key + Google Business Profile API con OAuth
- Brevo SMTP (Supabase Auth + Nodemailer transaccional)
- Vercel Pro + Vercel Crons
- ExcelJS, qrcode.react, Zod, lucide-react, Vitest

**Arquitectura clave de Atribuya**:
| Aspecto | Atribuya |
|---|---|
| Tenancy | Multi-tenant ligero |
| Tablas | Todas las tablas de negocio con `org_id` |
| OAuth Google | Una cuenta por org cliente |
| Cron | Itera por org → por location |
| Onboarding | Alta de org por super_admin manualmente |
| Branding | Marca Atribuya |
| Dominio | atribuya.com |
| Términos legales | SaaS comercial con DPA |

---

## 2. Comandos

```bash
npm install            # primera vez en una máquina nueva
npm run dev            # dev en http://localhost:3000 (Turbopack)
npm run build          # build producción (verifica tipos)
npm run typecheck      # tsc --noEmit — pasar antes de cerrar tarea
npm run lint           # next lint
npm test               # Vitest unit tests
npm run test:watch     # Vitest en modo watch
```

Migraciones SQL: ejecutar en Supabase Dashboard → SQL Editor en orden numérico. Migraciones nuevas del fork empiezan en `011_*` (las 001-010 son las heredadas del original y deben aplicarse igual como base).

---

## 3. Estado del proyecto

> **Historia detallada** (qué entregó cada fase, ficheros, commits, fixes) → [docs/handoff/handoff.md](docs/handoff/handoff.md). Aquí solo el estado resumido; las **reglas durables** están en §4-§6.

| Fase | Estado |
|---|---|
| 0-7. Fork + multi-tenancy (mig 011-013) + RLS (23 policies) + `/super` + crons multi-tenant + routing público `/o/[orgSlug]/c/...` + branding | ✅ 2026-05-24 |
| 8. Legal: `/terminos` + `/privacidad` + **DPA finalizado** (`docs/legal/dpa.{md,docx}`, ver §7) | ✅ 2026-06-07 |
| 9. Despliegue Vercel + Supabase prod (proyecto único) | ✅ 2026-05-24 |
| 10. Landing comercial + lead capture (mig 014 `leads`) | ✅ 2026-05-24 |
| 11. Cron horario operativo (GitHub Actions) | ✅ 2026-06-06 |
| 12. SEO (sitemap + OG image 1200×630 + Twitter cards) | ✅ 2026-06-06 |
| 13. Dominio `atribuya.com` (Hostinger) | ✅ 2026-06-06 |
| 14. Lote 1 — calidad de reseñas (mig 015: duplicados, alertas ≤2★, plantillas, lockdown RLS) | ✅ 2026-06-06 |
| 15. Lote 2 — para vender (ranking, helpdesk mig 016, excel individual, parte por ficha) | ✅ 2026-06-06 |
| 16. Google Places API (Vía A) — vía pública de respaldo, top-5 reseñas recientes (ver §7) | ✅ 2026-06-07 |
| —. Reescritura de copy de la landing (ES+EN) a tono beneficio-first — métrica del hero, H1, CTAs por resultado, sectores destacados (detalle → handoff §9) | ✅ 2026-06-07 |
| —. Pricing definido: por nº de fichas, comerciales ilimitados, 2 tiers (45/149 €) + a medida (3 tarjetas), setup plano 60 € (detalle → §8 / handoff §9) | ✅ 2026-06-07 |
| —. Formulario de lead: campo **teléfono obligatorio** (mig 017 `leads.phone`), verificado E2E (detalle → handoff §9) | ✅ 2026-06-07 |
| —. Google OAuth Business Profile (Vía B) — todas las reseñas | ⏳ esperando aprobación Google (caso `7-4031000041620`, ~18-jun; ver §7) |

Extras (detalle → handoff.md): datos fiscales por org en `/super`, rebrand visual (logos/favicon), fix repo público para deploys Vercel Hobby. La fase 6 (routing) es **parcial**: solo la landing pública lleva prefijo `/o/`; las rutas autenticadas no (las protege RLS — ver §5.4).

---

## 4. Boundaries

### Always do
- Validar inputs externos con Zod en el límite del sistema.
- Parametrizar consultas vía Supabase query builder, nunca SQL crudo.
- Aplicar RLS en TODA tabla con datos de orgs.
- Usar `createServiceClient` solo en código server-only no expuesto al usuario.
- Filtrar siempre por `org_id` en server actions, incluso aunque RLS también filtre. Defensa en profundidad.
- `npm run typecheck` antes de cerrar tarea. `npm test` también si se ha tocado matcher, RLS o multi-tenancy.
- Actualizar `spec.md` cuando una decisión cambie.
- **Estilo de copy de cara al usuario** (landing, app, emails, legal): nunca usar guiones largos (— / –) como puntuación literaria (usar punto, coma o dos puntos) ni empezar oraciones con «Y». Norma de marca permanente; ya aplicada a landing + legal + emails (resto de UI pendiente).

### Ask first
- Migraciones de DB nuevas.
- Cambios al modelo de matching (algoritmo, umbrales, ventana temporal). El matcher es código sensible y ya está probado en producción.
- Cambios al modelo multi-tenant (cómo se aísla, qué tablas tienen org_id, etc.).
- Eliminación de cualquier funcionalidad que ya estaba en el original.

### Never do
- Exponer service-role a un componente cliente.
- Devolver `oauth_refresh_token`, `location_secrets`, ni nada de la org X al cliente de la org Y.
- Confiar en el `org_id` que venga del cliente. Siempre derivarlo del JWT vía `current_org_id()`.
- Permitir queries cross-org sin RLS explícita que lo autorice (solo super_admin).
- Commitear secretos. `.env*.local` en `.gitignore`.
- Hacer commits "fix multi-tenant" gigantes. Un commit = una migración o una feature.

---

## 5. Multi-tenant — reglas duras

Esta sección es nueva respecto al original. **Es la parte donde más cuidado hay que tener.**

### 5.1 El `org_id` lo decide el servidor, NUNCA el cliente

Toda server action y todo route handler que crea/lee/modifica datos de negocio debe:

1. Obtener el `user_id` del JWT (Supabase Auth).
2. Llamar a `current_org_id()` (función Postgres) o equivalente en TS para obtener el `org_id` del usuario.
3. Filtrar/insertar con ese `org_id` SIEMPRE.

Nunca aceptar `org_id` como parámetro del cliente. Si el cliente manda un `org_id` en el body, se ignora. Si pasa por URL (`/o/[orgSlug]/...`), se valida que coincide con el del usuario antes de proceder.

### 5.2 RLS es la línea de defensa final

Cada tabla de negocio (`locations`, `profiles`, `clients`, `share_links`, `reviews`, `audit_log`) tiene policies que filtran por `org_id = public.current_org_id()`. Si el código de aplicación olvida filtrar, RLS impide la filtración cross-org.

### 5.3 super_admin es la excepción y se trata como tal

El super_admin (yo) puede ver datos de cualquier org. Esto se modela con:
- Tabla aparte `super_admins (user_id)` — no es un valor del enum `role`.
- Policies que dicen `(org_id = current_org_id() OR is_super_admin())`.
- Middleware: super_admins van a `/super` como home, NO a `/dashboard`. No tienen acceso a las rutas org-scoped (les saldría vacío por RLS y resultaría confuso).
- **Audit log AGRESIVO**: toda acción del super_admin sobre orgs queda registrada (`actions.ts` en `app/(super)/super/`). Patrón: cada server action super-admin llama `recordAudit({ entityType: "organization", entityId: orgId, action: "...", orgId, payload: { actor_id, ... } })` antes o después del cambio.
- `deleteOrg` escribe el audit ANTES del DELETE (con `orgId: null` para que sobreviva al FK cascade) — el row queda en scope super_admin y nadie en la org X borrada podrá esconder la traza.

### 5.4 La landing pública `/o/[orgSlug]/c/[salesSlug][/clientSlug]`

**Resuelto (Phase 6, 2026-05-24)**: usamos path-prefix.

- Migración 013 cambió `profiles.slug` de UNIQUE global a UNIQUE por (org_id, slug). Dos orgs pueden tener un "juan-perez" sin colisionar.
- Rutas: `app/o/[orgSlug]/c/[salesSlug]/route.ts` (genérica) y `app/o/[orgSlug]/c/[salesSlug]/[clientSlug]/route.ts` (personalizada).
- `lib/landing.ts:recordOpenAndRedirect` resuelve la org **primero** (rechaza si no existe o está churned), luego busca el sales filtrando por `org_id = org.id`.
- Helper canónico para construir la URL: `lib/share-link.ts` (`buildShareUrl`, `buildShareDisplay`).
- La ruta vieja `/c/[salesSlug]/...` fue eliminada — no había URLs en producción para Atribuya todavía, así que no se necesita redirect de compatibilidad.
- Las **rutas autenticadas siguen sin prefijo** (`/dashboard`, `/panel`, `/comerciales`, etc.). RLS las protege; mover físicamente toda la jerarquía de carpetas es trabajo masivo con bajo beneficio práctico. Reevaluar si la ambigüedad de URL se vuelve un problema en producción.

### 5.5 OAuth Google multi-tenant — el tema espinoso

Cada org tiene que conectar SUS PROPIAS fichas Google con SU PROPIO Google Account. Esto implica:
- El consent screen de OAuth está en modo Testing → cada admin de org se añade como test user manualmente (hasta 100 usuarios). Suficiente para los primeros ~30 clientes con 2-3 admins cada uno.
- A medio plazo: pasar a producción con Google Verification + auditoría CASA. NO es prioridad ahora.
- Los `location_secrets` (tokens OAuth) se guardan asociados a la location, que ya tiene su `org_id`. Aislamiento natural.

### 5.6 Crons multi-tenant

El cron itera primero por `organizations` con `status='active'`, luego por `locations` de cada org. Esto permite:
- Throttling por org si una abusa de la API.
- Failover por org: si la org X tiene OAuth roto, no bloquea al resto.
- Métricas de uso por org.

### 5.7 Patrón TS de defense-in-depth para server actions

La RLS de Postgres es la línea final, pero el código TS también pone el filtro. Patrón canónico para una server action que **inserta** en una tabla con `org_id`:

```ts
import { requireOrgContext } from "@/lib/supabase/org";

export async function createX(input: CreateXInput) {
  // ... validar input con zod ...
  const supabase = await createClient();
  let orgCtx;
  try {
    orgCtx = await requireOrgContext(supabase);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No autorizado." };
  }
  const { error } = await supabase.from("x").insert({
    /* ... otros campos ... */
    org_id: orgCtx.orgId,
  } as never);
  // ...
}
```

- `requireOrgContext` lanza si no hay user autenticado, si el user no tiene `org_id` y no es `super_admin`, o si es super_admin sin org (flujos super_admin deben ir via service-role + org_id explícito).
- Para read-only operations donde `null` es aceptable, usar `getCurrentOrgContext` (no lanza).
- **Nunca aceptar `org_id` del input del cliente.** Siempre derivarlo de `requireOrgContext`.
- Para `recordAudit`, pasar `orgId` siempre que esté disponible — la firma lo acepta como opcional para no romper compatibilidad pero el objetivo es que todas las entradas estén tenant-scoped.

---

## 6. Estado real de Supabase

### 6.1 Proyecto único (actúa como prod) — `atribuya` (`iuiveiznvwjeoyhescmx`)
Creado 2026-05-24. **Renombrado en el dashboard `atribuya-dev` → `atribuya`** (2026-06-06); el ref `iuiveiznvwjeoyhescmx` es el mismo de siempre, no hay dos proyectos. Postgres 17.6, region `eu-central-1` (Frankfurt). Usa el nuevo formato de API keys de Supabase (`sb_publishable_*` / `sb_secret_*`). El SDK `@supabase/ssr` acepta ambos formatos sin tocar código.

**Decisión (2026-05-24)**: NO se crea un proyecto Supabase separado para prod. Se reusa este. Razones: MVP pre-cliente, free tier en ambos casos, complejidad operativa de 2 entornos no compensa el aislamiento. Cuando entre cliente #2-3 con tráfico real, creamos `atribuya-staging` y este pasa a ser prod oficial. Nombre del proyecto en el dashboard puede renombrarse a "atribuya" (Settings → General).

**Migraciones aplicadas:** 001 → 017. La 015 (calidad de reseñas + lockdown auto-update) aplicada el 2026-06-06. La **016** (helpdesk de soporte multi-tenant — 3 tablas `support_*` + RLS + `support_unread_count()`) aplicada el 2026-06-06. La **017** (`leads_phone` — añade `leads.phone text` nullable para el teléfono del formulario de la landing, obligatorio a nivel app) aplicada el 2026-06-07. El número 017 que el plan original reservaba para la caché de rating nunca se creó (descartada).

**Estado actual de datos:**
- `organizations` — 2 filas: Acme Promotora (active), Beta Apartamentos (trial) — `dev-seeds/01_*`.
- `locations` — 4 filas, 2 por org, todas `oauth_status='disconnected'` — `dev-seeds/01_*`.
- `profiles` — 5 filas, todos test users sintéticos (`test+*@atribuya.test`) — `dev-seeds/02_*`.
- `super_admins` — 1 fila, el test super_admin (`test+super@atribuya.test`).
- `auth.users` — 5 filas sintéticas con los UUIDs `aaaa...`/`bbbb...`/`cccc...`/`dddd...`/`eeee...`.
- Resto de tablas (`clients`, `share_links`, `reviews`, `audit_log`) — vacías.

**RLS verificada**: 15/15 tests de aislamiento pasan (ver [`docs/tests-multitenancy.md`](../docs/tests-multitenancy.md)). Admin de A no ve datos de B, super_admin ve todo.

**Flujo de trabajo con migraciones:**
```bash
# linkado una vez con `supabase link --project-ref iuiveiznvwjeoyhescmx`
supabase migration list --linked    # ver estado local vs remote
supabase db push --linked --dry-run # preview
supabase db push --linked           # aplica las pendientes
```

**SQL ad-hoc (sin Docker)** — usar la Management API con el PAT:
```bash
curl -X POST https://api.supabase.com/v1/projects/iuiveiznvwjeoyhescmx/database/query \
  -H "Authorization: Bearer <PAT>" \
  -H "Content-Type: application/json" \
  -d '{"query":"select now()"}'
```

### 6.2 Proyecto PROD — pendiente (Fase 9)
Se creará en la misma cuenta Supabase pero como proyecto aparte (`atribuya-prod` o similar). Hasta entonces, todo el desarrollo ocurre en `atribuya-dev`.

---

## 7. Despliegue actual (post-Fase 9)

**App live**: `https://atribuya.com` (Vercel Hobby, team `acastillocantons-projects`). `atribuya.vercel.app` sigue activo como dominio secundario.

> **Detalle operativo completo** (config de Brevo, DNS, gotchas, pasos de cada pieza) → [docs/handoff/handoff.md](docs/handoff/handoff.md) §7. Aquí solo el estado.

| Pieza | Estado |
|---|---|
| Vercel | ✅ `atribuya.com` (+ `atribuya.vercel.app`), Hobby, auto-deploy desde `main`. Repo **público** (Hobby bloquea deploys de repos privados). |
| Supabase | ✅ Proyecto `iuiveiznvwjeoyhescmx` (free tier) = prod. Auth Site URL `https://atribuya.com`. Super_admin `a.castillo.esv@gmail.com` (OTP). |
| Email (Brevo SMTP) | ✅ Operativo. Transaccional + Supabase Auth Custom SMTP. From `notificaciones@atribuya.com`, reply-to Gmail. Cuenta Free 300/día compartida con la newsletter de Castillo Cantón. Detalle + gotcha de plantillas Auth → handoff §7.2 / §8.1. |
| Crons | ✅ 2 diarios en `vercel.json` (Places + Business Profile) + horario en `.github/workflows/sync-places-hourly.yml` (secrets `APP_URL`/`CRON_SECRET`). |
| Legal + SEO | ✅ `/terminos`, `/privacidad`, **DPA** (`docs/legal/dpa.{md,docx}`). sitemap + OG 1200×630 + Twitter cards + canonical/hreflang. |
| **Google Places (Vía A)** | ✅ Proyecto Cloud `atribuya`, Places API **legacy** (no "New"), key restringida, facturación activa, **cuota 500/día + alerta 10 €/mes**. `GOOGLE_PLACES_API_KEY` en `.env.local` + Vercel. Probado E2E (`scripts/find-place.mjs`). Top-5 reseñas recientes por ficha, datos públicos. |
| **Google OAuth (Vía B)** | ⏳ Esperando a Google. Configurado: consent Testing, OAuth client (`GOOGLE_CLIENT_ID` `443155173600-…`), APIs Account Management + Business Information, redirect (el cliente OAuth tiene registrados www + apex + localhost). **Solicitud de acceso a Reviews API v4 enviada** → caso `7-4031000041620` (~7-10 días, ≈18-jun). Hasta aprobación, v4 da `PERMISSION_DENIED`. **Tras aprobar**: subir `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` a Vercel + probar OAuth. ⚠️ **Usar el `REDIRECT_URI` SIN www** (`https://atribuya.com/api/google/oauth/callback`): desde 2026-06-07 el host canónico es el apex y `www` hace 308 → apex; los callbacks OAuth no siguen redirecciones. El apex ya está autorizado en el cliente. Recordatorio remoto: `trig_01CBuCBCcBdJuvRfr5VeBpyi` (18-jun). |
| Stripe (billing) | ❌ No aplica. Facturación manual hasta cliente #5-8. |

---

## 8. Open questions

Sin resolver hasta que el usuario las decida (decisiones de negocio, no técnicas):

1. ~~**Pricing tiers**~~: **decidido (2026-06-07, v2)**. Se factura **por nº de fichas**, **comerciales ilimitados** en todos los planes (no penalizar el crecimiento del equipo). **2 tiers + a medida** (la mayoría del mercado es de una sola ficha): Starter hasta 2 fichas **45 €/mes** (destacado, el más vendido) · Professional hasta 10 fichas **149 €/mes** · A medida +10 fichas / cadenas. Entrada a 45 € porque el coste de infra (~45-55 €/mes Vercel+Supabase+Places) es **de plataforma, compartido entre tenants**, no por cliente → margen limpio desde el 2º cliente. Aplicado a la landing (ES+EN). **Pendiente**: enforcement del tope de fichas por plan (hoy `organizations.plan` es placeholder `text` sin validación; requiere migración → "ask first").
2. ~~**Setup pagado**~~: **decidido (2026-06-07)**: **60 € plano** para todas las fichas (filtro de compromiso, no ingreso). Incluye conexión de fichas, alta del equipo, formación y soporte inicial. Por eso el programa Cliente Insignia ya solo descuenta la **suscripción** (mitad de precio el primer año), no el setup.
3. **Billing**: primeros 5-8 clientes facturación manual con Holded. Stripe a partir del cliente 6-8.
4. **Mover rutas autenticadas bajo `/o/[orgSlug]/...`**: deferred en Fase 6. Reevaluar cuando llegue al cliente #5.

*Ya decididas*: nombre **Atribuya**, dominio **atribuya.com**, routing por path-prefix `/o/[orgSlug]/c/...`, **modelo de pricing (por fichas, comerciales ilimitados, 3 tiers + a medida)**.

### 8.1 Camino crítico al primer cliente (técnico)

En orden: ~~Brevo SMTP~~ (✅ hecho 2026-06-06) → ~~Google Cloud Places (Vía A)~~ (✅ hecho 2026-06-07) → ~~DPA~~ (✅ hecho 2026-06-07, ver fase 8) → **solo queda OAuth Business Profile (Vía B)**, esperando aprobación de Google (caso `7-4031000041620`, ≈ 18-19 jun). Ver §7 para el detalle. Lo demás de §8 son decisiones de negocio, no bloqueantes técnicos.

**Gotcha de plantillas de email de Supabase Auth**: las plantillas (Magic Link, Invite, Confirm signup, Recovery) NO deben usar el `{{ .ConfirmationURL }}` de fábrica — ese va por el flujo implícito y deja el token en el `#` de la home sin crear sesión. Tienen que apuntar al handler propio: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=/` (ver `app/auth/confirm/route.ts`, que hace `verifyOtp` server-side). La plantilla Magic Link branded vive versionada en `supabase/email-templates/magic-link.html`. Las invitaciones por código (`lib/invite.ts`) ya construyen ese link bien; el hueco estaba solo en el magic link de auto-login.

### 8.2 Roadmap de features pendientes (del producto base)

Lotes 1 y 2 hechos (Fases 14-15). Pendiente de portar desde el producto base single-tenant (detalle → handoff §7.8):
- **🟡 medio**: comisiones por reseña, suite E2E Playwright. *(Caché de rating por ficha: descartada, innecesaria.)*
- **🟠 grande / toca multi-tenant**: rol "director de oficina" (rediseño RLS), verificación multi-rol.
- **Pendiente menor del helpdesk**: badge de no-leídos en el sidebar (`support_unread_count()` en el layout) + acceso a Soporte en mobile.
- **Capturas `public/help/*.png`**: 7/9 regeneradas (modo demo + Playwright, `scripts/capture-help.py`). Pendientes 01 (email magic link) y 06 (diagrama) — se hacen a mano.

---

## 9. Mantenimiento de este archivo

**Reparto de docs** (importante): este archivo se **autocarga en cada sesión**, así que se mantiene **lean** — solo reglas durables (§4-§6), estado resumido (§3, §7) y decisiones pendientes (§8). La **historia detallada** (qué entregó cada fase, ficheros tocados, fixes, pasos de config) vive en [docs/handoff/handoff.md](docs/handoff/handoff.md), que se lee bajo demanda. No reintroducir narrativa larga en §3/§7 — va a handoff.

Cada vez que termine una fase significativa:
1. Añadir/marcar la fila en §3 con **una línea**; la narrativa detallada → handoff.md.
2. Si surge un workaround/gotcha durable, documentarlo en §8.1 o una sección §10+.
3. Si la BD cambia, actualizar §6.
4. Si se cierran open questions, actualizar §8.
5. Actualizar handoff.md (estado, env vars, fases) si cambió algo relevante.
6. Commit + push.
