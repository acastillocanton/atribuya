# Handoff — Estado actual de Atribuya (junio 2026)

> Documento de retorno rápido. Para cuando no hayas tocado el proyecto en semanas y necesitas saber exactamente dónde estás y qué hacer a continuación.
>
> Actualizado: 2026-06-07

---

## 1. Qué es Atribuya (resumen en 3 líneas)

SaaS B2B multi-tenant que atribuye reseñas de Google Business Profile a comerciales individuales. La arquitectura clave: multi-tenant con `org_id` en todas las tablas + RLS + panel de super_admin para altas manuales.

**Stack**: Next.js 15.5 App Router · TypeScript strict · Supabase (Postgres + Auth + RLS) · Vercel · Google Places API + Business Profile API · Brevo SMTP.

---

## 2. Acceso rápido

| Recurso | URL / Referencia |
|---|---|
| App en producción | https://atribuya.com |
| Panel super_admin | https://atribuya.com/super |
| Login super_admin | `a.castillo.esv@gmail.com` via OTP (magic link) |
| Vercel proyecto | Dashboard → team `acastillocantons-projects` → proyecto `atribuya` |
| Supabase proyecto | `iuiveiznvwjeoyhescmx` (actúa como prod) · region Europe |
| Supabase Dashboard | https://supabase.com/dashboard/project/iuiveiznvwjeoyhescmx |
| GitHub repo | `github.com/acastillocanton/atribuya` · rama principal `main` |
| Dev local | `npm run dev` → http://localhost:3000 |

---

## 3. Estado de todas las fases

| # | Fase | Estado | Commit/Fecha |
|---|---|---|---|
| 0 | Setup inicial del repo | ✅ | `00eb9f9` · 2026-05-24 |
| 1 | Migración 011 — organizations + org_id | ✅ | `c073981` · 2026-05-24 |
| 2 | Migración 012 — RLS rewrite multi-tenant | ✅ | `8f39514` · 2026-05-24 |
| 3 | Helper `current_org_id()` + middleware | ✅ | `edb6f37` · 2026-05-24 |
| 4 | Crons multi-tenant (Places + Business Profile) | ✅ | `cf866fe` · 2026-05-24 |
| 5 | Panel `/super` (super-admin) | ✅ | `84c2e8f` · 2026-05-24 |
| 6 | Routing `/o/[orgSlug]/c/[salesSlug]/...` | ✅ (parcial) | `437189b` · 2026-05-24 |
| 7 | Branding Atribuya en toda la app | ✅ | `9acecb9` · 2026-05-24 |
| 7b | Rebrand visual — logos, favicon | ✅ | `c6b5a46` · 2026-05-24 |
| 8 | Términos legales SaaS + datos responsable | ✅ | `f9a7185` · 2026-05-24 |
| 9 | Despliegue Vercel + Supabase prod | ✅ | `285ba42` · 2026-05-24 |
| 10 | Landing comercial con lead capture | ✅ | `8139ce5` · 2026-05-24 |
| — | Mejoras landing (pricing, FAQ, i18n /en) | ✅ | commits `2c64d7b`→`9b9cf8e` |
| Extra | Datos fiscales por org en `/super` | ✅ | `c6b5a46` · 2026-05-24 |
| 11 | Cron horario operativo (secrets GitHub) | ✅ | 2026-06-06 |
| 12 | SEO — sitemap + OG image 1200×630 + Twitter cards | ✅ | `46ea02d` · 2026-06-06 |
| 13 | Dominio comercial `atribuya.com` (Hostinger) | ✅ | 2026-06-06 |
| Fix | Repo público (desbloquea deploys Vercel Hobby) | ✅ | 2026-06-06 |
| 14 | Lote 1 — calidad de reseñas (mig 015) | ✅ | 2026-06-06 |
| 15 | Lote 2 — features para vender (ranking, soporte, excel, parte por ficha) | ✅ | 2026-06-06 |
| 16 | Google Cloud — Places API (Vía A) | ✅ | `f755644` · 2026-06-07 |
| — | Google Cloud — OAuth Business Profile (Vía B) | ⏳ esperando a Google | 2026-06-07 |
| 8 | DPA finalizado + plantilla `.docx` firmable | ✅ | `6b3d598` · 2026-06-07 |

