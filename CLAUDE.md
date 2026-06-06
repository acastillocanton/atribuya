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

| Fase | Estado | Notas |
|---|---|---|
| 0. Fork inicial del repo | ✅ Hecho (2026-05-24) | Commit `4170a48`. Repo en `github.com/acastillocanton/atribuya`. |
| 1. Migración 011 — organizations + org_id | ✅ Hecho (2026-05-24) | Aplicada en Supabase atribuya-dev. Helpers `current_org_id()` e `is_super_admin()` operativos. Seed con 2 orgs ficticias (Acme Promotora, Beta Apartamentos) + 4 locations en `supabase/dev-seeds/01_*`. Aislamiento por `org_id` verificado a nivel SQL (sin RLS todavía). |
| 2. Migración 012 — RLS rewrite multi-tenant | ✅ Hecho (2026-05-24) | Aplicada en atribuya-dev. 23 policies activas (18 reescritas + 4 nuevas + 1 inalterada). Aislamiento validado con 15/15 tests en `docs/tests-multitenancy.md` usando 5 test profiles sintéticos en `supabase/dev-seeds/02_*`. |
| 3. Helper `current_org_id()` + middleware | ✅ Hecho (2026-05-24) | TS wrapper `lib/supabase/org.ts` con `getCurrentOrgContext()` y `requireOrgContext()`. Middleware ahora lee `org_id` + `is_super_admin`, redirige a `/login?error=no-org` si el user no tiene ninguno. 4 server actions críticas (createLocation, inviteSales, inviteReviewsManager, createClientRecord) y `recordAudit` ahora estampan `org_id` explícitamente. 8 tests unitarios. |
| 4. Adaptar cron Places y Business Profile | ✅ Hecho (2026-05-24) | Ambos crons + `lib/google/sync-places.ts` filtran por `organizations.status IN ('active','trial')`. `lib/cron/process-reviews.ts` ahora requiere `org_id` en `LocationCtx` y lo estampa en `reviews` + `audit_log` (notify_failed). `lib/landing.ts` setea `org_id` en `share_links` derivado del perfil del sales. 2 tests nuevos validan la propagación de `org_id` con fixture de 2 orgs. |
| 5. Panel `/super` (super-admin) | ✅ Hecho (2026-05-24) | Layout `app/(super)/layout.tsx` con guard `is_super_admin`. Página `/super` lista orgs vía RLS (policy `organizations_super_admin_all`). Server actions: `createOrg`, `setOrgStatus`, `deleteOrg`, `inviteOrgAdmin` — todas con `assertSuperAdmin()` + audit_log explícito. Middleware redirige super_admins a `/super` como home y les bloquea `/dashboard` etc. |
| 6. Routing path-prefix `/o/[orgSlug]/...` | ✅ Hecho (parcial, 2026-05-24) | **Alcance acotado al caso crítico**: la landing pública migrada a `/o/[orgSlug]/c/[salesSlug][/clientSlug]` + migración 013 (`profiles.slug` UNIQUE por org). Las rutas autenticadas (`/dashboard`, `/panel`, etc.) SIGUEN sin prefijo — RLS las protege; mover físicamente todas las carpetas es trabajo masivo con bajo beneficio práctico. Reevaluar antes del cliente #5 si la ambigüedad de URL en la UI es un problema. |
| 7. Branding Atribuya en toda la app | ✅ Hecho (2026-05-24) | Marca "Atribuya" en CLAUDE.md/spec.md/README.md/super layout. Fixtures en `lib/demo-data.ts` ahora "Acme Promotora" / "Beta Apartamentos". `package.json` name = "atribuya". README.md reescrito. **NO toqué**: capturas en `public/help/*.png` (UI con branding antiguo — regenerar cuando llegue rebrand visual) ni plantillas Auth en Dashboard Supabase. |
| 8. Términos legales nuevos | ⏳ Pendiente | Pendiente DPA por separado cuando entre primer cliente |
| 9. Landing comercial mínima | ⏳ Pendiente | Una sola página con caso anonimizado |
| 9. Despliegue Vercel + Supabase prod | ✅ Hecho (2026-05-24) | App live en `https://atribuya.vercel.app`. Decisión: **un solo proyecto Supabase** (el original `atribuya-dev` actúa también como prod) para mantener free tier. Vercel Hobby. Login OTP funcional, super_admin `a.castillo.esv@gmail.com` operativo. Smoke tests 4/4 OK (/login, /super, /api/cron sin auth, /api/cron con auth). Fixes adicionales: git history reescrita (los 12 commits tenían author `usuario@usuarios-MacBook-Pro.local`, Vercel los bloqueaba; ahora todos son `Alejandro Castillo <a.castillo.esv@gmail.com>` y los deploys pasan). Supabase Auth Site URL + redirect allowlist actualizado vía Management API a `https://atribuya.vercel.app`. |
| 8. Legal — datos del responsable y rewrite comercial | ✅ Hecho (2026-05-24) — fuera de orden | `/terminos` y `/privacidad` reescritos íntegramente como SaaS comercial multi-tenant (14 + 11 secciones), modelo correcto Responsable/Encargado del RGPD. Banner "Borrador técnico" eliminado. Datos del responsable: Alejandro Castillo Cantón, NIF 55418862V, Benicàssim. **Texto consultado por el usuario y aprobado**. Pendiente DPA por separado cuando entre primer cliente. |
| 7.b Rebrand visual y favicon | ✅ Hecho (2026-05-24) | Logos reales (`logo-cuadrado.png` 564×564 y `logo-horizontal.png` 704×282) en `public/brand/`. `app/icon.png` y `app/apple-icon.png` actualizados (favicon + apple-touch). Header de `/super` ahora muestra el logo (antes solo wordmark texto). Email template `notify-new-review.ts` arreglado: logo URL apuntaba a `atribuya.es` (placeholder 404); pie tenía `Reseña<span>Hub</span>` partido en spans que el sed no capturó — ambos limpios. |
| Feat extra: datos fiscales por org | ✅ Hecho (2026-05-24) | `createOrg` en `/super` ahora pide opcionalmente legal_name, tax_id, dirección, CP, ciudad, provincia, país; se guardan en `organizations.fiscal_data`. Listado en `/super` muestra badge "Fiscales ✓ / parciales / pendientes" con tooltip de campos faltantes. |
| 10. Landing comercial mínima | ✅ Hecho (2026-05-24) | `app/page.tsx` reescrita: hero + sectores + problema + 3 pasos + caso anonimizado ("promotora en Costa de Castellón") + features + formulario lead + footer. Migración 014 añade tabla `leads` (pre-org, super_admin-only, INSERT vía service-role). Server action `app/actions/submit-lead.ts` con Zod + honeypot (campo `website`) + captura UA/IP. 9 tests nuevos (81/81 total). Middleware actualizado: bots permitidos en `/`, `/terminos`, `/privacidad`, `/robots.txt`, `/sitemap.xml` (antes 403 a TODA la app — pre-existing bug que rompía indexación). `app/robots.ts` reescrito: allow las 3 públicas, disallow las 14 privadas. Landing prerenderiza estática (6.98 kB). Sin Calendly: CTA es formulario embebido — los leads notifican por email cuando Brevo esté listo (hoy solo BD). |
| 11. Cron horario operativo | ✅ Hecho (2026-06-06) | `.github/workflows/sync-places-hourly.yml` fallaba cada hora (emails de "All jobs have failed"). Causa: secrets `APP_URL` y `CRON_SECRET` nunca configurados en GitHub → env vacías → endpoint devolvía 401. Fix: `gh secret set APP_URL=https://atribuya.com` + `CRON_SECRET=<el de .env.local>`. Además se añadió `CRON_SECRET` en Vercel env vars (antes faltaba en prod → el endpoint rechazaba TODA llamada con 401). Run manual `workflow_dispatch` → success. |
| 12. SEO — sitemap + OG image + Twitter cards | ✅ Hecho (2026-06-06) | Auditoría con skills `web-quality-audit`. `app/sitemap.ts` creado (4 URLs públicas; antes `robots.ts` referenciaba `/sitemap.xml` inexistente → 404 a Googlebot). `app/opengraph-image.tsx` + `app/en/opengraph-image.tsx` generan OG image 1200×630 dinámica via `next/og` (edge ImageResponse, sin PNG estático). `metadataBase` añadido en `app/layout.tsx`. `twitter:card summary_large_image` en ambas landings. |
| 13. Dominio comercial atribuya.com | ✅ Hecho (2026-06-06) | Comprado en Hostinger. DNS: A `@`→`76.76.21.21`, CNAME `www`→`cname.vercel-dns.com`. Dominio añadido en Vercel. Todas las URLs hardcodeadas migradas `atribuya.vercel.app`→`atribuya.com` (sitemap, metadataBase, canonical, hreflang, OG, terminos). Supabase Auth Site URL → `https://atribuya.com` + redirect allowlist actualizada. `NEXT_PUBLIC_APP_URL` en Vercel → `https://atribuya.com`. Verificado: `atribuya.com` 308→`www.atribuya.com` 200 OK. |
| Fix infra: repo público | ✅ Hecho (2026-06-06) | Vercel Hobby bloqueaba TODOS los deploys por git push de repos privados ("commit author does not have contributing access"). El redeploy manual desde UI también bloqueado. Solución: repo `acastillocanton/atribuya` pasado a **público** (no hay secretos en el código, todos en env vars de Vercel). Deploys vuelven a pasar. Hay un Deploy Hook creado en Vercel (Settings→Git) como vía alternativa de disparo manual. |
| 14. Portar mejoras de calidad de reseñas (lote 1) | ✅ Hecho (2026-06-06) | Migración **015** (`is_duplicate`, `low_rating_alerted_at`, `message_templates` + lockdown `profiles_self_update` que congela org_id/role/slug/monthly_goal/location_id/status). 5 features portadas del producto base single-tenant, adaptadas a multi-tenant: **detección de duplicados** (anti-fraude por client_id, `lib/cron/duplicate-detection.ts`), **edit-merge** (reseñas editadas en Google, `lib/cron/edit-merge.ts`), **alertas ≤2★** (`lib/cron/low-rating-alerts.ts` + `lib/email/notify-low-rating.ts`, destinatarios resueltos POR ORG — admin+manager+sales, sin cross-org; quitado el rol "director" del original), **plantillas de mensaje por comercial** (`app/(sales)/panel/plantillas/`), **lockdown RLS**. Filtro `is_duplicate=false` en KPIs (dashboard, panel, comerciales, export). 31 tests nuevos (115/115). Las alertas/plantillas envían email solo cuando Brevo esté configurado (degradan con gracia). |
| 15. Portar features para vender (lote 2) | ✅ Hecho (2026-06-06) | 4 features del producto base portadas y adaptadas a multi-tenant + limpieza de stub. **(2.1) Ranking + insignias**: `lib/leaderboard.ts` (org-scoped, sin rol director; el panel del comercial usa service-role filtrado por `org_id` porque un `sales` no puede leer perfiles de compañeros vía RLS), `lib/panel-badges.ts` + `lib/panel-motivation.ts` + `bucketByMonth` en `lib/date-range.ts`, componentes `components/{ranking,panel}/*` + `components/ui/Badge.tsx`, páginas `/ranking` (admin/manager) y `/panel/ranking` (sales, ya no stub) + insignias reales en `/panel`. Fallbacks demo en las 3 vistas (probar sin BD: `NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run dev`). **(2.2) Helpdesk de soporte** (intra-org): migración **016** (`support_conversations`/`support_messages`/`support_read_receipts` con `org_id` + RLS multi-tenant + `support_unread_count()`), `app/(profile)/soporte/*`, `components/soporte/*`, `lib/email/notify-support.ts` (respondedores resueltos POR ORG). Enlace "Soporte" en sidebar (sin badge de no-leídos todavía — añadir tras confirmar uso). **(2.3) Excel individual por comercial**: `lib/reports/sales-report.ts` + `app/api/export/sales/[id]/route.ts` (aislamiento por `org_id` en queries service-role), botones en `/panel/resenas` y `/comerciales/[slug]`. **(2.4) Parte por ficha**: 3ª hoja "Parte por ficha" en `/api/export/reviews` (mes anterior vs mes actual por comercial agrupado por ficha; sin migración — se descartó la caché de rating por innecesaria). **(1.3)** Stub `/ajustes` eliminado. Sin rol `office_director` ni departamentos (específicos del cliente original). 56 tests nuevos (174/174). |

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

