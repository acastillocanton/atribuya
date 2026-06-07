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
| — | Reescritura de copy de la landing (tono beneficio-first) | ✅ | 2026-06-07 |

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
- **Vía B — OAuth Business Profile ⏳ ESPERANDO A GOOGLE**. Trae **todas** las reseñas, pero exige que el cliente sea admin de su ficha y conecte su cuenta (OAuth). Ya configurado: consent screen modo **Testing** (External, test user `a.castillo.esv@gmail.com`), scope `business.manage`, OAuth client "Web application" (redirect `https://www.atribuya.com/api/google/oauth/callback` + apex + localhost), APIs **Account Management** + **Business Information** habilitadas. **Falta solo la aprobación de Google**: se envió la solicitud de acceso a las Business Profile APIs (desbloquea la Reviews API v4) el 2026-06-07 → caso de soporte **`7-4031000041620`**, revisión 7-10 días hábiles. Hasta que aprueben, la v4 da `PERMISSION_DENIED` y cubre el hueco la Vía A. **Tras aprobación**: subir `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` a Vercel + redeploy + probar OAuth. ⚠️ **Usar el `REDIRECT_URI` SIN www** (`https://atribuya.com/api/google/oauth/callback`): desde 2026-06-07 se invirtió el dominio canónico a apex (Opción A SEO: `www` hace 308 → `atribuya.com`), y los callbacks OAuth no siguen redirecciones. El apex ya estaba autorizado en el cliente OAuth. Hay un **recordatorio remoto programado** para el 18-jun: `trig_01CBuCBCcBdJuvRfr5VeBpyi`.

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
| ~~Pricing exacto~~ | ✅ 2026-06-07: por nº de fichas, comerciales ilimitados, 2 tiers (Starter 45 € / Professional 149 €) + a medida. Detalle en §9 |
| ~~Setup pagado~~ | ✅ 2026-06-07: **60 € plano** para todas las fichas. Falta detallar entregables exactos |
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

Primero se probó con **3 tiers** (Starter 147 / Professional 347 / Multi 597). **v2 (mismo día)**: se simplificó a **2 tiers + a medida** y se bajó la entrada, tras ver que (a) el coste de infra (~45-55 €/mes Vercel+Supabase+Places) es **de plataforma compartido entre tenants**, no por cliente → margen limpio desde el 2º cliente, y (b) la mayoría del mercado es de **una sola ficha** (será el paquete más vendido). Tabla vigente: **Starter** hasta 2 fichas **45 €/mes** (destacado, "Más elegido") · **Professional** hasta 10 fichas **149 €/mes** · **A medida** +10 fichas / cadenas. **Setup decidido: 60 € plano** para todas las fichas (filtro de compromiso). Implementación: constante `PLANS` (2 entradas) + grid de 2 tarjetas centrado (`sm:max-w-3xl sm:grid-cols-2`) + banda "Todos los planes incluyen" (`PRICING_INCLUDED` sin límites duros) + strip "A medida", en `app/page.tsx` y `app/en/page.tsx` (espejo). **Pendiente**: enforcement técnico del tope de fichas por plan — hoy `organizations.plan` es placeholder `text` sin validación, requiere migración. Ver CLAUDE.md §8 / spec.md §10.

**Norma de estilo de copy (2026-06-07, permanente)**: en toda la copy de cara al usuario (landing, app, emails, legal) NO usar guiones largos (— / –) como puntuación literaria (usar punto, coma o dos puntos) ni empezar oraciones con "Y". Aplicado ya a landing + legal (`/privacidad`) + emails (`lib/email/*`, `supabase/email-templates/magic-link.html`). Pendiente: el resto de la UI autenticada (~103 cadenas). Ver CLAUDE.md §4.

**Formulario de lead verificado E2E (2026-06-07)**: probado con Playwright contra el proyecto Supabase de prod. Validación Zod OK, inserción real en `leads` OK, UI de éxito OK, aviso por email a `LEAD_NOTIFY_EMAIL` (`a.castillo.esv@gmail.com`) vía Brevo. Flujo: `app/actions/submit-lead.ts` (service-role + honeypot) a `lib/email/notify-lead.ts`. El lead de prueba se insertó y se borró; la BD queda limpia.

**Campo teléfono añadido (2026-06-07)**: el formulario recoge ahora **teléfono obligatorio** junto al email (fila 2: email + teléfono, igual que nombre + empresa). Obligatorio en HTML + Zod (regex `^[+()\d\s.-]+$`, mín. 6). Se guarda en `leads.phone` (migración 017, nullable en BD; la obligatoriedad es de app) y se incluye en el email de aviso con enlace `tel:`. Tipos Supabase actualizados a mano en `lib/supabase/types.ts`. Re-verificado E2E con Playwright contra prod: rechaza envío sin teléfono (error de campo), acepta con teléfono y persiste el valor en `leads.phone`; lead de prueba insertado y borrado. Tests unitarios de `submit-lead` ampliados (teléfono ausente / inválido / válido con prefijo): 177/177 pasan.

**Página de gracias (2026-06-07)**: tras enviar el formulario, `LeadForm` hace `router.push` a una página de confirmación con URL propia (medible como conversión): **`/gracias`** (`app/gracias/page.tsx`) y **`/en/thanks`** (`app/en/thanks/page.tsx`), ambas en `noindex` y reusando `Header`/`Footer` de la landing. El éxito inline se conserva como fallback inmediato antes de navegar. `thanksHref` por idioma vive en `DICTS` de `LeadForm`. **Importante**: `/gracias` se añadió a `PUBLIC_PREFIXES` en `lib/supabase/middleware.ts` (si no, el middleware la trataba como ruta autenticada y redirigía a `/login`); `/en/thanks` ya entraba por el prefijo `/en`. Verificado E2E: el envío ES redirige a `/gracias` y `/en/thanks` renderiza. No están en el sitemap (noindex).

**Sin email de contacto público (2026-06-07)**: se barajó mostrar `hola@atribuya.com` en lugar del Gmail personal, pero exige buzón de pago o reenvío (Hostinger no da reenvío gratis) y no se quería gastar. Decisión: **no mostrar ningún email** de cara al interesado; el único canal público es el **formulario** (que ya avisa a `LEAD_NOTIFY_EMAIL` = el Gmail, así que no se pierde ningún lead). El formulario, el mensaje de éxito inline y las páginas `/gracias` y `/en/thanks` ya no llevan `mailto`. Las refs internas al Gmail (login super_admin, `LEAD_NOTIFY_EMAIL`, `BREVO_REPLY_TO`, test user OAuth) se mantienen.

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