**Último trabajo (2026-06-07)**: cerrados **dos** bloqueantes del camino crítico. **(1) Google Places API (Vía A)**: proyecto Cloud `atribuya`, Places API legacy habilitada, API key restringida, facturación activa + cuota 500/día + alerta 10 €/mes; `GOOGLE_PLACES_API_KEY` en `.env.local` y Vercel; probado E2E (Telepizza Benicàssim). Es la vía pública de respaldo (top-5 reseñas recientes por ficha). **(2) DPA finalizado**: `docs/legal/dpa.md` pulido (datos del Encargado unificados, plazos rellenos, jurisdicción = Castellón) + plantilla firmable `docs/legal/dpa.docx`. Además: **OAuth Vía B** dejada configurada (consent screen Testing, OAuth client, APIs habilitadas) y **solicitud de acceso a la Reviews API v4 enviada** (caso Google `7-4031000041620`, ~7-10 días hábiles) — con recordatorio remoto programado para el 18-jun (`trig_01CBuCBCcBdJuvRfr5VeBpyi`).

**Trabajo previo (2026-06-06) — lote 2 "para vender"**: portadas 4 features del producto base, adaptadas a multi-tenant (sin rol director ni departamentos): **(2.1) ranking + insignias** (`/ranking`, `/panel/ranking`, insignias en el panel), **(2.2) helpdesk de soporte** intra-org (migración **016** aplicada; `/soporte`), **(2.3) Excel individual por comercial** (`/api/export/sales/[id]`, aislado por `org_id`), **(2.4) parte por ficha** (3ª hoja en el export de reseñas). Además: borrador de **DPA**, stub `/ajustes` eliminado, **modo demo poblado** en las páginas del comercial y **7/9 capturas de ayuda** regeneradas con branding Atribuya. 174 tests, typecheck y build OK. Antes (mismo día): Brevo SMTP de punta a punta, fix cron horario, SEO y dominio `atribuya.com`.

---

## 4. Estructura de rutas de la app

```
app/
├── page.tsx                    ← Landing pública (/ y /en)
├── en/page.tsx                 ← Versión inglés de la landing
├── login/                      ← OTP magic-link
├── o/[orgSlug]/c/[salesSlug]/  ← Redirect a Google Review (ruta pública)
│   └── [clientSlug]/           ← Versión personalizada por cliente
├── (admin)/                    ← Panel admin (requiere rol admin)
├── (sales)/                    ← Panel comercial (requiere rol sales)
├── (manager)/                  ← Panel reviews_manager
├── (profile)/                  ← Perfil de usuario
├── (legal)/                    ← /terminos y /privacidad
├── (super)/                    ← Panel super_admin (/super)
├── api/cron/                   ← Endpoints de cron (Vercel + GitHub Actions)
└── auth/                       ← Callbacks de Supabase Auth
```

Las rutas autenticadas (`/dashboard`, `/panel`, etc.) **no tienen prefijo de org** — están protegidas por RLS. Esto es deliberado (ver CLAUDE.md §5.4).

---

## 5. Base de datos

### Proyecto único: `atribuya-dev` = prod

Un solo proyecto Supabase `iuiveiznvwjeoyhescmx`. En MVP pre-cliente es suficiente. Crear `atribuya-prod` separado cuando entren 2-3 clientes con tráfico real.

### Migraciones aplicadas (001 → 016)

| Migración | Qué hace |
|---|---|
| 001–010 | Schema base del producto (single-tenant) |
| 011 | Tabla `organizations` + columna `org_id` en todas las tablas de negocio |
| 012 | 23 RLS policies — reescritura completa para multi-tenant |
| 013 | `profiles.slug` pasa a UNIQUE por (org_id, slug) — permite "juan-perez" en dos orgs |
| 014 | Tabla `leads` — captura formulario de la landing, solo visible para super_admin |
| 015 | Calidad de reseñas: `is_duplicate`, `low_rating_alerted_at`, `message_templates` + lockdown `profiles_self_update` (congela columnas sensibles, incl. `org_id`) |
| 016 | Helpdesk de soporte multi-tenant: `support_conversations`/`support_messages`/`support_read_receipts` (todas con `org_id`) + RLS intra-org + función `support_unread_count()` |

