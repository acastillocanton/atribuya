# Handoff — Estado actual de Atribuya (junio 2026)

> Documento de retorno rápido. Para cuando no hayas tocado el proyecto en semanas y necesitas saber exactamente dónde estás y qué hacer a continuación.
>
> Actualizado: 2026-06-09

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
| — | Google Cloud — OAuth Business Profile (Vía B) | ⏳ re-solicitud enviada 2026-06-24 (corregida → `castillocanton.com`), esperando aprobación (ver §7.3) | 2026-06-07 |
| 8 | DPA finalizado + plantilla `.docx` firmable | ✅ | `6b3d598` · 2026-06-07 |
| — | Reescritura de copy de la landing (tono beneficio-first) | ✅ | 2026-06-07 |
| — | Asistente de alta de ficha (búsqueda Google, Vía A) + fix OAuth en blanco + reorden sidebar admin (→ §16) | ✅ | `1be88e2`→`8487971` · 2026-06-09 |

**Último trabajo (2026-06-07)**: cerrados **dos** bloqueantes del camino crítico. **(1) Google Places API (Vía A)**: proyecto Cloud `atribuya`, Places API legacy habilitada, API key restringida, facturación activa + cuota 500/día + alerta 10 €/mes; `GOOGLE_PLACES_API_KEY` en `.env.local` y Vercel; probado E2E (Telepizza Benicàssim). Es la vía pública de respaldo (top-5 reseñas recientes por ficha). **(2) DPA finalizado**: `docs/legal/dpa.md` pulido (datos del Encargado unificados, plazos rellenos, jurisdicción = Castellón) + plantilla firmable `docs/legal/dpa.docx`. Además: **OAuth Vía B** dejada configurada (consent screen Testing, OAuth client, APIs habilitadas) y **solicitud de acceso a la Reviews API v4 enviada** (caso Google `7-4031000041620`, ~7-10 días hábiles) — con recordatorio remoto programado para el 18-jun (`trig_01CBuCBCcBdJuvRfr5VeBpyi`).

**Trabajo previo (2026-06-06) — lote 2 "para vender"**: portadas 4 features del producto base, adaptadas a multi-tenant (sin rol director ni departamentos): **(2.1) ranking + insignias** (`/ranking`, `/panel/ranking`, insignias en el panel), **(2.2) helpdesk de soporte** intra-org (migración **016** aplicada; `/soporte`), **(2.3) Excel individual por comercial** (`/api/export/sales/[id]`, aislado por `org_id`), **(2.4) parte por ficha** (3ª hoja en el export de reseñas). Además: borrador de **DPA**, stub `/ajustes` eliminado, **modo demo poblado** en las páginas del comercial y **7/9 capturas de ayuda** regeneradas con branding Atribuya. 174 tests, typecheck y build OK. Antes (mismo día): Brevo SMTP de punta a punta, fix cron horario, SEO y dominio `atribuya.com`.

---

## 4. Estructura de rutas de la app

```
app/
├── page.tsx                    ← Landing pública (/ y /en)
├── en/page.tsx                 ← Versión inglés de la landing
├── en/(legal)/                 ← /en/terms y /en/privacy (legales en inglés, layout propio)
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

### Migraciones aplicadas (001 → 017)

| Migración | Qué hace |
|---|---|
| 001–010 | Schema base del producto (single-tenant) |
| 011 | Tabla `organizations` + columna `org_id` en todas las tablas de negocio |
| 012 | 23 RLS policies — reescritura completa para multi-tenant |
| 013 | `profiles.slug` pasa a UNIQUE por (org_id, slug) — permite "juan-perez" en dos orgs |
| 014 | Tabla `leads` — captura formulario de la landing, solo visible para super_admin |
| 015 | Calidad de reseñas: `is_duplicate`, `low_rating_alerted_at`, `message_templates` + lockdown `profiles_self_update` (congela columnas sensibles, incl. `org_id`) |
| 016 | Helpdesk de soporte multi-tenant: `support_conversations`/`support_messages`/`support_read_receipts` (todas con `org_id`) + RLS intra-org + función `support_unread_count()` |
| 017 | `leads.phone text` (nullable) — teléfono del formulario de la landing. Obligatorio a nivel app (HTML + Zod), nullable en BD para no romper leads históricos. Aplicada 2026-06-07 |

> Nota: el número 017 que el plan original reservaba para "caché de rating por ficha" nunca se creó (innecesaria; el parte por ficha calcula la valoración al vuelo). El 017 actual es `leads.phone`.

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
GOOGLE_OAUTH_REDIRECT_URI=            # local: localhost; Vercel: https://atribuya.com/api/google/oauth/callback (SIN www — desde 2026-06-07 el host canónico es el apex y www hace 308 → apex; OAuth no sigue redirecciones. Apex ya autorizado en el cliente. Subir tras aprobación Google)
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
- **Dominio**: `atribuya.com` autenticado en Brevo (Domains). DKIM `brevo1._domainkey` ✅. DMARC `p=none` (lo añadió Brevo apuntando a su agregador `rua@dmarc.brevo.com`; los informes se ven en el panel de Brevo). La entrega de Brevo se valida por DKIM. **SPF añadido el 2026-06-21** (`v=spf1 include:spf.brevo.com include:spf.improvmx.com ~all`, TXT `@` único con ambos includes — cubre envíos de Brevo + reenvío de ImprovMX) y MX → ImprovMX (catch-all de `alejandro@atribuya.com`). Remitente `notificaciones@atribuya.com` (no es buzón real → reply-to a Gmail).
- **SMTP key**: dedicada, nombre `atribuya-prod` (separada de la de la newsletter para poder revocarla aparte). Login `936eb7001@smtp-brevo.com`.
- **Env vars** (Vercel Production + `.env.local`): `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`, `BREVO_FROM_EMAIL=Atribuya <notificaciones@atribuya.com>`, `BREVO_REPLY_TO=a.castillo.esv@gmail.com`, `LEAD_NOTIFY_EMAIL=a.castillo.esv@gmail.com`.
- **Supabase Auth**: Authentication → Emails → Custom SMTP activado (host `smtp-relay.brevo.com`, port `587`, mismas credenciales, sender `notificaciones@atribuya.com` / `Atribuya`). Rate limit de emails subido a **50/h** (Authentication → Rate Limits).
- **Verificado**: email transaccional de prueba llegó a bandeja de entrada (no spam); magic link de Auth llega desde `notificaciones@atribuya.com`.

**Gotcha resuelto — plantillas de Auth**: las plantillas de Supabase NO pueden usar el `{{ .ConfirmationURL }}` de fábrica (flujo implícito → deja el token en el `#` de la home sin loguear). Deben apuntar a `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=/` (handler `app/auth/confirm/route.ts`). La plantilla **Magic Link** ya está branded y aplicada; copia versionada en `supabase/email-templates/magic-link.html`. **Pendiente**: replicar el mismo patrón/diseño a las plantillas **Invite user** (`type=invite`), **Confirm signup** (`type=signup`) y **Reset password** (`type=recovery`).

**Código** (commit del 2026-06-06): reply-to global vía `BREVO_REPLY_TO` en `lib/email/brevo.ts`; aviso de leads best-effort `lib/email/notify-lead.ts` → `submit-lead.ts`; refs `atribuya.es`→`.com` limpiadas.

### 7.3 Google Cloud — Vía A ✅ / Vía B ⏳ (2026-06-07)

Dos integraciones de Google, ambas en el proyecto Cloud `atribuya`:

- **Vía A — Places API (legacy) ✅ OPERATIVA**. Lee datos **públicos** (no requiere ser admin de la ficha), pero solo las **5 reseñas más recientes** por ficha. Habilitada la "Places API" **legacy** (NO la "New" — necesitamos `reviews_sort=newest`). API key `atribuya-places` restringida a Places API. Facturación activa y vinculada (obligatoria en Maps Platform aunque el uso entre en tramo gratis). Redes de seguridad: **cuota 500 req/día** + **alerta de presupuesto 10 €/mes**. `GOOGLE_PLACES_API_KEY` en `.env.local` y Vercel. Probado E2E con `scripts/find-place.mjs` / `scripts/test-places-key.mjs`.
- **Vía B — OAuth Business Profile ❌ RECHAZADA (2026-06-24) — corrección en curso**. Trae **todas** las reseñas, pero exige que el cliente sea admin de su ficha y conecte su cuenta (OAuth). Ya configurado: consent screen modo **Testing** (External, test user `a.castillo.esv@gmail.com`), scope `business.manage`, OAuth client "Web application" (redirect `https://www.atribuya.com/api/google/oauth/callback` + apex + localhost), APIs **Account Management** + **Business Information** habilitadas. **Tras aprobación**: subir `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` a Vercel + redeploy + probar OAuth. ⚠️ **Usar el `REDIRECT_URI` SIN www** (`https://atribuya.com/api/google/oauth/callback`): desde 2026-06-07 se invirtió el dominio canónico a apex (`www` hace 308 → `atribuya.com`), y los callbacks OAuth no siguen redirecciones. El apex ya estaba autorizado en el cliente OAuth.

  > **Actualización (2026-06-10) — re-solicitud en curso.** La solicitud del 7-jun (caso `7-4031000041620`) no generó email de confirmación y la cuota sigue a 0 ("Requests per minute" de Business Information API, que es el indicador de aprobación: 0 = pendiente/denegado, ~300 = aprobado). Revisando los **prerequisitos oficiales** ([prereqs](https://developers.google.com/my-business/content/prereqs)) se vio que probablemente incumplía varios: el email del formulario debe ser **propietario/administrador de un Perfil de Empresa verificado y activo +60 días** con web, conviene que sea **del dominio de la app** y hace falta **cuenta de organización** en Business Profile. Plan nuevo: (1) buzón `*@atribuya.com` vía ImprovMX; (2) cuenta de Google con `alejandro@atribuya.com`; (3) añadirla como admin de un perfil GBP verificado +60 días con web; (4) cuenta de organización en Business Profile ([instrucciones](https://support.google.com/business/answer/7663063)); (5) añadirla al IAM del proyecto Cloud `atribuya` (Propietario o Editor); (6) reenviar el formulario (`support.google.com/business/contact/api_default`).
  >
  > **Actualización (2026-06-11) — re-solicitud ENVIADA.** Plan completado: (1) buzón ImprovMX ✅; (2) cuenta `alejandro@atribuya.com` ✅; (3) añadida al GBP de **Castillo Cantón** ✅; (4)-(5) cuenta de organización + IAM ✅; (6) formulario reenviado el 2026-06-11 con nº de proyecto `443155173600`, web `https://atribuya.com`. **SPF resuelto el 2026-06-21**: TXT en Hostinger (`v=spf1 include:spf.brevo.com include:spf.improvmx.com ~all`).
  >
  > **Actualización (2026-06-24) — RECHAZADA.** Google respondió: *"No approved project. The listing ID is associated with a different website."* **Causa raíz**: el consent screen del proyecto Cloud `atribuya` tenía homepage/privacidad/términos **vacíos** y el único dominio autorizado era `atribuya.com`, que no coincide con la web de la ficha GBP de Castillo Cantón (`castillocanton.com`). **Plan de corrección** (pasos acordados, en pausa al retomar):
  >
  > **Paso 1A** ✅ HECHO (2026-06-24): consent screen del proyecto `atribuya` (Información de la marca) alineado con `castillocanton.com` y guardado:
  > - Página principal: `https://castillocanton.com`
  > - Política de privacidad: `https://castillocanton.com/politica-de-privacidad/`
  > - Condiciones del servicio: `https://castillocanton.com/terminos-de-servicio/`
  > - Dominio autorizado: añadido `castillocanton.com` (junto al `atribuya.com` existente)
  >
  > **Paso 1B** ✅ HECHO (2026-06-24): página de términos creada en `https://castillocanton.com/terminos-de-servicio/` (live, verificada). Cubre titularidad de Castillo Cantón, propósito, reglas de uso, propiedad intelectual, herramientas, responsabilidad, protección de datos (remite a privacidad/cookies) y jurisdicción española. ⚠️ **Nota**: la página NO menciona Atribuya ni el uso de datos OAuth/GBP, y la privacidad solo cubre el formulario de contacto (Web3Forms). Irrelevante para el rechazo actual (que es de mismatch de dominio), pero **riesgo menor de cara a una futura verificación de scopes sensibles** (`business.manage` es sensible): si Google lo exige, añadir a la privacidad de `castillocanton.com` una cláusula sobre el tratamiento de datos de Google Business Profile vía Atribuya.
  >
  > **Paso 2** ✅ HECHO (2026-06-24): formulario GBP API reenviado desde `alejandro@atribuya.com` vía `support.google.com/business/contact/api_default` → opción **"Solicitud de acceso básico a las APIs"**. Campos: nº de proyecto `443155173600`, sitio web `https://castillocanton.com`, motivo = lectura de reseñas con OAuth por cliente (scope `business.manage`, solo lectura, producto Atribuya de Castillo Cantón). Esta vez todo alineado con `castillocanton.com` (la web de la ficha GBP que gestiona la cuenta), que era la causa del rechazo anterior.
  >
  > **⚠️ Pendiente de vigilar (2026-06-24)**: (1) **aprobación de Google** — indicador fiable: cuota "Requests per minute" de Business Information API (`0` = pendiente/denegado, `~300` = aprobado); revisar en ~7-10 días. (2) **Banner "Verificación requerida para `alejandro@atribuya.com`"** visto en el formulario: se refiere a la verificación del Perfil de Empresa de Google, no al formulario. Google exige en sus prerequisitos un GBP **verificado y activo**; si la ficha de Castillo Cantón gestionada por esta cuenta no está verificada, completar la verificación, porque sería otro posible motivo de rechazo.
  >
  > **Tras aprobación**: subir `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` a Vercel + redeploy + probar OAuth. ⚠️ `REDIRECT_URI` SIN www (`https://atribuya.com/api/google/oauth/callback`).

  > **Actualización (2026-06-30) — 2º RECHAZO + 3ª solicitud enviada.** Google respondió: *"your account did not pass our internal quality checks."* Análisis: el buzón `alejandro@atribuya.com` era un reenviador ImprovMX (no un buzón real), lo que resta credibilidad a la cuenta. Además era la primera vez que se usaba esa cuenta para el formulario. **Correcciones aplicadas**: (1) `alejandro@atribuya.com` convertido a buzón real en Hostinger (ya no es ImprovMX). (2) Añadido `alejandro@atribuya.com` como Propietario en el IAM del proyecto Cloud `443155173600`. (3) Formulario reenviado el 2026-06-30 desde `alejandro@atribuya.com` con nº de proyecto `443155173600`, web `https://atribuya.com`, descripción en español del caso de uso (atribución de reseñas GBP a comerciales, OAuth read-only, scope `business.manage`, desarrollador Castillo Cantón). **Esperando aprobación** (~7-10 días; indicador = cuota Business Information API).

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

**Actualización (2026-07-01)**: las páginas legales públicas ahora son **bilingües**. Se crearon `/en/terms` y `/en/privacy` (`app/en/(legal)/`, layout propio en inglés que vuelve a `/en`), traducción fiel de las ES. `Footer`/`LeadForm`/`CookieBanner` enlazan a las rutas EN cuando `locale="en"`; el layout legal ES añade un enlace "English". Ambas van al `sitemap.ts` con `index:true`. Además, el **email de contacto de `/terminos` y `/privacidad` pasó de `alejandro@castillocanton.com` a `alejandro@atribuya.com`** (coherencia de marca: web `atribuya.com` con email `@atribuya.com`). ⚠️ **Inconsistencia pendiente**: el DPA (`dpa.md`/`dpa.docx`) sigue usando `alejandro@castillocanton.com` en los datos del Encargado — si se quiere unificar, actualizar ambos ficheros. Se dejó así a propósito de momento (el DPA es documento contractual firmado por Castillo Cantón como entidad).

Los `/terminos` y `/privacidad` están completos. El DPA (Acuerdo de Encargado del Tratamiento, art. 28 RGPD) está **finalizado** en **`docs/legal/dpa.md`** — 15 cláusulas + 3 anexos, modelo Responsable (cliente) / Encargado (Castillo Cantón), subencargados reales (Supabase Fráncfort, Vercel, Brevo, Google + nota de GitHub como no-subencargado). Datos del Encargado unificados con los otros docs legales (dirección completa + `alejandro@castillocanton.com`); plazos rellenos (oposición subencargados 30 d, devolución/supresión 60 d, auditoría 30 d); jurisdicción = tribunales de Castellón. Solo quedan los corchetes del **lado Cliente** para rellenar al firmar. Plantilla firmable en **`docs/legal/dpa.docx`** (Word editable, branding Atribuya). **Sin página pública `/dpa`** (anexo contractual privado, decisión del usuario). No lleva aviso de revisión legal (criterio del titular) — un repaso por un asesor de protección de datos antes del primer uso sería recomendable pero queda a su criterio.

### 7.7 Camino crítico al primer cliente

En orden: ~~Brevo (§7.2)~~ ✅ → ~~Google Places Vía A (§7.3)~~ ✅ → ~~DPA (§7.6)~~ ✅ → **solo queda Google OAuth Vía B (§7.3)**, rechazada el 2026-06-24 y **re-solicitud enviada el mismo día** con todo alineado a `castillocanton.com` (consent screen 1A ✅ + términos 1B ✅ + formulario 2 ✅). **Esperando aprobación de Google** (~7-10 días; indicador = cuota de Business Information API). Vigilar también el aviso de verificación del GBP de Castillo Cantón. Ver §7.3 para el detalle exacto del punto en que se pausó. Lo demás (pricing, setup, billing) son decisiones de negocio (§8), no técnicas.

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
| ~~Pricing exacto~~ | ✅ 2026-06-07: por nº de fichas, comerciales ilimitados, 2 tiers (Starter 45 € / Professional 149 €) + a medida. Detalle en §9 |
| ~~Setup pagado~~ | ✅ 2026-06-07 (revisado a **129 €** el 2026-06-08): plano para todas las fichas. Falta detallar entregables exactos |
| Billing | Manual con Holded hasta cliente 6-8, luego Stripe |
| Rutas autenticadas con prefijo `/o/[orgSlug]/...` | Deferred. Reevaluar en cliente #5 |

---

## 9. Landing comercial — estado actual

La landing (`app/page.tsx`) está en producción con:
- Hero con estadísticas sociales
- Secciones: sectores target, problema, 3 pasos, caso anonimizado (promotora en Costa de Castellón)
- Pricing por nº de fichas (2 tiers + a medida)
- Sección "Ver Atribuya por dentro" con capturas reales del producto + animación de atribución (ver más abajo)
- FAQ con accordion nativo (`<details name>`)
- Formulario de lead (Zod + honeypot anti-spam)
- Versión en inglés en `/en`
- SEO: `robots.ts`, `sitemap.xml`, JSON-LD `FAQPage`
- Tipografía: Fraunces (headings) + Geist (body)

**Reescritura de copy + pase de diseño (2026-06-07)**: a raíz de feedback externo se realineó todo el copy de la landing (ES + EN, en espejo) del registro descriptivo al beneficio directo y punchy, y se reforzó el diseño para que comunique la categoría (reseñas / Google / SaaS). Cambios durables a conservar:
- **Métrica del hero**: tres "victorias" en vez de features. `100%` atribuido solo el primer mes · `Día 1` ya ves qué comercial trae cada reseña y quién no llega · `0` discusiones de "¿de quién era esta reseña?". La stat del medio se reorientó del ahorro de tiempo / Excel (dolor del administrativo) al deseo del que paga: saber quién rinde. No inventar cifras de €: el único dato real del piloto es 4 comerciales, 1 ficha, 100% verificadas, ~8h, 0 disputas (el ~8h se cita solo en "Caso real").
- **H1**: «Deja de adivinar qué comercial te trae las reseñas de Google.» (EN: "Stop guessing which rep brings in your Google reviews.")
- **CTAs por resultado, no "demo"/"tiempo"**: hero "Quiero saber quién me genera negocio" · header+pricing "Quiero esto" · submit del form. EN: "Show me who drives my business" / "I want this". Viven en `app/page.tsx`, `app/en/page.tsx`, `components/landing/Header.tsx` (`STRINGS[*].cta`), `components/landing/LeadForm.tsx` (`DICTS[*].cta`).
- **Sectores ("Hecho para")**: de footnote gris diminuto a bloque destacado (gancho «¿Tienes red comercial y reseñas de Google? Esto es para ti.» + chips), reusando `SECTORS`.
- **Tarjeta de prueba** `components/landing/ReviewProof.tsx`: reseña de Google de ejemplo (★★★★★ + "G" de Google) conectada a su atribución a un comercial («↳ Atribuida a Mateo Salgado · +1 reseña»). Ancla la categoría y demuestra el producto en un solo elemento; reusa `components/ui/Stars.tsx` y `Avatar.tsx`. En la 2ª fila del hero (claim+CTA col-7 / tarjeta col-5; apila en móvil).
- **FAQ**: padding horizontal en el acordeón (`<summary>` y respuesta) para que el texto no quede pegado al borde del recuadro al abrir.
- Footer statement, meta OG/Twitter y features (feature a beneficio) realineados.

**Replanteamiento de pricing (2026-06-07)**: la landing pasó de **un único plan** (990 € setup + 397 €/mes, hasta 8 fichas / 20 comerciales) a un modelo **por nº de fichas, comerciales ilimitados**. Motivo: el plan único ni era equitativo (clínica de 1 ficha pagaba igual que promotora de 8) ni cubría el avatar primario (promotora mediana se salía del tope). Se factura **por fichas** (coste real del cron/API + unidad que el comprador presupuesta), **comerciales ilimitados** en todos los planes (no penalizar la adopción).

Primero se probó con **3 tiers** (Starter 147 / Professional 347 / Multi 597). **v2 (mismo día)**: se simplificó a **2 tiers + a medida** y se bajó la entrada, tras ver que (a) el coste de infra (~45-55 €/mes Vercel+Supabase+Places) es **de plataforma compartido entre tenants**, no por cliente → margen limpio desde el 2º cliente, y (b) la mayoría del mercado es de **una sola ficha** (será el paquete más vendido). Tabla vigente: **Starter** hasta 2 fichas **45 €/mes** (destacado, "Más elegido") · **Professional** hasta 10 fichas **149 €/mes** · **A medida** +10 fichas / cadenas. **Setup decidido: 129 € plano** para todas las fichas (filtro de compromiso; revisado de 60 € a 129 € el 2026-06-08). Implementación: constante `PLANS` (2 entradas) + grid de 2 tarjetas centrado (`sm:max-w-3xl sm:grid-cols-2`) + banda "Todos los planes incluyen" (`PRICING_INCLUDED` sin límites duros) + strip "A medida", en `app/page.tsx` y `app/en/page.tsx` (espejo). **Pendiente**: enforcement técnico del tope de fichas por plan — hoy `organizations.plan` es placeholder `text` sin validación, requiere migración. Ver CLAUDE.md §8 / spec.md §10.

**Norma de estilo de copy (2026-06-07, permanente)**: en toda la copy de cara al usuario (landing, app, emails, legal) NO usar guiones largos (— / –) como puntuación literaria (usar punto, coma o dos puntos) ni empezar oraciones con "Y". Aplicado ya a landing + legal (`/privacidad`) + emails (`lib/email/*`, `supabase/email-templates/magic-link.html`). Pendiente: el resto de la UI autenticada (~103 cadenas). Ver CLAUDE.md §4.

**Formulario de lead verificado E2E (2026-06-07)**: probado con Playwright contra el proyecto Supabase de prod. Validación Zod OK, inserción real en `leads` OK, UI de éxito OK, aviso por email a `LEAD_NOTIFY_EMAIL` (`a.castillo.esv@gmail.com`) vía Brevo. Flujo: `app/actions/submit-lead.ts` (service-role + honeypot) a `lib/email/notify-lead.ts`. El lead de prueba se insertó y se borró; la BD queda limpia.

**Campo teléfono añadido (2026-06-07)**: el formulario recoge ahora **teléfono obligatorio** junto al email (fila 2: email + teléfono, igual que nombre + empresa). Obligatorio en HTML + Zod (regex `^[+()\d\s.-]+$`, mín. 6). Se guarda en `leads.phone` (migración 017, nullable en BD; la obligatoriedad es de app) y se incluye en el email de aviso con enlace `tel:`. Tipos Supabase actualizados a mano en `lib/supabase/types.ts`. Re-verificado E2E con Playwright contra prod: rechaza envío sin teléfono (error de campo), acepta con teléfono y persiste el valor en `leads.phone`; lead de prueba insertado y borrado. Tests unitarios de `submit-lead` ampliados (teléfono ausente / inválido / válido con prefijo): 177/177 pasan.

**Página de gracias (2026-06-07)**: tras enviar el formulario, `LeadForm` hace `router.push` a una página de confirmación con URL propia (medible como conversión): **`/gracias`** (`app/gracias/page.tsx`) y **`/en/thanks`** (`app/en/thanks/page.tsx`), ambas en `noindex` y reusando `Header`/`Footer` de la landing. El éxito inline se conserva como fallback inmediato antes de navegar. `thanksHref` por idioma vive en `DICTS` de `LeadForm`. **Importante**: `/gracias` se añadió a `PUBLIC_PREFIXES` en `lib/supabase/middleware.ts` (si no, el middleware la trataba como ruta autenticada y redirigía a `/login`); `/en/thanks` ya entraba por el prefijo `/en`. Verificado E2E: el envío ES redirige a `/gracias` y `/en/thanks` renderiza. No están en el sitemap (noindex).

**Sin email de contacto público (2026-06-07)**: se barajó mostrar `hola@atribuya.com` en lugar del Gmail personal, pero exige buzón de pago o reenvío (Hostinger no da reenvío gratis) y no se quería gastar. Decisión: **no mostrar ningún email** de cara al interesado; el único canal público es el **formulario** (que ya avisa a `LEAD_NOTIFY_EMAIL` = el Gmail, así que no se pierde ningún lead). El formulario, el mensaje de éxito inline y las páginas `/gracias` y `/en/thanks` ya no llevan `mailto`. Las refs internas al Gmail (login super_admin, `LEAD_NOTIFY_EMAIL`, `BREVO_REPLY_TO`, test user OAuth) se mantienen.

> **Actualización (2026-06-10)**: el dominio **ya recibe correo**. Se configuró **ImprovMX (plan free)** con catch-all `*@atribuya.com` → `a.castillo.esv@gmail.com` (MX `mx1`/`mx2.improvmx.com` en la zona DNS de Hostinger; verificado E2E con un envío real vía Brevo a `alejandro@atribuya.com`). Es solo **recepción/reenvío**: el envío sigue siendo Brevo. Motivo: la nueva solicitud de acceso a las GBP APIs requiere una cuenta de Google con email del dominio de la app (ver §7.3). La decisión de no publicar email de contacto en la landing sigue vigente; si algún día se quiere, ahora ya es gratis.

Los leads se guardan en tabla `leads` (BD). El email de notificación al super_admin **ya está implementado** (`lib/email/notify-lead.ts`, invocado best-effort desde `app/actions/submit-lead.ts`): se envía a `LEAD_NOTIFY_EMAIL` cuando Brevo está configurado, y degrada con gracia si no (el lead se guarda igual).

**Mostrar el producto en la landing (2026-06-07)**: la landing explicaba el producto pero no enseñaba ninguna pantalla. Se añadió prueba visual real, ES + EN en espejo:
- `components/landing/ProductShot.tsx` (`"use client"`): captura enmarcada en un "chrome de navegador" (3 puntos + pseudo-URL), `next/image` lazy, **lightbox** al clic (Escape / clic fuera, bloqueo de scroll, adaptado de `components/help/HelpFigure.tsx`) y degradación a placeholder si falta el fichero. Exporta también `BrowserFrame`.
- `components/landing/AttributionAnimation.tsx` (`"use client"`): el "money shot" del paso 03 **en movimiento**, hecho con **animación CSS en bucle (no vídeo)**: una reseña de Google entra con "Cruzando enlace, fecha y nombre…" (spinner) y se resuelve a "↳ Atribuida a Mateo Salgado · +1 reseña". Dos capas apiladas cuyas opacidades se alternan (keyframes `atrMatch`/`atrShow`, 6.5s). Respeta `prefers-reduced-motion` (estado final fijo). Reusa `Stars`/`Avatar`. Se eligió animación CSS en vez de MP4: nítida a cualquier tamaño, sin fichero que alojar/mantener, sin tocar CSP. No queda ningún `atribucion.mp4` pendiente.
- **Integración**: el paso 03 de "Cómo funciona" cierra con `AttributionAnimation`; nueva sección **"Ver Atribuya por dentro" (`#producto` / `#product`)** con galería de capturas (dashboard admin + ranking a ancho completo, enlace/QR y mis-reseñas del comercial), todas con lightbox. Mezcla admin (el que compra) + comercial.
- **Assets** en `public/landing/` (`dashboard.png`, `ranking.png`, `enlace-qr.png`, `mis-resenas.png`, todas 2880×1800). Generadas con `scripts/capture-landing.py` (Playwright sobre el **modo demo**, sin Supabase), que **limpia el chrome de desarrollo** antes de disparar: oculta "Modo demo · sin Supabase" y la tarjeta ".env.local", quita los sufijos "(demo)" de los títulos y sustituye `localhost:3000` → `atribuya.com` (en textos y en el `value` de los `<textarea>`). Detalle en `public/landing/README.md`. La cola de verificación (`/resenas/verificacion`) no tiene modo demo, no se captura.

**Retirada de Garantía 90 días + Cliente Insignia (2026-06-07)**: por decisión del usuario se eliminaron de la sección de precios el bloque **"Garantía: si no funciona, te devolvemos la implantación íntegra"** (90 días / 70 %) y el aside **"Cliente Insignia · 5 plazas" / "Founding Customer"**, en ES y EN. También se quitó la frase de la garantía de la respuesta "¿Hay permanencia?" de la FAQ (ES + EN). No quedan menciones en la landing. Si se vuelven a ofrecer, hay que reañadir esos bloques en `app/page.tsx` / `app/en/page.tsx` y la frase en `FAQS`.

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
| [supabase/migrations/](../../supabase/migrations/) | Migraciones 001-017 en orden |
| [docs/tests-multitenancy.md](../tests-multitenancy.md) | 15 tests de aislamiento cross-org — referencia para validar RLS |

---

## 12. Analítica y SEO infra (GA4 + Search Console + dominio) — 2026-06-07

### Google Analytics 4 con consentimiento RGPD
- **Property / Measurement ID**: `G-GKYPWE3QRK`. Var `NEXT_PUBLIC_GA_ID` (en `.env.local` y en Vercel Production). Se incrusta en build → un cambio de valor exige **redeploy sin caché**.
- **Alcance**: solo páginas públicas de marketing y legales (`/`, `/en`, `/en/*`, `/gracias`, `/terminos`, `/privacidad`). La app interna autenticada **NO se rastrea** (ni banner ni GA). Los hits reales solo se envían en `NODE_ENV=production` (en dev se ve el banner pero no se contaminan datos).
- **Consentimiento opt-in (art. 22 LSSI + RGPD/AEPD)**: gtag **no carga** hasta que el usuario pulsa «Aceptar». «Rechazar» igual de visible. Elección persistida en `localStorage` (`atribuya.cookie-consent`). Revocable desde el enlace «Cookies» del footer (dispara el evento `atribuya:open-cookie-consent`).
  - Orquestador: [components/analytics/Analytics.tsx](../../components/analytics/Analytics.tsx) · banner: [components/analytics/CookieBanner.tsx](../../components/analytics/CookieBanner.tsx) (ES/EN) · constantes: [lib/consent.ts](../../lib/consent.ts) · enlace footer: [components/landing/CookiePrefs.tsx](../../components/landing/CookiePrefs.tsx).
  - Política de privacidad (`/privacidad`, sección 8) reescrita para declarar GA4, transferencia a EE. UU. y el opt-in/revocación.
- **GOTCHA CSP**: la `Content-Security-Policy` de [next.config.ts](../../next.config.ts) bloqueaba gtag. Hubo que añadir `https://www.googletagmanager.com` a `script-src` y los endpoints de recogida (`*.google-analytics.com`, `*.analytics.google.com`, etc.) a `connect-src`. Sin esto, el navegador corta gtag aunque el usuario acepte (síntoma: petición a googletagmanager bloqueada por CSP, GA vacío). Si se añaden más servicios de terceros (Ads, Tag Manager, etc.) habrá que ampliar la CSP igual.
- **Conversión de lead**: el formulario dispara el evento GA4 `generate_lead` en el envío correcto vía helper [lib/gtag.ts](../../lib/gtag.ts) (`trackEvent`, no-op si gtag no está cargado). Funciona ES+EN, cuenta el envío real (no la visita a `/gracias`). **Pendiente menor**: marcarlo como **evento clave** (⭐) en GA4 → Eventos clave cuando aparezca en la lista (la lista de gestión va con retraso ≤24h; en Tiempo real es instantáneo). Quitar también el placeholder `purchase` que metió el asistente de objetivos.
- **Tráfico interno** excluido en GA4 (regla por IP) y **retención** subida a 14 meses.

### Search Console
- Propiedad de **tipo Dominio** (`atribuya.com`), verificada por **registro TXT en Hostinger** (`google-site-verification=...`, host `@`). Cubre apex + www + subdominios.
- **Vinculada a GA4** (Admin → Vinculaciones de productos → Search Console). Los datos de búsqueda orgánica tardan 24-48h en poblarse.
- **Sitemap enviado**: `sitemap.xml` (generado por [app/sitemap.ts](../../app/sitemap.ts)).

### Dominio canónico → apex (Opción A SEO)
- Antes `atribuya.com` hacía 308 → `www`. Invertido en **Vercel → Settings → Domains**: ahora `atribuya.com` es **Production/primario** y `www.atribuya.com` hace **308 → apex**.
- Motivo: alinear el host servido con el canonical de las páginas, el sitemap (URLs sin www) y el Auth Site URL de Supabase (`https://atribuya.com`), que ya eran sin www.
- **Consecuencia para OAuth (Vía B)**: el `REDIRECT_URI` debe usar el apex sin www (`https://atribuya.com/api/google/oauth/callback`). El apex ya está autorizado en el cliente OAuth. Ver §6 y §7.
- Aviso «DNS Change Recommended» de Vercel en apex+www: recomendación de DNS pendiente de revisar, no bloquea (la web sirve correctamente).

### LinkedIn
- Página de empresa creada: `linkedin.com/company/atribuya`. Portadas generadas en [public/brand/](../../public/brand/) (`linkedin-cover-light.png` usada, `linkedin-cover-navy.png` alternativa), 1128×191.

## 13. Portado ReseñaHub → Atribuya (2026-06-08)

Llevamos Atribuya a paridad funcional con el producto base single-tenant
(`00 - Proyecto Original.`, en `.gitignore`), **adaptando cada feature a
multi-tenant** (toda RLS nueva lleva `and org_id = public.current_org_id()`; las
escrituras sensibles van por service-role validando propiedad + org en código).
5 fases, cada una verificada (typecheck + build + 190 tests) y desplegada:

1. **Comisiones € + ciclo de comisión** (`45b605c`, mig 018): `profiles.commission_rate`,
   objetivo por defecto 5, lockdown congela la tarifa. Helpers de ciclo 20→19 en
   `lib/date-range.ts` (`commissionPeriodRange`, `commissionShortcuts`, …, día 20 fijo).
   Panel del comercial con € estimado, "abonables", "Por verificar", "Cierra el X".
   Edición de tarifa en invitar/editar comercial. Las 6 pantallas arrancan en el ciclo.
2. **Tarjeta/banner ≤2★** (`8389134`, sin mig): dashboard admin muestra reseñas
   negativas del periodo + CTA a `/manager/resenas?rating_lte=2`. Reusa el motor de
   alertas ya existente.
3. **Autoatribución «Es mía»** (`ba4ae05`, mig 019): verificación reubicada a
   `(profile)/resenas/verificacion` (abierta por rol). El comercial ve las huérfanas
   de su ficha y las reclama (RLS `reviews_unmatched_location_select` +
   `reviews_sales_claim_update`, org-scoped). `claimReview` reusa `createClientRecord`.
4. **Autovinculación de huérfanas** (`afa31f5`, sin mig): al crear un cliente, las
   reseñas sueltas con nombre ≥90% se vinculan solas y las 50-89% se ofrecen en
   `OrphanReviewsModal`. `lib/clients/orphan-reviews.ts` (puro) + acciones por
   service-role; botón "Buscar reseñas" por fila. Reusa `decideDuplicateForClient`.
5. **Rol director de oficina** (`5e413cf`, mig 020+021): enum `office_director`,
   `profiles.director_id` (equipos), `current_office_location()`, y RLS de director
   por **equipo (`director_id = auth.uid()`) y org** sobre profiles/reviews/clients/
   share_links/locations + lockdown congela `director_id`. Rol DUAL (productor +
   gestor de su equipo): sidebar dual, middleware, layouts (admin/sales/profile)
   role-aware, `/directores` (invitar/gestionar), selector «Director responsable»
   en comerciales. El leaderboard marca "★ Director".

**Omitido por decisión** (específico del cliente Inseryal, no encaja en un SaaS
genérico): `brand_enum`, `sales_department_enum`/`department`/`language`, informe
semanal. Los filtros de comerciales son por oficina (ficha) y director, sin
departamento/idioma.

**Migraciones**: 018-021 aplicadas en prod (la 020 y 021 deben aplicarse en
ejecuciones separadas por el 55P04 del enum). **Aislamiento RLS del director
verificado contra la BD real (2026-06-08)** con los seeds `dev-seeds/03_test_director.sql`
(autosuficiente: crea la org/ficha Acme si faltan + 2 directores con un comercial
cada uno) y `03b_director_isolation_checks.sql`: cada director ve solo su equipo
(1), no ve el equipo del otro director ni la otra org, y super_admin ve todo. Ver
[docs/tests-multitenancy.md](../tests-multitenancy.md).

**Para probar el rol en la app** (UI end-to-end): los `dev-seeds/03` crean
directores de prueba pero sin login real (no pasan por GoTrue); para un test de
UI, invita un director desde `/directores` (como admin) y asígnale comerciales.

## 14. Auditoría de seguridad/rendimiento/calidad (2026-06-08)

Pasada de revisión sobre el fork (excluyendo `00 - Proyecto Original.`): 3 agentes
(seguridad multi-tenant, rendimiento, calidad) + typecheck/tests. Typecheck limpio,
190 tests. **3 commits desplegados a prod** (`b1a71db`, `7f19154`, `a8ed581`).

### Arreglado
Clase de bug detectada: **acciones admin que usan `createServiceClient` (salta RLS)
filtrando solo por `id`** → fugas cross-tenant. Cerradas todas con `.eq("org_id")`
del actor + comprobación de filas afectadas antes de borrar cuentas:
- `resendSalesAccess`/`resendManagerAccess`: generaban magic-link de login de OTRA org.
- `deleteSales`/`deleteReviewsManager`: borraban el `auth.user` de otra org.
- `linkGoogleLocation`/`disconnectGoogleLocation`/`updateLocationPlaceId`: operaban
  sobre fichas de cualquier org (nuevo `assertCanManageLocations()`); `conectar/page`
  leía la ficha con service-role → pasa a cliente cookie (RLS).
- `notify-failed`: listaba/reenviaba notificaciones (contenido + emails) de todas las
  orgs → `requireAdmin` devuelve `org_id` y filtra `audit_log`/`reviews`.
- `lib/invite`: unicidad de slug ahora por `org_id` (alineado con mig 013).
- `updateSales`: `.eq("org_id")` de defensa en profundidad.
- `claimReview`: race-safe (comprueba filas; si la reseña ya fue atribuida, borra el
  cliente creado al vuelo y devuelve error en vez de reportar falso éxito).
- Copy: dos guiones largos fuera de strings de UI.
- `office_director` documentado **fuera del ranking/dashboard** (decisión: gestionan,
  no compiten); comentarios obsoletos corregidos.

> Regla durable: cualquier query por service-role DEBE re-aplicar `.eq("org_id")`.
> RLS no protege ese camino (lo salta por diseño), así que los 15/15 tests de
> aislamiento RLS NO cubren las rutas service-role.

### Pendiente (no bloqueante, anotado)
- **🟡 Bajo — integridad de datos**: validar que `director_id`/`location_id` asignados
  en `inviteSales`/`updateSales`/`inviteOfficeDirector` pertenezcan a la org del actor
  (hoy solo se valida formato UUID). RLS contiene la fuga real (el usuario foráneo no
  ve nada), es solo dato corrupto.
- **⚡ Rendimiento — riesgo de timeout**: el primer sync de Business Profile sobre una
  ficha con histórico procesa reseñas una a una (hasta ~500 × 2-4 queries, `maxDuration=60`).
  Recomendado: precargar incumbentes (`location_id,author_name`) y duplicados en batch
  antes del bucle en `lib/cron/process-reviews.ts`. **Bloqueado por la aprobación de la
  Vía B de Google (pendiente; verificada en 0 el 21-jun, ventana ~25-jun)**: hasta entonces no puede dispararse en prod. Tocar el matcher
  = "ask first" + tests delante.
- **⚡ Índices faltantes** (migración nueva → "ask first"): índice parcial para la
  verificación del comercial (`reviews(location_id, google_created_at) where sales_id is
  null and removed_at is null`) y para el edit-merge de Places (`reviews(location_id,
  author_name) where google_review_id like 'places:%'`).
- **Tests**: añadir cobertura específica para las rutas service-role (las pruebas RLS no
  las ven).

## 15. Gestión de orgs en `/super`: editar + invitar admin por email (2026-06-09)

Comprobaciones desde cero (simulando un cliente con plan Starter) destaparon tres huecos
en el panel super-admin de organizaciones, todos resueltos y desplegados a prod.

**Commits**: `9becf4b` (editar org + selector de plan), `7b8028c` (invitar admin desde
fila + email automático).

### Editar organización (`9becf4b`)
- Antes solo existía crear/activar/suspender/eliminar; los datos fiscales solo se metían
  al crear y, si quedaban vacíos, el badge "Fiscales pendientes" era permanente (única
  salida: borrar y recrear). Ahora hay botón **"Editar"** por fila → modal
  `EditOrgForm.tsx` que edita **todo salvo el slug** (el slug es parte de las URLs
  públicas `/o/[slug]/...`, queda fijo y deshabilitado en el form).
- Nueva server action `updateOrg` en `app/(super)/super/actions.ts`: mismo patrón de
  defensa que el resto (`assertSuperAdmin`, Zod, service-role, `revalidatePath`), audit
  `org_updated` con `payload.before`/`after`. Reutiliza `optionalText`/`buildFiscalData`
  (extraídos a `fiscalFields`/`billingEmailField`/`planField` compartidos con `createOrg`).
- El `<details>` de fiscales arranca **abierto** si faltan campos requeridos.

### Selector de plan (`9becf4b`)
- El campo "Plan" era un `<input>` de texto libre con default `"standard"` (no coincidía
  con ningún tier real). Ahora es un `<select>` (crear y editar) poblado desde el nuevo
  `app/(super)/super/plans.ts`: **Starter** (`starter`), **Professional** (`professional`),
  **A medida** (`custom`), default `starter`. `planLabel()` muestra la etiqueta legible en
  la tabla. Las orgs con valores legacy (`"standard"`) conservan el valor: aparece como
  opción "(actual)" hasta reasignarse.
- **Sin migración**: `organizations.plan` sigue siendo `text` libre; el desplegable solo
  aporta consistencia de UI. El enforcement del tope de fichas por plan sigue siendo open
  question (CLAUDE.md §8 #1).

### Invitar admin desde org existente + email automático (`7b8028c`)
- **Hueco grave**: el paso de invitar al primer admin solo aparecía en el instante
  posterior a crear la org (estado `created` de `CreateOrgForm`). Una org ya creada no
  tenía forma de invitar a nadie. Ahora hay botón **"Invitar admin"** por fila →
  `InviteAdminForm.tsx` (modal nombre + email), reutiliza `inviteOrgAdmin`. Sirve para el
  primer admin o admins adicionales.
- **Email automático**: `inviteOrgAdmin` ya no solo genera el enlace; lo envía por Brevo
  con `lib/email/notify-invited-admin.ts` (plantilla de marca, botón "Crear mi acceso").
  Best-effort (no rompe la invitación si el SMTP falla), devuelve `emailSent` y el audit
  registra `email_sent`. La UI muestra "enviada por email" + enlace de respaldo copiable
  (por si va a spam), o el aviso de envío manual si el correo falla.
- **Flujo de alta del cliente ahora**: `/super` → fila de su org → "Invitar admin" →
  nombre + email → le llega el correo con el enlace mágico (`/auth/confirm?...&type=invite`
  → `/dashboard`). El enlace es de un solo uso.
- ⚠️ **Verificar en Vercel** que `BREVO_SMTP_USER`/`BREVO_SMTP_PASS`/`BREVO_FROM_EMAIL`
  están en producción (las mismas del resto de transaccionales). Si faltan, el email se
  salta y solo queda el enlace de respaldo.

---

## 16. Asistente de alta de ficha (Vía A) + fix OAuth en blanco + reorden sidebar (2026-06-09)

Probando el alta de fichas como admin de una org se vieron tres cosas: el formulario era
hueco (creaba fichas sin Place ID → sin reseñas), "Conectar Google" daba **página en
blanco** en prod, y el orden del sidebar no coincidía con el del producto base. Todo
resuelto y desplegado. **Commits**: `1be88e2` (asistente + fix OAuth), `9f5cb09` (nota de
ayuda), `8487971` (reorden sidebar).

**Decisión de fondo**: priorizar **Vía A** (Places API, top-5 reseñas recientes), que
**funciona hoy** y solo necesita el Place ID. **Vía A no necesita la cuenta de Google del
cliente** (el Place ID es público; las reseñas entran con la `GOOGLE_PLACES_API_KEY` de la
plataforma). Esto permite que el proveedor deje la ficha 100% operativa en el onboarding
(justifica los 129 € de setup) sin tocar nada del cliente. Vía B (OAuth, todas las
reseñas) sigue bloqueada esperando aprobación de Google (verificada pendiente el 21-jun, ventana ~25-jun).

### Asistente de alta (`1be88e2`)
- `lib/google/places.ts`: nueva `findPlaceCandidates(query)` con **Text Search legacy**
  (`/place/textsearch/json`), reusando `GOOGLE_PLACES_API_KEY`, `fetchWithRetry`,
  `PlacesApiError` e `isValidPlaceId`. Verificado que el endpoint está habilitado (devuelve
  hasta 20 candidatos con name/address/place_id/rating). Tipo `PlaceCandidate` exportado.
- `app/(admin)/fichas/actions.ts`: server action `searchPlaces(query)` (admin-only vía
  `assertCanManageLocations`, la API key nunca sale al cliente). `createLocation` ahora
  devuelve el `id` de la fila nueva (para el "Sincronizar ahora" del paso final).
- `AddFichaButton.tsx`: el modal pasa a **asistente de 4 pasos** (buscar → elegir candidato
  → confirmar/nombrar → listo + Sincronizar ahora), con escape a "Place ID a mano".
- Copy del empty-state de `/fichas` actualizado a Vía-A-first.

### Fix de la página en blanco (`1be88e2`)
- Causa: `/api/google/oauth/start` llamaba a `getOAuthStartUrl()` **sin try/catch**; con las
  env de OAuth ausentes en prod (Vía B pendiente), `requireEnv()` lanzaba → 500/blanco.
- `app/api/google/oauth/start/route.ts`: try/catch → redirige a
  `/fichas?oauth_error=oauth_unavailable` con banner, en vez de 500.
- `lib/google/business-profile.ts`: nuevo `isGoogleOAuthConfigured()` (no lanza). `/fichas`
  lo usa para degradar el botón a **"Conectar Google · próximamente"** (deshabilitado, con
  tooltip) mientras Vía B no esté. Se reactiva solo cuando se suban las env de OAuth.
- Nota de ayuda fija bajo la tabla de fichas (`9f5cb09`, `SyncMethodsHelp`) explicando
  **Places API** (activo, sin conectar cuenta) vs **Conectar Google** (histórico completo,
  al aprobar Google).

### Reorden del sidebar de admin (`8487971`)
- `components/layout/Sidebar.tsx`: `SidebarItem` soporta ahora `disabled` (sin enlace,
  atenuado) y `badge` (etiqueta corta a la derecha). `ADMIN_SIDEBAR_GROUPS` reordenado para
  igualar al producto base: **INICIO** Dashboard·Ranking · **RESEÑAS** Lista de
  reseñas·Verificación·Respuestas (`PRONTO`, deshabilitado) · **EQUIPO**
  Directores·Comerciales·Gestores · **CONFIGURACIÓN** Fichas Google.
- **Ranking** sube de Equipo a Inicio. **Exportar Excel** sale del sidebar de admin (igual
  que la referencia); sigue en el menú del rol **gestor** y la ruta `/manager/export` no se
  toca. `pickActiveId` ignora items deshabilitados (el href `#` de "Respuestas" haría
  prefix-match con cualquier ruta). Solo se tocó el menú de admin; el resto de roles igual.
- Pendiente menor: la funcionalidad real de "Respuestas" (responder reseñas) no existe; el
  item es solo un marcador visual `PRONTO`.

---

## 17. Email de invitación, fix de formularios, insignias 10 y matcher por mención (2026-06-09)

Tanda de mejoras detectadas probando la app como admin de una org. **Commits**:
`a7af54f` + `a364f36` (formularios), `8d9971c` + `33e43e9` (email invitación), `04b9618`
(insignias), `c3ce368` (matcher por mención).

### Email automático al invitar (`8d9971c`, `33e43e9`)
- Invitar comercial/director/gestor solo generaba un enlace para compartir a mano; el
  invitado no recibía nada. Ahora `createInvitedProfile` ([lib/invite.ts](../../lib/invite.ts))
  envía el email por Brevo (best-effort), lee el nombre de la org y devuelve `emailSent`.
- Nuevo [lib/email/notify-invited-user.ts](../../lib/email/notify-invited-user.ts): plantilla
  genérica por rol (admin/comercial/responsable de reseñas/director). `notify-invited-admin.ts`
  pasa a ser un wrapper fino que delega aquí → el flujo `/super` queda intacto.
- Los 3 modales muestran "enviado por email + enlace de respaldo" o, si falla, el enlace
  para compartir a mano. Las 3 actions propagan `emailSent` en su tipo de retorno.
- `33e43e9`: el modal del enlace ya no se cierra solo. El botón de invitar se renderiza
  también dentro del empty-state; al crear el primero, `revalidatePath` desmontaba esa
  instancia. Quitado el `revalidate` de la acción; la lista se refresca con `router.refresh()`
  al cerrar el modal (mismo patrón que §4.33 del original).
- ⚠️ Requiere `BREVO_SMTP_USER/PASS/FROM_EMAIL` en Vercel (ya presentes).

### Fix formularios — React 19 borraba los campos al fallar (`a7af54f`, `a364f36`)
`<form action={fn}>` resetea los campos no controlados al terminar la acción, también
cuando devuelve error (ej. "email ya registrado") → se perdía lo escrito. Cambiado a
`onSubmit` + `preventDefault` en 7 formularios (invitar comercial/director/gestor, nuevo
cliente, crear org, editar org, LeadForm). LoginForm no se tocó (su email es controlado).

### Insignias del comercial 4 → 10 (`04b9618`)
[lib/panel-badges.ts](../../lib/panel-badges.ts) dejaba de colapsar las de volumen/5★ y
muestra la escalera completa: **Primera reseña** (nueva) · Objetivo del mes · En racha ·
Podio · Líder (solo con equipo) · 10/25 reseñas · 10/25/**50** (nueva) de 5★. 10 con equipo,
8 sin equipo (el contador "X de N" se adapta). Icono nuevo `sparkles`. Sin migración.

### Matcher: atribución por mención del comercial en el texto (`c3ce368`)
Porta del **Proyecto Original** (la copia avanzada de ReseñaHub en `00 - Proyecto Original.`,
su §4.38) la 2ª señal del matcher. Atribuya se forkeó de una versión anterior y le faltaba.

- [lib/matching/attribute-review.ts](../../lib/matching/attribute-review.ts): `attributeReview`
  pasa a ser wrapper en 2 pasos. Si la atribución por nombre+tiempo (`primaryAttribution`)
  NO dio un `counted` sólido, se intenta `attributeByCommercialMention`:
  - **Tier 1** — el texto nombra a un comercial con enlace abierto en ventana → `counted`
    a ese comercial + cliente del mejor candidato (confianza 85 + bonus).
  - **Tier 2** — nombra a un comercial del roster de la ficha sin enlace en ventana →
    `counted` al comercial sin cliente (confianza 78).
  - **Guardrail**: >1 comercial mencionado → no adivina (se queda con nombre+tiempo).
  - `mentionsCommercial` casa por token completo (≥3 letras), nombre de pila o apellido,
    sin acentos. El código es **idéntico al original** salvo un comentario (quité la
    referencia a la doc interna §4.38 de Inseryal).
- Cableado: `ProcessReviewsArgs.commercials`; `process-reviews.ts` enriquece candidatos con
  `sales_full_name` (de `salesById`) y pasa `text` + roster al matcher. **Ambos crons**
  (Places + Business Profile) cargan `sales` + `office_director` con `location_id` y
  construyen `commercialsByLocation` → **scoped por ficha y por tanto por org** (sin fuga
  cross-tenant). De paso, los crons ahora notifican también a directores productores.
- Tests del matcher portados (37 casos; 206 en total). Sin migración.
- ⚠️ Implicación aceptada (igual que el original): un comercial podría inducir a clientes a
  nombrarlo para auto-atribuirse reseñas. El anti-fraude de duplicados por cliente (mig 015)
  sigue capando varias reseñas del mismo cliente. Si aparecen falsos positivos, el lever es
  subir la exigencia de la mención.

## 18. Pendientes menores: badge helpdesk + acceso mobile + enforcement tope de fichas (2026-06-10)

Lote de pendientes menores cerrado. **Sin migración** (ambas tareas a nivel de app/UI).

### 18.1 Badge de no-leídos del helpdesk en el sidebar + acceso a Soporte en mobile
- **Helper** `lib/support/unread.ts:getSupportUnreadCount(supabase)` → llama al RPC
  `support_unread_count()` (mig 016, `SECURITY DEFINER`, ya scopea por org y rol). Best-effort:
  devuelve `0` si Supabase no está configurado, el RPC falla o no hay sesión. Nunca lanza (un
  fallo del helpdesk no debe tumbar la navegación). Tipado con `Awaited<ReturnType<typeof
  createClient>>` (mismo patrón que `lib/supabase/org.ts`; el genérico `SupabaseClient` no
  encaja con el cliente tipado del proyecto).
- **`Sidebar`** acepta prop `supportUnreadCount` y pinta un badge en el item "Soporte" (que vive
  hardcodeado en el footer del aside, fuera de los `groups`). Color `#2563eb` (mismo azul que el
  indicador de no-leído de `ConversationRow`, coherencia visual; el tema no tiene rojo). Tope
  visual "9+".
- Cableado en los **4 layouts** que montan el sidebar: `(admin)`, `(manager)`, `(sales)`,
  `(profile)`.
- **Acceso a Soporte en mobile**: el comercial no tenía forma de llegar a `/soporte` en mobile
  (no hay sidebar, solo `MobileTabBar` con 4 tabs). Añadida 5ª tab "Soporte" con su propio badge
  (`supportUnreadCount` también se pasa a `MobileTabBar` desde `(sales)` y `(profile)`).

### 18.2 Enforcement del tope de fichas por plan (solo app, sin migración)
- **Decisión** (ask first → usuario eligió "solo app"): no se toca la BD. Razón: `createLocation`
  es el **único** camino de creación de fichas y ya está gateado a admin. Si en el futuro se
  quiere defensa en profundidad en Postgres, sería un trigger (migración → "ask first").
- **Fuente única** del límite: `app/(super)/super/plans.ts:planLocationLimit(plan)` → `starter=2`,
  `professional=10`, `custom`/desconocido/legacy (`standard`) = `null` (ilimitado). Los planes no
  reconocidos se tratan como ilimitados **a propósito**: el enforcement es freno comercial, no de
  seguridad, y no debe bloquear orgs antiguas sin plan canónico.
- **Validación** en `createLocation` ([app/(admin)/fichas/actions.ts]): tras `requireOrgContext`,
  lee `organizations.plan` (RLS scopea a la org del admin), cuenta `locations` con `org_id`
  explícito (`count: "exact", head: true`) y rechaza si `count >= limit`. Best-effort: si no se
  puede leer plan/conteo, no bloquea.
- **UX en `/fichas`**: el contador del topbar muestra "n / tope" cuando hay límite; el botón
  "+ Añadir ficha" (`AddFichaButton`) se deshabilita con tooltip al llegar al tope; y aparece un
  aviso ("Tope de fichas alcanzado") sobre la lista. El botón del empty-state no recibe `atLimit`
  (con 0 fichas nunca se está al tope).

### 18.3 Nota GA4 (no es código)
- `generate_lead` (`lib/gtag.ts`, disparado en `LeadForm` tras envío exitoso + consentimiento +
  prod) **ya se ha disparado** en prod (confirmado en Tiempo real) pero aún no figura en Admin →
  Eventos → "Eventos recientes" (latencia ~24-48 h). Falta marcarlo como evento clave (estrella)
  cuando aparezca. GA4 ya no permite precrear el evento clave por nombre. Ver CLAUDE.md §7.
  **Recordatorio remoto** programado: routine `trig_01MJ5YaQHoa1LywSusPzBYYt` (one-shot, 12-jun
  2026 09:00 Europe/Madrid) que deja por escrito los pasos manuales de GA4 y verifica que el
  código del evento sigue en su sitio.

**Verificación**: `npm run typecheck` limpio, `npm test` 206/206.

---

## 19. Fix de seguridad CRITICAL: vista `reviews_active` se saltaba la RLS (mig 022, 2026-06-10)

**Origen**: el Security Advisor de Supabase (Database → Advisors) marcó `public.reviews_active`
como "Security Definer View" con severidad CRITICAL.

### 19.1 El problema, verificado E2E
- La vista `reviews_active` (mig 010, azúcar sintáctico `select * from reviews where removed_at is null`)
  se creó **sin** `security_invoker`. En Postgres una vista ejecuta por defecto con los permisos
  de su **dueño** (`postgres`), que se salta la RLS de la tabla base.
- Al vivir en `public`, PostgREST la expone. Resultado: **cualquiera con la anon key** (que va en
  el bundle JS del navegador) podía leer **todas las reseñas de todas las orgs**, sin login.
- Verificado antes del fix: `GET /rest/v1/reviews` (anon) → `[]` (RLS bien), pero
  `GET /rest/v1/reviews_active` (anon) → fila completa de una reseña real (texto, rating,
  `match_evidence`, ids internos). Clase de fuga del §4 "Never do" de CLAUDE.md.
- Atenuante: el código de la app **no usa la vista** en ningún sitio (solo la define la mig 010);
  la exposición era directa vía PostgREST, no a través de la app.

### 19.2 El fix (migración 022)
- `supabase/migrations/022_reviews_active_security_invoker.sql`:
  `alter view public.reviews_active set (security_invoker = true);` (Postgres 15+; prod está en 17).
  Con eso la vista evalúa permisos y RLS como el usuario que consulta, igual que la tabla.
- Verificado después: la misma petición anónima a `reviews_active` devuelve `[]`.
- Reversible: `set (security_invoker = false)`. No toca datos.

### 19.3 De paso: reparado el drift del historial de migraciones
- Las migraciones **015-021** se aplicaron en su día por SQL Editor / Management API sin quedar
  registradas en el historial remoto del CLI → `supabase db push --linked` habría intentado
  reaplicarlas.
- Arreglado con `supabase migration repair --status applied 015 016 017 018 019 020 021 --linked`
  (solo bookkeeping, no toca esquema) y verificado con `db push --dry-run` (solo 022 pendiente)
  antes del push real.
- A partir de ahora el flujo canónico de CLAUDE.md §6 (`migration list` / `db push --linked`)
  vuelve a reflejar la realidad y es el camino preferido para aplicar migraciones.

### 19.4 Avisos restantes del Advisor (no urgentes)
- Los warnings naranjas "Auth RLS Initialization Plan" (audit_log, profiles, clients, share_links,
  reviews, support_*) son **solo de rendimiento**: las policies llaman a `auth.uid()` /
  `current_org_id()` fila a fila. Fix conocido: envolver en subselect `(select auth.uid())` dentro
  de cada policy. Con el volumen actual es irrelevante; candidato a una futura migración de
  housekeeping cuando haya tráfico real.

## 20. Pricing v3: híbrido por comerciales con tope de fichas (2026-06-11)

Decisión de negocio de Alejandro: casi todo el mercado objetivo (concesionarios, clínicas,
piso piloto) tiene UNA ficha pero varios comerciales, así que el pricing v2 "por fichas"
metía a todos en el tier barato para siempre. El valor del producto crece con el equipo.

### 20.1 El modelo
| Plan | Valor `organizations.plan` | Comerciales | Fichas | Precio |
|---|---|---|---|---|
| Básico | `basic` | hasta 5 | 1 | 45 €/mes |
| Estándar (destacado) | `standard` | hasta 15 | hasta 3 | 99 €/mes |
| Plus | `plus` | hasta 30 | hasta 10 | 199 €/mes |
| A medida | `custom` | ilimitado | ilimitado | a hablar |

- **Seats**: cuentan los perfiles `role in (sales, office_director)` con `status in (invited, active)`.
  Los directores ocupan plaza (son productores con panel propio). Pausar libera la plaza.
- Bloques holgados a propósito: si compensara esconder comerciales (cuentas compartidas),
  el matcher perdería el roster y la atribución parecería rota.
- Legacy v2: `starter`/`professional` conservan su tope de fichas (2/10) y siguen con
  comerciales ilimitados (era lo vendido). Setup 129 € sin cambios.

### 20.2 Implementación
- `app/(super)/super/plans.ts`: `PLAN_OPTIONS` v3, `DEFAULT_PLAN = "basic"`,
  `PLAN_LOCATION_LIMITS` (basic 1 / standard 3 / plus 10 + legacy), nuevo
  `PLAN_SALES_LIMITS` + `planSalesLimit()`.
- Nuevo `lib/plan-seats.ts`: `countSeats(orgId, excludeId?)` (service-role + filtro org_id
  explícito, porque el gestor no tiene SELECT sobre directores), `orgSeatLimit(orgId)` y
  `checkSeatLimit(orgId, excludeId?)`. Best-effort como el tope de fichas: si no se puede
  leer plan o conteo, no bloquea (freno comercial, no de seguridad).
- Enforcement: `inviteSales` y `updateSales` (reactivación con `excludeId`) en
  `app/(admin)/comerciales/actions.ts`; `inviteOfficeDirector` y `updateDirector` en
  `app/(admin)/directores/actions.ts`.
- UX (espejo del patrón de `/fichas`): contador "n / tope comerciales" en el Topbar de
  `/comerciales`, botones de invitar deshabilitados con tooltip al tope (props
  `atLimit`/`limit` en `InviteSalesButton` e `InviteDirectorButton`, también en el
  empty-state), card de aviso en `/comerciales` explicando que los directores ocupan plaza.
- Landing ES+EN: 3 tarjetas + a medida (grid `sm:grid-cols-2 lg:grid-cols-4`), el destacado
  pasa de Starter a **Estándar**, la línea principal de cada tarjeta es el nº de comerciales
  y la ficha pasa al bullet; bullet "Comerciales ilimitados" sustituido por
  "Reseñas ilimitadas, sin coste por reseña atribuida"; FAQ "¿Cuánto cuesta?" reescrita.
- Datos: las 2 orgs existentes (Acme Promotora, AleCris) tenían el plan legacy `standard`
  (que ahora colisionaría con el tier Estándar) → actualizadas a `basic` vía PostgREST con
  service-role el 2026-06-11. Ambas tienen 1 ficha, encajan.
- Tests: `app/(super)/super/__tests__/plans.test.ts` fija la tabla de límites por test
  (un cambio accidental cambia lo que vendemos).

## 21. Blog bilingüe con Sanity CMS + mejoras SERP (2026-07-04)

**SERP (commits `e071544`, `fbbeb7f`)**: el snippet de Google mostraba favicon de globo, título truncado y sitename "atribuya.com". Fixes: `app/favicon.ico` multi-res 16/32/48 (antes 404) + `app/icon.png` a 192×192 (Google exige múltiplos de 48), titles ES/EN a menos de 60 chars alineados con OG, descriptions a ~155, y JSON-LD `WebSite` + `Organization` + `SoftwareApplication` (ofertas generadas desde el array `PLANS`, nunca se desincronizan de las tarjetas) en ambas homes. Pendiente del usuario: pedir reindexación en Search Console.

**Blog (commit `dd87602`)**: `/blog` (ES) + `/en/blog` (EN) + Sanity Studio embebido en `/studio`.

- **Paquetes**: `sanity@4.22` + `next-sanity@11.6` + `@sanity/vision@4.22` + `@sanity/image-url@2.1` + `@portabletext/react@6.2` + `styled-components@6.4` (peer). ⚠️ **NO subir a sanity v5 / next-sanity v12**: exigen React 19.2+/Next 16.
- **Estructura**: `sanity.config.ts` (raíz), `sanity/env.ts` (guard `isSanityConfigured()`), `sanity/schemaTypes/` (post con campo `language` es/en, author, category, blockContent), `sanity/lib/` (client lazy, urlFor, queries GROQ con fetchers que devuelven vacío en fallo), `components/blog/` (BlogHeader, PostCard, PortableTextComponents, BlogIndexPage/BlogPostPage compartidos por locale), rutas finas en `app/blog/` y `app/en/blog/` (ISR 600s, `generateStaticParams` por idioma, metadata completa, JSON-LD Blog/BlogPosting), `app/studio/[[...tool]]/` (force-dynamic, noindex).
- **Modo degradado**: sin `NEXT_PUBLIC_SANITY_PROJECT_ID` el build pasa, /blog muestra estado vacío, /studio muestra aviso, sitemap omite posts.
- **Infra tocada**: `lib/supabase/middleware.ts` (`/blog` y `/studio` en `PUBLIC_SEGMENT_PREFIXES`; bot-gate con `isPublicSeoPath()` por prefijos), `next.config.ts` (CSP connect-src +sanity, `images.remotePatterns` cdn.sanity.io, lookahead X-Robots-Tag +blog), `app/robots.ts`, `app/sitemap.ts` (async con posts), `components/analytics/Analytics.tsx` (+/blog con GA4 y banner).
- **Bugfix de paso**: `/en/terms` y `/en/privacy` recibían `X-Robots-Tag: noindex` y 403 a bots pese a estar en el sitemap (lookahead y `PUBLIC_SEO_PATHS` no las incluían). Verificado corregido en prod.

**Activación (COMPLETADA por API el 2026-07-04)**:
1. ✅ Proyecto Sanity `afup27st` creado vía Management API con el token del CLI (cuenta del usuario, org «Alejandro Castillo» `oUXuFKdTZ`). Dataset `production` público.
2. ✅ `NEXT_PUBLIC_SANITY_PROJECT_ID=afup27st` + `NEXT_PUBLIC_SANITY_DATASET=production` en `.env.local` y en Vercel (Production + Preview + Development) vía `npx vercel env add`. Redeploy hecho.
3. ✅ CORS origins `http://localhost:3000` y `https://atribuya.com` con Allow credentials.
4. ✅ CSP ampliada tras probar el Studio con navegador real: `script-src` +`core.sanity-cdn.com`; `connect-src` +`api.sanity.io`/`*.api.sanity.io`/`wss`/`*.apicdn.sanity.io`/`cdn.sanity.io`/`sanity-cdn.com`. Studio carga sin errores de consola.
5. ✅ Acceso del admin: el proyecto quedó a nombre de la identidad del token del CLI; el login del navegador (Google `a.castillo.esv@gmail.com`) era otra identidad y daba «Not authorized». Resuelto invitando ese email como `administrator` (el usuario aceptó). **Gotcha**: Sanity distingue identidades por proveedor de login; usar siempre «Continuar con Google».

**Gestión**: sanity.io/manage/project/afup27st. Para crear/borrar contenido por API: subir asset a `https://afup27st.api.sanity.io/v2021-06-07/assets/images/production` y mutaciones en `/data/mutate/production` con el token del CLI (`~/.config/sanity/config.json` o `~/Library/Application Support/sanity/config.json`).

## 22. Reestructuración de la landing + revisión por buyer persona (2026-07-04)

**A. Landing → URLs por sección + navegación unificada** (commit `1e91618`). La home de una sola página con anclas (`#precios`, `#faq`...) no era enlazable desde el blog y concentraba todo el SEO en una URL. Ahora:
- **Páginas propias indexables (ES+EN)**: `/producto`·`/en/product`, `/precios`·`/en/pricing`, `/casos`·`/en/case-studies`, `/demo`·`/en/demo`. Cada una: `SiteHeader`+`Footer`, metadata con canonical + hreflang ES↔EN + robots index, H1 y JSON-LD `BreadcrumbList`. `SoftwareApplication` (ofertas desde `plans`) movido a `/precios`; `FAQPage` sigue en la home.
- **Home = hub**: hero, problema, cómo funciona, características, FAQ + bloque de teasers (`HubTeasers`) que enlaza a las páginas. Todos los CTA → `/demo`.
- **Cabecera única**: `components/site/SiteHeader.tsx` (generaliza el antiguo `landing/Header`, con nav por rutas reales). Se borran `components/landing/Header.tsx` y `components/blog/BlogHeader.tsx`. Usada en home, secciones, blog (layouts), legales y gracias/thanks. Rutas centralizadas en `lib/marketing/nav.ts`; helper SEO (`sectionMetadata`, `breadcrumbJsonLd`) en `lib/marketing/seo.ts`.
- **Secciones como componentes por locale** (fuente única ES/EN, antes duplicadas): `components/sections/{ProductSection,PricingSection,CaseSection,DemoSection,HubTeasers,SectionCta}.tsx`. `PricingSection` exporta `plans` para el JSON-LD.
- **SEO en los 3 puntos**: `next.config.ts` (`INDEXABLE_PATHS_NEGATIVE_LOOKAHEAD` +8 rutas), `lib/supabase/middleware.ts` (`PUBLIC_SEGMENT_PREFIXES` ES + `PUBLIC_SEO_PATHS` las 8), `app/sitemap.ts` (+8 URLs). `Analytics.tsx` mide las nuevas. `components/landing/Footer.tsx` enlaza Producto/Precios/Casos/Demo.

**B. Revisión por buyer persona + mejoras de copy** (commit `2a062d6`). Se auditó el sitio con los 4 buyer personas del Excel `Buyer Persona/Buyer persona Atribuya.xlsx` (Javier/Dir. Comercial, Marta/Operaciones, Carlos/CEO, Laura/Reputación-CX) lanzando 4 agentes, uno por persona. Diagnóstico: el sitio hablaba muy bien al comprador de ventas (Javier/Carlos), flojo a la operativa (Marta) y casi nada a reputación/CX (Laura, potencial detractora). Cambios aplicados (copy y estructura, sin tocar producto):
- Nueva sección `components/sections/WhyAtribuya.tsx` en la home (ES+EN), 4 tarjetas: *De reseñas a negocio* (CEO), *Reconocimiento no rivalidad* (Dir. Comercial), *Tú tienes la última palabra* (Operaciones), *Reputación con contexto* + alerta 1-2★ + APIs oficiales de Google (Reputación/CX).
- **Coherencia del dato de precisión**: se reconcilia «100% de las verificadas» con «la mayoría solas, el resto a un clic» en hero y `CaseSection` (los revisores lo leían como maquillaje).
- Hero: sello «APIs oficiales de Google, RGPD y DPA firmado» + 2º CTA «Ver precios» (antes CTA único).
- Footer: «Un producto de Castillo Cantón» (enlace a castillocanton.com).
- FAQ: la de Birdeye reencuadrada como complemento no sustituto (cerraba el autogol para reputación); nuevas FAQ de migración («no migras nada») y de respuesta a reseñas (avisos hoy, respuesta directa en camino). Feature nueva: aviso inmediato de reseñas 1-2★.

**Nota de seguridad**: el Excel de buyer personas se coló en el commit `2a062d6` (repo público) y se sacó en `938ab66` + `.gitignore` (`Buyer Persona/`, `Venta/`). Sigue en el historial de ese commit; el usuario decidió no purgar el historial (el Excel válido es el de hoy). El fichero local se conserva.

**Pendientes de la revisión (impacto medio, no bloqueantes)** — también en CLAUDE.md §8.2:
1. Captura real de la **cola de reseñas dudosas** en `/producto` (pantalla diaria de Operaciones).
2. **Tabla de roles** en `/precios` (admin/comercial/manager).
3. **DPA descargable** desde `/precios`.
4. Mini **comparativa «Atribuya vs Birdeye vs Excel»**.
5. **Testimonio nominal** en `/casos` al firmar permiso comercial (hoy anónimo).
6. Primer **artículo real del blog**.
Descartado a propósito: garantía de devolución (el usuario retiró el programa de garantía; ver §8.2 open questions).

Verificación de ambos: typecheck + 228 tests + build verdes; headers/bot-gate/sitemap y contenido comprobados en prod (ES y EN).

## 23. Blog vivo + E-E-A-T + fixes de web + rediseño de la home (2026-07-04)

Sesión larga sobre el blog, el SEO/datos estructurados, la navegación/i18n/layout y el rediseño de la home. Todo en `main`, verificado en prod (`atribuya.com`). Cadena de commits (orden): `c71fc58` → `3c9726a`.

### 23.1 Primer artículo del blog + lectura de Sanity con token (`c71fc58`, `de3e0db`)
Publicado el 1er post ES «Cómo saber qué comercial ha conseguido cada reseña de Google» (`/blog/atribuir-resenas-google-comerciales`), autor Alejandro Castillo con foto, enlaces internos a `/producto` y `/demo`.
- **Gotcha resuelto (clave)**: el dataset Sanity `production`, aunque marcado `aclMode=public`, **NO sirve lecturas anónimas por la API** (probado exhaustivamente: tokenless=0 / `reason:"permission"` en todos los endpoints/versiones/perspectivas; toggle Private↔Public no lo arregla). Solución: `sanity/lib/client.ts` pasa a usar **`SANITY_API_READ_TOKEN`** (permiso Viewer, server-only; `useCdn=!token`; sin token degrada a anónimo sin romper build). Token en Vercel prod+preview (`sensitive`) + `.env.local`. El blog es Server Component → el token nunca llega al navegador.
- **Escritura por API**: `SANITY_API_WRITE_TOKEN` (Editor, solo `.env.local`) + **`scripts/seed-post.mjs`** (seed idempotente de autor/categoría/post; sube fotos con `client.assets.upload`, ids content-addressed → no duplica). `sanity/lib/writeClient.ts` = cliente de escritura reusable.
- **Gotcha Vercel**: `vercel env pull` muestra `""` para vars `sensitive` (incl. GA/Supabase que SÍ funcionan) → no fiarse del pull para verificar valor. Los `NEXT_PUBLIC_SANITY_*` de Vercel se dejaron como `plain` (`afup27st`/`production`) para poder verificarlos.

### 23.2 Página de autor (E-E-A-T) (`7a82f59`, `de3e0db`)
Nueva ruta `/blog/autor/[slug]` (`app/blog/autor/[slug]/page.tsx` + `components/blog/AuthorPage.tsx`): foto, bio, cargo, enlaces a perfiles y listado de artículos. Esquema `author` extendido con `slug`+`bio`+`sameAs`. JSON-LD `ProfilePage`→`Person` con `sameAs` (LinkedIn `linkedin.com/in/alejandro-castillo-canton`, X `@castillo_canton`, `castillocanton.com`), `jobTitle`, `worksFor`. La firma del post enlaza al autor. Sitemap incluye las páginas de autor. ES-only.

### 23.3 Auditoría de datos estructurados + cierre del grafo (`f10aabc`, `d4990d7`)
Revisado todo el JSON-LD del sitio (198 checks OK, 0 problemas). Correcciones: `BlogPosting.author` enlaza a la Person del autor (mismo `@id`); el post recibe **imagen principal** (`ranking.png` a Sanity) → resuelve el `image` de Article + og:image + miniatura; `BreadcrumbList` en post/índice/autor; `Organization` con `description` + `founder`→Person. El mismo `@id` de Person aparece en author-del-post + founder-de-org + ProfilePage → Google fusiona **una entidad**. **BreadcrumbList añadido también a las 4 páginas legales** (antes solo en secciones). Gotcha: la OG dinámica (`/opengraph-image`) no sirve para JSON-LD (redirige a `/login` sin hash + hash variable por deploy) → usar `cdn.sanity.io`.

### 23.4 «Cómo funciona» página propia + 6 fixes nav/i18n/layout (`97230da`)
1. **«Cómo funciona»** pasa de ancla (`/#como-funciona`) a **página indexable** `/como-funciona`·`/en/how-it-works`. Sección de pasos extraída a `components/sections/HowItWorks.tsx` (reutilizada en home + página). Plomería SEO en los 3 puntos (next.config lookahead + middleware `PUBLIC_SEGMENT_PREFIXES`/`PUBLIC_SEO_PATHS` + sitemap) + `nav.ts` (routes.how).
2. **Selector de idioma desplegable** `components/site/LangSwitcher.tsx` (client): muestra ambos idiomas con bandera, marca el actual.
3. **Estado activo del menú** `components/site/MainNav.tsx` (client, `usePathname`+`aria-current`), también en `MobileMenu`.
4. **Breadcrumb alineado al logo** (`mx-auto w-full max-w-6xl px-5 pt-6`) en TODAS: sacado del contenedor estrecho en blog y legales (layout legal simplificado, el `<article>` 720 pasó a las páginas).
5. **Casos**: layout 2 columnas + panel de métricas (100%/≈8h/mes/0).
6. **Tabla de contenidos** en artículos: `lib/blog/toc.ts` (extractor con dedup por `_key`) + `components/blog/ArticleToc.tsx`; `ptComponents` → factory `makePtComponents(idByKey)` con `id`+`scroll-mt-28`.
- **Nota build (recurrente)**: `app/(admin)/resenas` y `app/(admin)/ajustes` son WIP local **sin rastrear** que rompe `next build` local (conflicto de rutas paralelas con `(profile)/resenas/verificacion`). No están en git ni en Vercel. Para builds locales, apartarlas temporalmente.

### 23.5 Pulido de UI global (`b27d49e`, `fb5bc91`, `517bc46`)
- **Estado activo del menú sin caja**: el activo va en tinta + peso (sin pastilla de fondo, que no gustó); en móvil, acento fino a la izquierda.
- **Sidebar en artículos**: el post pasa a 2 columnas dentro de `max-w-6xl` (contenido + `<aside>` sticky con tarjeta compacta «Pedir demo», `components/blog/SidebarDemoCta.tsx`). **TOC plegable** (`<details open>` con chevron) que se queda inline.
- **Cabecera con fondo al hacer scroll**: `components/site/HeaderShell.tsx` (isla client): transparente arriba, fondo `bg-bg/85` + `backdrop-blur` + borde inferior al pasar 8px de scroll (antes era sticky transparente → el contenido se transparentaba sobre el logo).
- **Footer reorganizado** (`components/landing/Footer.tsx`): identidad en 2 líneas (© + «Un producto de Castillo Cantón»); a la derecha, menú operativo / línea 1px / menú legal; **eliminado el selector de idioma** del footer.
- Revisión móvil (Playwright, 14 páginas públicas, viewport 390px): **0 scroll horizontal**, menú/idioma/TOC/casos/footer OK.

### 23.6 Rediseño de la home (audit de diseño «Hallmark») + acento (`3ed9b53`, `303f25e`, `c48e157`, `3c9726a`)
El usuario la veía «coja». Diagnóstico (no era «slop», era lo contrario: hiper-editorial e infra-construida en credibilidad/producto, con jerarquía invertida). Fixes aplicados en `app/page.tsx`:
- **Hero fusionado**: antes había dos heroes apilados (panel de stats `100%/Día 1/0` con copy roto ANTES del H1). Ahora el **H1 abre** la página; el `100%/0/Día 1` baja a una **franja de prueba del piloto** con copy completo y correcto.
- **Banda de producto real**: «Todo tu equipo, en un panel» con captura del dashboard (`ProductShot`, `public/landing/dashboard.png`) tras «Cómo funciona». La home ya no solo cuenta el producto, lo enseña.
- **Franja de confianza real** antes del CTA final: APIs oficiales de Google · RGPD · DPA firmado · aislamiento por cliente (RLS). Prueba honesta, **sin logos ni testimonios inventados** (se rechazó fabricarlos).
- **Acento de marca terracota**: token **`--accent #A84A2A`** (+`--accent-strong`/`--accent-bg`) en `globals.css` + `tailwind.config.ts`. Uso *restrained*: números del piloto y enlaces clave; **los CTAs siguen en tinta**, sin color en fondos/títulos. (El logo es azul marino; el usuario eligió el cálido para contraste editorial.)
- **CTA intermedio**: «¿Ves quién te genera negocio? Compruébalo con tu equipo» entre características y teasers.
- **Pendiente (bloqueado por contenido)**: testimonio nominal + logos reales (el piloto es anónimo, aún no hay clientes) → se cablea cuando exista contenido real.

**Update 2026-07-04 (misma fase, más tarde)**:
- **Terracota extendido a toda la web pública** (ES+EN), nivel «Editorial + CTA» (el usuario pidió más color: solo se veía en 3 stats + 1 enlace). Regla aplicada: cursivas serif de titular → `text-accent`; números gigantes `01/02/03` de «Cómo funciona» → `text-accent`; **CTAs de conversión** → `bg-accent`/`hover:bg-accent-strong` (botón del header desktop+móvil, heros, CTA intermedio, `SectionCta`, submit de `LeadForm`, plan destacado + badge de `PricingSection`, `SidebarDemoCta`, páginas de gracias); bullets decorativos → `bg-accent`. **Excepciones deliberadas**: el «Aceptar» de la cookie se queda en tinta (consentimiento RGPD, no dark-pattern); las cursivas sobre el fondo negro de «Problema» siguen en blanco (contraste); los verdes **semánticos** (`bg-ok`/`text-ok` de «Verificada» en `ReviewProof`/`AttributionAnimation` y del éxito de formulario) se mantienen. Contraste `#A84A2A` sobre blanco ≈ 6.5:1 (AA). Como se tocaron los componentes compartidos (`sections/*`, `SiteHeader`, `LeadForm`, `SidebarDemoCta`), propaga a todas las subpáginas. Commit `3276660`.
- **Home EN a paridad con la ES**: replicado el rediseño completo en `app/en/page.tsx` (hero fusionado con franja de stats de apoyo en terracota, banda de producto `ProductShot`, CTA intermedio, franja de confianza de 4 columnas). Orden de secciones idéntico. Commit `977b368`.

### Sesión 2026-07-05
- **Blog**: 1er artículo publicado en ES (`/blog/atribuir-resenas-google-comerciales`) y EN (`/en/blog/attribute-google-reviews-to-sales-reps`, `scripts/seed-post-en.mjs`), ambos con la **sección de políticas de Google** (captura del centro de ayuda de Google Maps: pedir reseñas con contenido que identifique a un empleado está prohibido) + enlaces del cuerpo en terracota. **Página de autor bilingüe** (`/en/blog/author/[slug]`) + autores ES+EN en sitemap. **Paginación** del índice (`components/blog/BlogPagination.tsx`, `PAGE_SIZE=9`, `?page=N`, página 1 canónica).
- **Auditoría Lighthouse** de las 25 páginas públicas (Chrome/lighthouse local contra prod): best-practices 100 y SEO 100 en todas las indexables, a11y 100. Fixes: contraste (`text-ink-4`→`ink-3`, `--ok` #217A3E, avatar en tinta), `Stars role="img"`, `BrowserFrame` url `aria-hidden`, cookie link descriptivo, **legales ES a indexables** (canonical+hreflang), meta-description en `/login`, CTA precios «Pedir demo»/«Book a demo», **`AttributionAnimation` estática** (el bucle daba falso positivo de contraste). **`/llms.txt`** (público en middleware `PUBLIC_EXACT_PATHS` + fuera del noindex) y **`robots.txt`** con permiso explícito a bots de LLMs + `Sitemap:`. `browserslist` moderno + `sizes` en el logo (el «JavaScript antiguo» de PSI viene de una dependencia prebundleada, sin puntuación → se deja).
- **Texto legal RGPD** completo bajo el formulario de `/demo` (ES+EN) en `LeadForm.tsx`.
- **Iubenda (probado y revertido)**: se intentó sustituir el banner propio por la Cookie Solution de Iubenda (Google Consent Mode v2 → descartado por ser de pago; widget `embeds.iubenda.com` → no arranca con `next/script` porque depende de `document.currentScript`; embed clásico con autobloqueo, commits `aa3204a`/`6b2d2fa`/`146c3d1`/`959ffb4`). Nunca se llegó a confirmar que el banner autoarrancara y el «Paso 2 · configurar» del dashboard quedó a 1/3. **Decisión del usuario (2026-07-05): deshacerlo por completo.** Revertido vía `git checkout aa3204a^` (commit `6cf5ae4`) y **env `NEXT_PUBLIC_IUBENDA_*` eliminadas de Vercel** (3 entornos) + `.env.local`. La cuenta de Iubenda puede dejarse o borrarse desde su dashboard.
- **Consentimiento → vanilla-cookieconsent** (decisión final tras valorar opciones gratuitas RGPD con 2 agentes). Se descartaron los CMP alojados (Cookiebot/Osano/Termly/CookieYes): comparten el fallo de embed de Iubenda con `next/script` y tienen topes gratuitos incómodos para un sitio bilingüe. Elegida **`vanilla-cookieconsent`** (orestbida, v3.1.0, MIT, npm): al ser librería y no embed, **no repite el fallo y no toca la CSP**. Cumple RGPD de forma proporcionada (lo que el usuario pidió: «el nivel que cumpla la RGPD»): registro versionado en cookie first-party `atribuya_consent` (ID + timestamp + `revision` + categorías) como prueba del art. 7.1, re-consentimiento al subir `CONSENT_REVISION`, categorías granulares (necessary + analytics), «Rechazar» a igual peso que «Aceptar» (AEPD, `equalWeightButtons`), modal de preferencias. **Sin log en servidor** (no exigido para analítica, y procesaría más datos). Ficheros: nuevo `lib/cookie-consent-config.ts` (config + i18n ES/EN, factory que recibe `defaultLang` + `onAnalyticsConsent`); `components/analytics/Analytics.tsx` reescrito (arranca `CookieConsent.run()` una vez en páginas públicas con un `ref`, `setLanguage` en cambio de locale, y gatea los `<Script>` de gtag por el estado `analyticsAccepted` que fijan `onConsent`/`onChange` → GA solo tras aceptar y solo en prod); `components/landing/CookiePrefs.tsx` → `CookieConsent.showPreferences()`; tema de marca en `app/globals.css` (`#cc-main` CSS vars: botones neutros de igual peso, enlaces y toggle en terracota). **Borrados** `components/analytics/CookieBanner.tsx` y `lib/consent.ts`. Privacidad §8 (ES+EN) actualizada (registro versionado + preferencias por categoría). typecheck + build verdes (build local requiere apartar las carpetas WIP `app/(admin)/ajustes`+`resenas`). **Verificado E2E en prod** con navegador real (commits `403d670` + fix): banner autoarranca, gtag no carga antes de aceptar y sí después, cookie `atribuya_consent` con `consentId`+`consentTimestamp`+`revision`, no reaparece tras recargar, footer «Preferencias» reabre el modal. ⚠️ **Gotcha de testing**: la librería trae `hideFromBots:true` (oculta el banner a `navigator.webdriver`) → Playwright headless NO lo ve; hay que spoofear `navigator.webdriver` (`--disable-blink-features=AutomationControlled` + `add_init_script`). Es correcto y deseado (bots no necesitan analítica).
- **Página de Política de Cookies (ES+EN)** (el usuario avisó de que no había política de cookies como tal, solo la §8 de privacidad). Nuevas rutas indexables `/cookies`·`/en/cookies` (`app/(legal)/cookies/page.tsx` + `app/en/(legal)/cookies/page.tsx`, mismo template legal): qué son las cookies, **tabla** (`atribuya_consent` 6 meses / cookies de sesión / `_ga`+`_ga_*` hasta 2 años, con titular·finalidad·tipo·duración), base jurídica + consentimiento, gestión/retirada (botón `CookiePrefs` embebido), transferencias a Google + opt-out, cambios y contacto. **Segunda capa AEPD**: el banner (`footer` del `consentModal`) y el modal de preferencias («Más información») enlazan a `/cookies` + `/privacidad`. Footer: enlace «Cookies» → política + botón «Preferencias» → modal (antes «Cookies» era el botón). Privacidad §8 (ES+EN) enlaza a la política. Alta SEO en los 3 puntos (next.config lookahead + middleware `PUBLIC_SEGMENT_PREFIXES`/`PUBLIC_SEO_PATHS` + sitemap) con canonical+hreflang. Fix: `/cookies` faltaba en el `isPublicPath` **del componente Analytics** (allowlist distinta de la del middleware) → sin él, `run()` no arrancaba en esa página y el botón de preferencias no abría (commits `64ef933` + `1692bc4`). Verificado E2E en prod (200, indexables, banner/footer/prefs OK ES+EN).
- **Copy del footer**: statement cambiado de «Sabes qué comercial te trae cada reseña de Google.» a «Descubre qué comercial hay detrás de cada reseña de Google.» (EN: «Discover which sales rep is behind every Google review.»), commit `5599cfb`. Solo el statement del footer; el title SEO y el hero de `app/en/page.tsx` («know/stop guessing which rep brings in…») comparten ese registro y quedaron pendientes de alinear si se quiere.

**Estado para la próxima sesión**: web y blog en buen estado (Lighthouse verde). **Consentimiento cerrado y verificado en prod**: vanilla-cookieconsent + política de cookies dedicada (`/cookies`·`/en/cookies`). Bloqueante técnico del producto sigue siendo **Google OAuth Vía B** (esperando aprobación, ver §7.3). Pendientes menores de marketing: alinear el copy del title/hero EN al tono «descubrir» (opcional), testimonio/logos reales y los de la revisión buyer persona (§22).

## 24. Plan de contenidos + lead magnet + artículo #1 (2026-07-05, sesión tarde)

Arranque del **motor de contenidos** para captar leads/ventas. Todo en `main`, verificado en prod. Cadena de commits: `6b2e759` → `74ed8b5`.

### 24.1 Housekeeping previo
- Borrada `app/(admin)/resenas/` (copia obsoleta de mayo, subconjunto estricto de `(profile)/resenas/verificacion`, que rompía `next build` por colisión de rutas paralelas). Ahora el build local pasa sin apartar carpetas. **Nota**: `app/(admin)/ajustes` ya no existe; ese gotcha recurrente de §23.4 queda resuelto en la parte de `resenas`.
- `Plan de contenidos/` añadido al `.gitignore` (material de negocio, repo público). El usuario movió ahí `Buyer Persona/` (antes en la raíz); se quitó la regla muerta `Buyer Persona/` del `.gitignore` (cubierta por `Plan de contenidos/`).

### 24.2 Plan de contenidos (estrategia)
Documento en `Plan de contenidos/plan-de-contenidos.md` (**gitignored**), siguiendo el marco de 8 pasos de la guía `Plan de contenidos/MSEO-Content-Marketing_compressed.pdf` (BIG school). **5 pilares** (Conseguir reseñas · Atribución · Equipo comercial · Reputación y respuesta · Políticas/cumplimiento), regla 80/20, backlog de 12 artículos, ES-first, canales blog/SEO + LinkedIn, con lead magnets.
- **Realidad de keywords (Keyword Planner España)**: nicho de **bajo volumen** y los head-terms son intención equivocada (`reseñas google` 18.100 = consumidores viendo SUS reseñas, no compradores). Intención de negocio toda baja (`pedir reseñas google` 40 +67% interanual, `conseguir reseñas en google` 70, `google my business reseñas` 140). Categoría (`atribuir reseñas comerciales`) = 0. → El SEO clásico es canal lento/pequeño; la apuesta gana por **autoridad temática + long-tail agregado + GEO (motores de respuesta) + LinkedIn + lead magnet**. Recalibrado el objetivo de tráfico a la baja.
- **SEO/GEO de fuentes primarias**: Google (guía oficial de optimización para IA generativa, 2026) → optimizar para IA = SEO people-first + E-E-A-T con experiencia de primera mano + estructura semántica; NO markup especial, NO schema para IA, `llms.txt` lo ignora Google; evitar «hacks» GEO/AEO y keyword stuffing. Paper GEO (Aggarwal et al., KDD 2024, validado en Perplexity): **citas textuales +41%, estadísticas con fuente +33%, citar fuentes +28%**; keyword stuffing no funciona. Ambas convergen: **rigor de fuente** (datos citados, quotes reales, referencias) + experiencia + estructura.

### 24.3 Artículo #1 publicado (Pilar A)
`/blog/conseguir-resenas-google-equipo-comercial` (ES), vía **`scripts/seed-post-conseguir-resenas.mjs`** (idempotente, patrón de `seed-post.mjs`; reutiliza el autor `author.castillo-canton`). Crea la **categoría nueva «Conseguir reseñas de Google»** (`category.conseguir-resenas-google`). Optimizado SEO/GEO: respuesta directa citable, **estadística con fuente** (BrightLocal LCRS 2026, 97%/45%, enlazada), **cita verbatim de la política de Google** (verificada: `support.google.com/business/answer/3474122` responde 200 con GET; el 404 previo era falso positivo de HEAD; frase oficial ES sobre incentivos), FAQ, estructura semántica. **Cover = `enlace-qr.png`** (el enlace/QR del comercial; se evitó reutilizar `ranking.png`, que ya es la portada del otro post). Borrador fuente en `Plan de contenidos/borradores/` (gitignored). Reglas de marca respetadas (sin guiones largos, sin «Y» inicial). Nota: `dynamicParams` no está en `false` → los slugs nuevos se sirven on-demand sin redeploy.

### 24.4 Lead magnet «Plantilla de atribución de reseñas» (bucle de captación completo)
- **Asset**: Excel generado con openpyxl (`Plan de contenidos/lead-magnets/*.xlsx`, gitignored) + copia servida en **`public/recursos/plantilla-atribucion-resenas-google.xlsx`** (deployable, descargable). 4 pestañas (Cómo usar · Comerciales · Registro · Ranking automático con COUNTIFS), logo de marca, 0 errores de fórmula (recalc con LibreOffice en `/Applications/LibreOffice.app/Contents/MacOS`).
- **Imagen hero**: mockup del ranking renderizado con Playwright (HTML→screenshot 2x) en `public/recursos/plantilla-atribucion-resenas-google-ranking.png` (2240×1244, 135 KB). Es la imagen de la página del lead magnet y su `og:image` (NO del artículo).
- **Página indexable** `/recursos/plantilla-atribucion-resenas` (`app/recursos/plantilla-atribucion-resenas/page.tsx`, ES-only): copy + «cómo funciona» + FAQ + `FAQPage`/`BreadcrumbList` JSON-LD + imagen. SEO encendido en los 3 puntos + `robots.index:true` + canonical (sin hreflang EN). `/recursos` añadido a `PUBLIC_SEGMENT_PREFIXES` y a `PUBLIC_SEO_PATHS` del middleware.
- **Captación** (reutiliza infra de leads): `components/landing/LeadMagnetForm.tsx` (nombre + email + RGPD + honeypot) → `app/actions/submit-lead-magnet.ts` (`submitLeadMagnet`) inserta en `leads` con `source: "lead-magnet:plantilla-atribucion-resenas"` (**`company` centinela** porque es NOT NULL) + evento GA4 **`download_lead_magnet`** + entrega por Brevo (`lib/email/deliver-lead-magnet.ts`, enlace de descarga; la página ofrece además botón de descarga directa como fallback). Verificado E2E en prod por el usuario.

### 24.5 Fix de datos estructurados del blog (aplica a TODOS los posts)
Revisión del JSON-LD del artículo. Dos mejoras en `components/blog/BlogPostPage.tsx`:
- **`publisher` autocontenido**: era una referencia `@id` colgante (el nodo `Organization` con name/logo solo vive en la home) → el rich result de Article salía sin `publisher.name/logo` al validarse por página. Ahora emite el `Organization` con el mismo `@id` y `name/url/logo` replicados EXACTOS de `app/page.tsx` (`logo: icon.png`).
- **`articleSection`**: añade los títulos de categoría del post (la query `getPost` ya proyecta `categories` como `string[]`).

### 24.6 Pendiente para la próxima
Artículos **#2-#12** del backlog (validar keywords + reordenar a clusters por job-to-be-done antes de escribir). **Difusión en LinkedIn.** Marcar **`download_lead_magnet` como evento clave en GA4** (como `generate_lead`). Reenviar el **sitemap en Search Console** para acelerar el descubrimiento del artículo y de `/recursos/...`. Opcional: `keywords` en el JSON-LD; traducir a EN solo cuando la versión ES demuestre tracción y se localice también el lead magnet.

### 24.7 Auditorías SEO + ilustraciones de marketing (misma sesión, tarde). Commits `7d271e8` → `5513c8a`
- **Meta descriptions**: auditadas las 26 páginas indexables midiendo el HTML servido en prod. **Títulos todos ≤60 (OK).** 5 descriptions pasaban de 160 y se recortaron: `/como-funciona` (175→142), `/en/how-it-works` (165→155), `/recursos/plantilla-atribucion-resenas` (187→140), y las **páginas de autor** (435, usaban la bio completa) → `generateMetadata` ahora **trunca la bio a ≤160** con «…» de forma genérica (sirve para futuros autores). Commit `7d271e8`.
- **Auditoría alt/title/rel** (a petición del usuario): las **17 imágenes** (`<img>` + `next/image`) YA tienen `alt` (decorativas con `alt=""`+`aria-hidden`, correcto); los **13 enlaces `target="_blank"`** YA llevan `rel="noopener noreferrer"`. **No se añadió `title` masivo** en imágenes/enlaces a propósito: es anti-patrón (redundante con `alt`/texto ancla, tooltip inaccesible, degrada a11y) según Google/MDN/WCAG. No requirió cambios. `rel` solo importa en SEO como `sponsored`/`ugc`/`nofollow`, y no hay enlaces de pago/UGC → nada que cualificar.
- **Ilustraciones editoriales** en `/como-funciona`, `/precios` (+ EN): dos ilustraciones a mano de stock (Freepik «nunny», ⚠️ **verificar licencia/atribución**) que trajo el usuario en `~/Downloads/*.zip`. Optimizadas de 5001px/1.6 MB → **WebP con fondo transparente ~40 KB** (`public/illustrations/{como-funciona,precios}.webp`). Proceso (numpy+PIL, sin scipy): trim por bbox de contenido → resize 1100px → **quitar fondo** por flood-fill del fondo conectado al borde (conserva los blancos internos = brazos) + **filtrado por componentes conexos** para eliminar las motas de textura del papel. `/como-funciona`: hero a 2 columnas a nivel de página (texto + ilustración). `/precios`: **prop opcional `illustration` en `PricingSection`** (la home NO lo pasa → no cambia) que pinta la cabecera real («Un plan para cada tamaño», sigue H1) en 2 columnas con la ilustración arriba a la derecha. Nota: el filtro de motas se llevó una de las dos estrellitas decorativas de la ilustración de precios (menor; recuperable bajando el umbral). Commits `085946b`/`2de380a`/`6b06c48`/`524b1dd`/`5513c8a`.

## 25. Artículo #2 + blog bilingüe completo + hreflang (2026-07-06). Commit `0b58e38`

### 25.1 Artículo #2 del backlog (Pilar B)
Publicado **«Ranking de reseñas por comercial sin generar rivalidad»** (`/blog/ranking-resenas-comercial-sin-rivalidad`, `scripts/seed-post-ranking-sin-rivalidad.mjs`). Pilar B (dirigir equipo comercial), persona Javier (Dir. Comercial), fase Consideración. Categoría nueva «Equipo comercial». Estructura: intro «En corto», el error que lo convierte en campo de batalla, qué medir (reseñas atribuidas, no autodeclaradas), 5 reglas (lista numerada), del ranking al incentivo, cómo hacerlo sin Excel, FAQ, resumen + CTA `/demo`. Enlaces internos al artículo de conseguir reseñas + `/producto` + `/recursos/plantilla-atribucion-resenas` + `/demo`. Cover: `ranking.png`. Se eligió el #2 sobre el #3 (políticas de Google) porque el #3 solaparía con el artículo #1, que ya lleva la cita verbatim de políticas.

### 25.2 Portadas cambiadas por el usuario (Studio)
El usuario reemplazó las portadas de los 3 posts ES por **ilustraciones WebP propias** desde el Studio (`que-comercial-ha-conseguido-cada-resena.webp`, `como-conseguir-resenas-de-google.webp`, `Ranking de reseñas por comercial.webp`). Las imágenes NO están en git (`public/landing/*.png` sin cambios); viven como assets de Sanity. **Cuidado al re-seedear**: los seed ES suben `public/landing/*.png` como portada → un `--force` PISARÍA la ilustración nueva del usuario. Las traducciones EN se hicieron leyendo la portada del post ES y reutilizando su asset (no re-suben nada).

### 25.3 Blog bilingüe completo (traducciones EN)
Traducidos a EN los 2 artículos que solo estaban en ES: **conseguir reseñas** (`/en/blog/get-google-reviews-with-your-sales-team`, `scripts/seed-post-conseguir-resenas-en.mjs`, categoría «Getting Google reviews») y **ranking** (`/en/blog/sales-rep-review-ranking-without-rivalry`, `scripts/seed-post-ranking-sin-rivalidad-en.mjs`, categoría «Sales team»). Ambos reutilizan la portada WebP del post ES hermano (leen `mainImage.asset._ref` del post ES). CTA de la plantilla redirigido a `/en/demo` porque el lead magnet solo existe en ES. Política de Google parafraseada + enlazada (sin cita verbatim inventada en EN). Ahora los 3 artículos tienen espejo ES+EN.

### 25.4 hreflang entre versiones ES/EN de cada post
Los posts individuales solo emitían `canonical`, sin `hreflang` → Google no relacionaba ES con EN. Solución:
- **Schema**: campo nuevo `translationSlug` (string) en `sanity/schemaTypes/post.ts` (editable en el Studio).
- **Query**: `translationSlug` proyectado en `POST_QUERY` + añadido al tipo `Post` (`sanity/lib/queries.ts`).
- **Metadata**: `alternates.languages` (`es`/`en`/`x-default`) en `app/blog/[slug]/page.tsx` y `app/en/blog/[slug]/page.tsx`. `x-default` → versión ES (sitio ES-first). Solo se emite si `translationSlug` existe.
- **Backfill**: `scripts/link-post-translations.mjs` enlaza los 3 pares bidireccionalmente por `_id` (PATCH idempotente, no `createOrReplace` → no pisa portada/cuerpo).
- Verificado en prod: los 6 posts declaran hreflang recíproco y consistente. Un solo `sitemap.xml` con todo (ES+EN) sigue siendo lo correcto; no se hacen sitemaps por idioma.

### 25.5 ⚠️ Mantenimiento del hreflang (nota durable)
Al **traducir un artículo nuevo**: añadir el par ES/EN en `scripts/link-post-translations.mjs` (array `PAIRS`) y ejecutarlo, o rellenar `translationSlug` en el Studio en AMBOS posts. Si se **re-seedea un post con `--force`**, `createOrReplace` borra `translationSlug` → volver a correr `link-post-translations.mjs`. El campo se edita también desde el Studio, así que las ediciones manuales persisten.

### 25.6 Cache purge
Método usado para reflejar las portadas nuevas de Sanity y meter los posts EN en el sitemap: **redeploy** (resetea el ISR de todo el blog + regenera el `sitemap.xml` estático + limpia la caché del optimizador de imágenes). El `sitemap.xml` es estático (sin `revalidate`) → solo se refresca en build/redeploy.

### 25.7 Pendiente para la próxima
Artículos **#3-#12** del backlog. **Difusión LinkedIn.** Marcar **`download_lead_magnet` como evento clave en GA4** (sigue pendiente). Verificar **licencia de las ilustraciones** (Freepik). Reenviar sitemap en Search Console para acelerar descubrimiento de los posts nuevos.