**Migraciones aplicadas:** 001 → 016. La 015 (calidad de reseñas + lockdown auto-update) aplicada el 2026-06-06. La **016** (helpdesk de soporte multi-tenant — 3 tablas `support_*` + RLS + `support_unread_count()`) aplicada el 2026-06-06. La 017 que el plan reservaba para la caché de rating **no llegó a crearse** (el parte por ficha se resolvió con una hoja extra en el export, sin necesitar caché).

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

| Pieza | Estado | Detalle |
|---|---|---|
| Vercel proyecto | ✅ Live | `atribuya.com` (primario) + `atribuya.vercel.app`, plan Hobby, auto-deploy desde `main` de GitHub. Repo **público** (necesario para que Hobby no bloquee deploys — ver Fase 12+). |
| Vercel env vars | ✅ Configuradas | Supabase URL + keys, CRON_SECRET (= el de `.env.local`; añadido 2026-06-06, antes faltaba en prod), NEXT_PUBLIC_APP_URL=`https://atribuya.com`, GOOGLE_OAUTH_REDIRECT_URI. Google/Brevo vacíos (deferidos). |
| Supabase | ✅ Operativo | Proyecto `iuiveiznvwjeoyhescmx` (free tier) sirve también de prod. Migraciones 001-015 aplicadas. |
| Supabase Auth Site URL | ✅ Correcto | `https://atribuya.com`. Allowlist incluye también `atribuya.vercel.app/**` y `localhost:3000/**`. |
| Super_admin | ✅ Creado | `a.castillo.esv@gmail.com` (id `b2eab873-…`). Login via OTP. |
| Logos + favicon | ✅ Atribuya | `public/brand/logo-{cuadrado,horizontal}.png` + `app/{icon,apple-icon}.png` |
| Páginas legales | ✅ Comerciales | `/terminos` y `/privacidad` completas. Datos del responsable rellenos. |
| SEO | ✅ Completo | `app/sitemap.ts` (4 URLs), OG image dinámica 1200×630 (`app/opengraph-image.tsx` + `/en`), `metadataBase`, Twitter cards, canonical + hreflang en `atribuya.com`. |
| Cron diario | ✅ Configurado | `vercel.json` define 2 crons (Places + Business Profile). Vercel Hobby permite 2 diarios. |
| Cron horario | ✅ Operativo (2026-06-06) | `.github/workflows/sync-places-hourly.yml`. Secrets `APP_URL`=`https://atribuya.com` y `CRON_SECRET` configurados vía `gh secret set`. Run manual → success. |
| Brevo SMTP | ✅ Operativo (2026-06-06) | **Cuenta Brevo reutilizada** (la de Castillo Cantón / newsletter — plan Free 300/día compartido; separar si la newsletter se reactiva). Dominio `atribuya.com` autenticado en Brevo (DKIM `brevo1._domainkey`; DMARC `p=none` lo puso Brevo apuntando a su agregador; **sin SPF ni MX** — solo envío). SMTP key dedicada `atribuya-prod`. Env vars en Vercel + `.env.local`: `BREVO_SMTP_USER=936eb7001@smtp-brevo.com`, `BREVO_SMTP_PASS`, `BREVO_FROM_EMAIL=Atribuya <notificaciones@atribuya.com>`, `BREVO_REPLY_TO`/`LEAD_NOTIFY_EMAIL=a.castillo.esv@gmail.com`. Supabase Auth → Custom SMTP activado (host `smtp-relay.brevo.com:587`, mismas credenciales) + rate limit emails subido a 50/h. Verificado: envío real OK (no spam) y magic link de Auth llega desde el dominio. **Código**: reply-to global `BREVO_REPLY_TO` en `lib/email/brevo.ts`, aviso de leads best-effort (`lib/email/notify-lead.ts` → `submit-lead.ts`). |
| Google Cloud (OAuth + Places) | ⏳ Diferido | No bloquea hasta que un cliente quiera conectar GBP. |
| Dominio comercial | ✅ atribuya.com | Comprado en Hostinger. DNS A+CNAME → Vercel. HTTPS OK. |
| Stripe (billing) | ❌ No aplica todavía | Facturación manual hasta cliente #5-8. |