> Nota: el plan reservaba una 017 para "caché de rating por ficha", pero no fue necesaria (el parte por ficha calcula la valoración al vuelo). No existe.

### Datos en BD ahora mismo

- `organizations` — 2 seed ficticias: Acme Promotora (active), Beta Apartamentos (trial)
- `locations` — 4 seed, 2 por org, `oauth_status='disconnected'`
- `profiles` — 5 users sintéticos (`test+*@atribuya.test`)
- `super_admins` — 1 fila: `a.castillo.esv@gmail.com` (id `b2eab873-…`)
- `leads` — vacía (lo que llegue de la landing irá aquí)
- `clients`, `share_links`, `reviews`, `audit_log` — vacías

### Comandos Supabase CLI

```bash
supabase migration list --linked       # estado local vs remote
supabase db push --linked --dry-run    # preview antes de aplicar
supabase db push --linked              # aplica migraciones pendientes
```

---

## 6. Variables de entorno necesarias

Todas están en Vercel (producción). Para desarrollo local, copiar en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=                          # distinto en local y prod
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_PLACES_API_KEY=                # ✅ configurada (Vía A) — en .env.local y Vercel
GOOGLE_CLIENT_ID=                     # ✅ configurada (Vía B) — empieza por 443155173600-…
GOOGLE_CLIENT_SECRET=                 # ✅ configurada (Vía B) — empieza por GOCSPX-
GOOGLE_OAUTH_REDIRECT_URI=            # local: localhost; Vercel: https://www.atribuya.com/api/google/oauth/callback (subir tras aprobación Google)
# Brevo SMTP — ✅ configurado (host/port hardcodeados en lib/email/brevo.ts)
BREVO_SMTP_USER=936eb7001@smtp-brevo.com
BREVO_SMTP_PASS=                      # SMTP key (secreto)
BREVO_FROM_EMAIL=Atribuya <notificaciones@atribuya.com>
BREVO_REPLY_TO=a.castillo.esv@gmail.com
LEAD_NOTIFY_EMAIL=a.castillo.esv@gmail.com
```

---

## 7. Lo que falta (pendiente prioritario)

### 7.1 Cron horario via GitHub Actions ✅ RESUELTO (2026-06-06)

El cron de Vercel solo permite 2 diarios (plan Hobby). El cron horario de Places vive en `.github/workflows/sync-places-hourly.yml`. Fallaba cada hora (emails de "All jobs have failed") porque los secrets nunca se habían configurado y el endpoint devolvía 401. Ya están puestos:
- `APP_URL` = `https://atribuya.com`
- `CRON_SECRET` = (el valor de `.env.local`, también añadido a Vercel env vars)

Verificado con un run manual (`workflow_dispatch`) → success. Si vuelve a fallar: revisar que `CRON_SECRET` coincide entre GitHub Actions y Vercel env vars.

### 7.2 Brevo SMTP — ✅ OPERATIVO (2026-06-06)

Activa el email transaccional (alertas ≤2★, notificación de reseña, aviso de leads) **y** el email de Supabase Auth (magic links / invitaciones). Antes, sin Brevo, Supabase usaba su email gratuito (~4/h), insuficiente.

**Cómo quedó montado:**
- **Cuenta**: se reutilizó la cuenta Brevo existente de Castillo Cantón (la de la newsletter, que estaba sin uso). Plan Free 300 emails/día — ⚠️ compartido si se reactiva la newsletter; entonces tocaría separar cuenta o subir de plan.
- **Dominio**: `atribuya.com` autenticado en Brevo (Domains). DKIM `brevo1._domainkey` ✅. DMARC `p=none` (lo añadió Brevo apuntando a su agregador `rua@dmarc.brevo.com`; los informes se ven en el panel de Brevo). **Sin SPF ni MX** — es solo envío; la entrega se valida por DKIM. Remitente `notificaciones@atribuya.com` (no es buzón real → reply-to a Gmail).
- **SMTP key**: dedicada, nombre `atribuya-prod` (separada de la de la newsletter para poder revocarla aparte). Login `936eb7001@smtp-brevo.com`.
- **Env vars** (Vercel Production + `.env.local`): `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`, `BREVO_FROM_EMAIL=Atribuya <notificaciones@atribuya.com>`, `BREVO_REPLY_TO=a.castillo.esv@gmail.com`, `LEAD_NOTIFY_EMAIL=a.castillo.esv@gmail.com`.
- **Supabase Auth**: Authentication → Emails → Custom SMTP activado (host `smtp-relay.brevo.com`, port `587`, mismas credenciales, sender `notificaciones@atribuya.com` / `Atribuya`). Rate limit de emails subido a **50/h** (Authentication → Rate Limits).
- **Verificado**: email transaccional de prueba llegó a bandeja de entrada (no spam); magic link de Auth llega desde `notificaciones@atribuya.com`.

