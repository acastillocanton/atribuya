# Handoff — Estado actual de Atribuya (junio 2026)

> Documento de retorno rápido. Para cuando no hayas tocado el proyecto en semanas y necesitas saber exactamente dónde estás y qué hacer a continuación.
>
> Actualizado: 2026-06-06

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

**Último trabajo (2026-06-06)**: Brevo SMTP operativo de punta a punta (cuenta reutilizada de Castillo Cantón, dominio `atribuya.com` autenticado, env vars en Vercel, Custom SMTP en Supabase Auth, rate limit 50/h) + aviso de leads + plantilla de magic link branded y arreglo del flujo de login (`/auth/confirm`). Antes: fix del cron horario, auditoría SEO, y migración al dominio `atribuya.com`.

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

### Migraciones aplicadas (001 → 015)

| Migración | Qué hace |
|---|---|
| 001–010 | Schema base del producto (single-tenant) |
| 011 | Tabla `organizations` + columna `org_id` en todas las tablas de negocio |
| 012 | 23 RLS policies — reescritura completa para multi-tenant |
| 013 | `profiles.slug` pasa a UNIQUE por (org_id, slug) — permite "juan-perez" en dos orgs |
| 014 | Tabla `leads` — captura formulario de la landing, solo visible para super_admin |
| 015 | Calidad de reseñas: `is_duplicate`, `low_rating_alerted_at`, `message_templates` + lockdown `profiles_self_update` (congela columnas sensibles, incl. `org_id`) |

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
GOOGLE_CLIENT_ID=                     # diferido — no bloquea MVP
GOOGLE_CLIENT_SECRET=                 # diferido
GOOGLE_OAUTH_REDIRECT_URI=            # diferido
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

### 7.3 Google Cloud — bloqueante para el primer cliente real

Cada org cliente necesita conectar su GBP con OAuth propio. Hasta que no entre un cliente, esto no bloquea. Cuando llegue:
1. Crear proyecto en Google Cloud Console
2. Activar Places API (New) + Business Profile API
3. Configurar OAuth consent screen (modo Testing para los primeros 100 test users)
4. Añadir credenciales a Vercel env vars

### 7.4 Dominio comercial ✅ RESUELTO (2026-06-06)

`atribuya.com` comprado en Hostinger y live. DNS: A `@`→`76.76.21.21`, CNAME `www`→`cname.vercel-dns.com`. Configurado en Vercel, Supabase Auth Site URL y `NEXT_PUBLIC_APP_URL` ya apuntan ahí. `atribuya.vercel.app` sigue activo como secundario.

**Nota infra**: el repo se hizo **público** porque Vercel Hobby bloquea los deploys de repos privados ("commit author does not have contributing access"). No hay secretos en el código — todos en env vars de Vercel. Hay un Deploy Hook en Vercel (Settings→Git) como vía de disparo manual alternativa: `curl -X POST <hook-url>`.

### 7.5 Alta del primer cliente

Alta manual desde `/super`:
1. Login en https://atribuya.com/super con `a.castillo.esv@gmail.com`
2. "Nueva organización" → rellenar nombre, slug, datos fiscales
3. "Invitar admin" → email del admin de la org
4. El admin recibe magic link, entra, conecta su GBP

### 7.6 DPA (Data Processing Agreement)

Los `/terminos` y `/privacidad` están completos. Falta el DPA bilateral para firmar con cada cliente. Necesario antes de firmar el primer contrato.

### 7.7 Camino crítico al primer cliente

En orden: ~~Brevo (§7.2)~~ ✅ → **Google Cloud (§7.3) → DPA (§7.6)**. Lo demás (pricing, setup, billing) son decisiones de negocio (§8), no técnicas.

### 7.8 Mejoras de producto pendientes (lotes del producto base)

El producto base single-tenant tiene features que aún no se han portado a Atribuya. El **lote 1 ya está hecho** (§9). Quedan:

- **Lote 🟡** (medio, alto valor): comisiones por reseña, caché de rating de Google por ficha, suite E2E Playwright.
- **Lote 🟠** (grande / migración nueva / toca multi-tenant): helpdesk de soporte (3 tablas), rol "director de oficina" (conflicto con el modelo de roles — requiere rediseño RLS), parte semanal Excel (departamentos a repensar), verificación de reseñas abierta a todos los roles, Excel individual por comercial.
- **Descartadas**: multi-marca por ficha (específica del cliente original; el SaaS define marca por org), `monthly_goal` default 5.

### 7.9 Capturas del Centro de Ayuda

`public/help/*.png` (01-09) son de una versión anterior de la UI con branding antiguo. Regenerar desde `atribuya.com` con el branding Atribuya cuando entre la primera org. Ver `public/help/README.md`.

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
| [supabase/migrations/](../../supabase/migrations/) | Migraciones 001-015 en orden |
| [docs/tests-multitenancy.md](../tests-multitenancy.md) | 15 tests de aislamiento cross-org — referencia para validar RLS |