---

## 8. Open questions

Sin resolver hasta que el usuario las decida:

1. ~~**Nombre comercial definitivo**~~ → **Atribuya** (decidido 2026-05-24).
2. ~~**Dominio comercial propio**~~ → **atribuya.com** (comprado en Hostinger, live 2026-06-06).
3. ~~**Path prefix vs subdominio**~~ → path prefix `/o/[orgSlug]/c/...` (Fase 6).
4. **Pricing tiers**: en bruto, 397-797€/mes según fichas y comerciales. Definir tabla exacta antes del primer cierre.
5. **Setup pagado**: 1.500-2.500€ inicial. Definir qué incluye exactamente.
6. **Billing**: primeros 5-8 clientes facturación manual con Holded. Stripe a partir del cliente 6-8.
7. **Mover rutas autenticadas bajo `/o/[orgSlug]/...`**: deferred en Fase 6. Reevaluar cuando llegue al cliente #5.

### 8.1 Camino crítico al primer cliente (técnico)

En orden: ~~Brevo SMTP~~ (✅ hecho 2026-06-06) → **Google Cloud (OAuth + Places) → DPA**. Ver §7 para el detalle de cada uno. Lo demás de §8 son decisiones de negocio, no bloqueantes técnicos.

**Gotcha de plantillas de email de Supabase Auth**: las plantillas (Magic Link, Invite, Confirm signup, Recovery) NO deben usar el `{{ .ConfirmationURL }}` de fábrica — ese va por el flujo implícito y deja el token en el `#` de la home sin crear sesión. Tienen que apuntar al handler propio: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=/` (ver `app/auth/confirm/route.ts`, que hace `verifyOtp` server-side). La plantilla Magic Link branded vive versionada en `supabase/email-templates/magic-link.html`. Las invitaciones por código (`lib/invite.ts`) ya construyen ese link bien; el hueco estaba solo en el magic link de auto-login.

### 8.2 Roadmap de features pendientes (del producto base)

El lote 1 (calidad de reseñas) está hecho (Fase 14). El **lote 2** (Fase 15, 2026-06-06) portó: **ranking + insignias**, **helpdesk de soporte** (migración 016), **Excel individual por comercial** y **parte por ficha** (hoja en el export). Quedan, por portar desde el producto base single-tenant:
- **Lote 🟡** (medio): comisiones por reseña, ~~caché de rating por ficha~~ (innecesaria — el export calcula la valoración al vuelo), suite E2E Playwright.
- **Lote 🟠** (grande / toca multi-tenant): rol "director de oficina" (rediseño RLS), verificación multi-rol. ~~helpdesk~~ ✅, ~~parte semanal~~ ✅ (como parte por ficha), ~~Excel individual~~ ✅.
- **Pendiente del helpdesk**: badge de no-leídos en el sidebar (requiere llamar `support_unread_count()` en el layout) + acceso a Soporte en mobile (el footer del sidebar no existe en mobile).
- **Descartadas**: multi-marca por ficha, `monthly_goal` default 5.
- **Capturas `public/help/*.png`**: regenerar con branding Atribuya (pendiente — tarea 1.4 del plan de venta).

---

## 9. Mantenimiento de este archivo

Cada vez que termine una fase significativa:
1. Marcar fase como ✅ en la tabla de §3.
2. Si surge un workaround nuevo, documentarlo en una sección §10+ (siguiendo el patrón del CLAUDE.md original).
3. Si la BD cambia, actualizar §6.
4. Si se cierran open questions, marcarlas en §8 y mover decisiones a la sección correspondiente.
5. Commit + push.