**Gotcha resuelto — plantillas de Auth**: las plantillas de Supabase NO pueden usar el `{{ .ConfirmationURL }}` de fábrica (flujo implícito → deja el token en el `#` de la home sin loguear). Deben apuntar a `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=/` (handler `app/auth/confirm/route.ts`). La plantilla **Magic Link** ya está branded y aplicada; copia versionada en `supabase/email-templates/magic-link.html`. **Pendiente**: replicar el mismo patrón/diseño a las plantillas **Invite user** (`type=invite`), **Confirm signup** (`type=signup`) y **Reset password** (`type=recovery`).

**Código** (commit del 2026-06-06): reply-to global vía `BREVO_REPLY_TO` en `lib/email/brevo.ts`; aviso de leads best-effort `lib/email/notify-lead.ts` → `submit-lead.ts`; refs `atribuya.es`→`.com` limpiadas.

### 7.3 Google Cloud — Vía A ✅ / Vía B ⏳ (2026-06-07)

Dos integraciones de Google, ambas en el proyecto Cloud `atribuya`:

- **Vía A — Places API (legacy) ✅ OPERATIVA**. Lee datos **públicos** (no requiere ser admin de la ficha), pero solo las **5 reseñas más recientes** por ficha. Habilitada la "Places API" **legacy** (NO la "New" — necesitamos `reviews_sort=newest`). API key `atribuya-places` restringida a Places API. Facturación activa y vinculada (obligatoria en Maps Platform aunque el uso entre en tramo gratis). Redes de seguridad: **cuota 500 req/día** + **alerta de presupuesto 10 €/mes**. `GOOGLE_PLACES_API_KEY` en `.env.local` y Vercel. Probado E2E con `scripts/find-place.mjs` / `scripts/test-places-key.mjs`.
- **Vía B — OAuth Business Profile ⏳ ESPERANDO A GOOGLE**. Trae **todas** las reseñas, pero exige que el cliente sea admin de su ficha y conecte su cuenta (OAuth). Ya configurado: consent screen modo **Testing** (External, test user `a.castillo.esv@gmail.com`), scope `business.manage`, OAuth client "Web application" (redirect `https://www.atribuya.com/api/google/oauth/callback` + apex + localhost), APIs **Account Management** + **Business Information** habilitadas. **Falta solo la aprobación de Google**: se envió la solicitud de acceso a las Business Profile APIs (desbloquea la Reviews API v4) el 2026-06-07 → caso de soporte **`7-4031000041620`**, revisión 7-10 días hábiles. Hasta que aprueben, la v4 da `PERMISSION_DENIED` y cubre el hueco la Vía A. **Tras aprobación**: subir `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` (con la de www) a Vercel + redeploy + probar OAuth. Hay un **recordatorio remoto programado** para el 18-jun: `trig_01CBuCBCcBdJuvRfr5VeBpyi`.

### 7.4 Dominio comercial ✅ RESUELTO (2026-06-06)

`atribuya.com` comprado en Hostinger y live. DNS: A `@`→`76.76.21.21`, CNAME `www`→`cname.vercel-dns.com`. Configurado en Vercel, Supabase Auth Site URL y `NEXT_PUBLIC_APP_URL` ya apuntan ahí. `atribuya.vercel.app` sigue activo como secundario.

**Nota infra**: el repo se hizo **público** porque Vercel Hobby bloquea los deploys de repos privados ("commit author does not have contributing access"). No hay secretos en el código — todos en env vars de Vercel. Hay un Deploy Hook en Vercel (Settings→Git) como vía de disparo manual alternativa: `curl -X POST <hook-url>`.

### 7.5 Alta del primer cliente

Alta manual desde `/super`:
1. Login en https://atribuya.com/super con `a.castillo.esv@gmail.com`
2. "Nueva organización" → rellenar nombre, slug, datos fiscales
3. "Invitar admin" → email del admin de la org
4. El admin recibe magic link, entra, conecta su GBP

### 7.6 DPA (Data Processing Agreement) — ✅ FINALIZADO (2026-06-07)

Los `/terminos` y `/privacidad` están completos. El DPA (Acuerdo de Encargado del Tratamiento, art. 28 RGPD) está **finalizado** en **`docs/legal/dpa.md`** — 15 cláusulas + 3 anexos, modelo Responsable (cliente) / Encargado (Castillo Cantón), subencargados reales (Supabase Fráncfort, Vercel, Brevo, Google + nota de GitHub como no-subencargado). Datos del Encargado unificados con los otros docs legales (dirección completa + `alejandro@castillocanton.com`); plazos rellenos (oposición subencargados 30 d, devolución/supresión 60 d, auditoría 30 d); jurisdicción = tribunales de Castellón. Solo quedan los corchetes del **lado Cliente** para rellenar al firmar. Plantilla firmable en **`docs/legal/dpa.docx`** (Word editable, branding Atribuya). **Sin página pública `/dpa`** (anexo contractual privado, decisión del usuario). No lleva aviso de revisión legal (criterio del titular) — un repaso por un asesor de protección de datos antes del primer uso sería recomendable pero queda a su criterio.

### 7.7 Camino crítico al primer cliente

En orden: ~~Brevo (§7.2)~~ ✅ → ~~Google Places Vía A (§7.3)~~ ✅ → ~~DPA (§7.6)~~ ✅ → **solo queda Google OAuth Vía B (§7.3)**, esperando aprobación de Google (caso `7-4031000041620`, ~18-jun). Lo demás (pricing, setup, billing) son decisiones de negocio (§8), no técnicas. **El camino crítico está técnicamente cerrado salvo la aprobación de Google, que no depende de nosotros.**

### 7.8 Mejoras de producto pendientes (lotes del producto base)

El producto base single-tenant tiene features que aún no se han portado a Atribuya. Los **lotes 1 y 2 ya están hechos**. Quedan:

- **Lote 🟡** (medio, alto valor): comisiones por reseña, ~~caché de rating por ficha~~ (descartada, innecesaria), suite E2E Playwright.
- **Lote 🟠** (grande / toca multi-tenant): rol "director de oficina" (conflicto con el modelo de roles — requiere rediseño RLS), verificación de reseñas abierta a todos los roles. ~~helpdesk~~ ✅ (lote 2), ~~parte semanal~~ ✅ (como "parte por ficha"), ~~Excel individual~~ ✅ (lote 2).
- **Pendiente menor del helpdesk**: badge de no-leídos en el sidebar (llamar `support_unread_count()` desde el layout) y acceso a Soporte en mobile (el footer del sidebar no existe en mobile).
- **Descartadas**: multi-marca por ficha (específica del cliente original; el SaaS define marca por org), `monthly_goal` default 5.

### 7.9 Capturas del Centro de Ayuda — ✅ 7/9 hechas (2026-06-06)

`public/help/*.png`: **7 de 9 regeneradas** con branding Atribuya capturando el **modo demo** con Playwright (`scripts/capture-help.py`). Para ello se poblaron con datos de ejemplo las páginas del comercial en modo demo (`/clientes`, `/clientes/[slug]`, `/panel/enlace`, `/panel/resenas`, `/perfil`) — esto **también mejora las demos comerciales**. Pendientes **01** (email del magic link) y **06** (diagrama de flujo): no son pantallas de la app, requieren hacerse a mano/diseño. Ver `public/help/README.md`.

---

## 8. Decisiones pendientes (open questions)

| Pregunta | Notas |
|---|---|
| ~~Dominio comercial~~ | ✅ `atribuya.com` (Hostinger, live 2026-06-06) |
| Pricing exacto | En bruto 397-797€/mes según fichas y comerciales. Definir tabla antes del primer cierre |
| Setup pagado | 1.500-2.500€ inicial. Definir qué incluye |
| Billing | Manual con Holded hasta cliente 6-8, luego Stripe |
| Rutas autenticadas con prefijo `/o/[orgSlug]/...` | Deferred. Reevaluar en cliente #5 |

---

## 9. Landing comercial — estado actual

La landing (`app/page.tsx`) está en producción con:
- Hero con estadísticas sociales
- Secciones: sectores target, problema, 3 pasos, caso anonimizado (promotora en Costa de Castellón)
- Pricing + banda "Founding Customer"
- FAQ con accordion nativo (`<details name>`)
- Formulario de lead (Zod + honeypot anti-spam)
- Versión en inglés en `/en`
- SEO: `robots.ts`, `sitemap.xml`, JSON-LD `FAQPage`
- Tipografía: Fraunces (headings) + Geist (body)

Los leads se guardan en tabla `leads` (BD). El email de notificación al super_admin **ya está implementado** (`lib/email/notify-lead.ts`, invocado best-effort desde `app/actions/submit-lead.ts`): se envía a `LEAD_NOTIFY_EMAIL` cuando Brevo está configurado, y degrada con gracia si no (el lead se guarda igual).

---

## 10. Comandos de arranque rápido

```bash
# Arrancar dev
npm run dev

# Antes de cerrar cualquier tarea
npm run typecheck    # obligatorio
npm test             # si tocaste matcher, RLS o multi-tenancy

# Ver estado de la BD
supabase migration list --linked

# SQL ad-hoc sin Docker
curl -X POST https://api.supabase.com/v1/projects/iuiveiznvwjeoyhescmx/database/query \
  -H "Authorization: Bearer <PAT>" \
  -H "Content-Type: application/json" \
  -d '{"query":"select count(*) from leads"}'
```

---

## 11. Archivos clave a conocer

| Archivo | Para qué |
|---|---|
| [CLAUDE.md](../../CLAUDE.md) | Fuente de verdad del proyecto para Claude Code |
| [spec.md](../../spec.md) | Fuente de verdad del producto |
| [lib/supabase/org.ts](../../lib/supabase/org.ts) | `getCurrentOrgContext` / `requireOrgContext` — siempre usar esto en server actions |
| [middleware.ts](../../middleware.ts) | Guards de rol, redirecciones, bots en rutas públicas |
| [app/(super)/super/actions.ts](../../app/(super)/super/actions.ts) | Todas las server actions de super_admin |
| [lib/cron/process-reviews.ts](../../lib/cron/process-reviews.ts) | Motor de atribución de reseñas |
| [lib/landing.ts](../../lib/landing.ts) | Lógica de `recordOpenAndRedirect` para la landing pública |
| [app/actions/submit-lead.ts](../../app/actions/submit-lead.ts) | Server action del formulario de la landing |
| [lib/leaderboard.ts](../../lib/leaderboard.ts) | Ranking org-scoped (lote 2); `getLeaderboard({ orgId, ... })` |
| [app/(profile)/soporte/](../../app/(profile)/soporte/) | Helpdesk de soporte (lote 2) — pages + `actions.ts` |
| [app/api/export/sales/[id]/route.ts](../../app/api/export/sales/%5Bid%5D/route.ts) | Excel individual por comercial (lote 2), aislado por `org_id` |
| [app/api/export/reviews/route.ts](../../app/api/export/reviews/route.ts) | Export de reseñas — 3 hojas (Reseñas, Resumen, Parte por ficha) |
| [docs/legal/dpa.md](../legal/dpa.md) | DPA finalizado (art. 28 RGPD) — corchetes del lado Cliente para rellenar al firmar |
| [docs/legal/dpa.docx](../legal/dpa.docx) | Plantilla DPA firmable en Word (branding Atribuya) — la que se envía a cada cliente |
| [scripts/find-place.mjs](../../scripts/find-place.mjs) | Probar la Places API (Vía A): busca un negocio y lista sus reseñas recientes |
| [scripts/capture-help.py](../../scripts/capture-help.py) | Captura las pantallas de ayuda desde el modo demo (Playwright) |
| [supabase/migrations/](../../supabase/migrations/) | Migraciones 001-016 en orden |
| [docs/tests-multitenancy.md](../tests-multitenancy.md) | 15 tests de aislamiento cross-org — referencia para validar RLS |
