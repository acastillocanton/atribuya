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
| —. Pricing definido: por nº de fichas, comerciales ilimitados, 2 tiers (45/149 €) + a medida (3 tarjetas), setup plano 129 € (detalle → §8 / handoff §9) | ✅ 2026-06-07 |
| —. Formulario de lead: campo **teléfono obligatorio** (mig 017 `leads.phone`), verificado E2E (detalle → handoff §9) | ✅ 2026-06-07 |
| —. Analítica + SEO infra: GA4 (`G-GKYPWE3QRK`) con banner de consentimiento opt-in RGPD (solo páginas públicas, hits solo en prod), evento de conversión `generate_lead`, Search Console verificado (DNS) + vinculado a GA4 + sitemap enviado, dominio canónico invertido a apex (`www` 308 → `atribuya.com`) (detalle → handoff §12) | ✅ 2026-06-07 |
| —. Página de empresa en LinkedIn (`linkedin.com/company/atribuya`) | ✅ 2026-06-07 |
| —. Landing: muestra el producto. Capturas reales del admin (`/dashboard`, `/ranking`) + comercial (`/panel/enlace`, `/panel/resenas`) en `public/landing/` con marco de navegador y lightbox (`components/landing/ProductShot.tsx`), más una animación CSS del paso 03 (la atribución resolviéndose, `AttributionAnimation.tsx`, sin vídeo). Script `scripts/capture-landing.py` (modo demo, limpia chrome de dev). ES+EN | ✅ 2026-06-07 |
| —. **Portado ReseñaHub → Atribuya** (paridad con el producto base, adaptado a multi-tenant). 5 fases desplegadas: comisiones € + ciclo de comisión 20→19 (mig 018), tarjeta/banner ≤2★ en dashboard, autoatribución del comercial «Es mía» (mig 019), autovinculación de reseñas huérfanas al crear cliente, y **rol director de oficina** con equipos `director_id` + RLS por equipo/org (mig 020/021) + `/directores`. Omitido lo específico de Inseryal (departamento/idioma/marca). Detalle → handoff | ✅ 2026-06-08 |
| —. Gestión de orgs en `/super`: botón **Editar org** (todo salvo slug, `updateOrg` + audit `org_updated`), **selector de plan** (Starter/Professional/A medida, `plans.ts`, sin migración) e **Invitar admin desde fila** con **email automático** Brevo (`notify-invited-admin.ts`, best-effort + enlace de respaldo). Cierra el hueco de no poder invitar a una org ya creada (detalle → handoff §15) | ✅ 2026-06-09 |
| —. **Asistente de alta de ficha (Vía A)**: el modal pasa a wizard de 4 pasos (buscar negocio en Google → elegir candidato → confirmar → sincronizar), `findPlaceCandidates` (Text Search legacy) + action `searchPlaces`. Vía A no necesita el Google del cliente → el proveedor deja la ficha operativa en el onboarding. **Fix página en blanco** de "Conectar Google" (try/catch en `oauth/start` + `isGoogleOAuthConfigured` degrada el botón a "próximamente"). **Reorden sidebar admin** según ReseñaHub (`SidebarItem.disabled`/`badge`; Ranking→Inicio; Respuestas `PRONTO`; Exportar Excel sale del menú admin, sigue en gestor) (detalle → handoff §16) | ✅ 2026-06-09 |
| —. **Email automático al invitar** comercial/director/gestor (`notify-invited-user.ts`, best-effort + enlace de respaldo; `createInvitedProfile` devuelve `emailSent`). **Fix formularios**: `action={fn}`→`onSubmit` para que React 19 no borre los campos al fallar (7 forms). **Insignias del comercial 4→10** (escalera completa, sin colapsar; sin migración). **Matcher: atribución por mención del comercial en el texto** (paridad con el original — wrapper 2 pasos + Tier 1/2 + guardrail; crons cargan roster `commercialsByLocation` por ficha→org; sin migración) (detalle → handoff §17) | ✅ 2026-06-09 |
| —. **Pendientes menores (lote)**: (1) **badge de no-leídos del helpdesk** en el sidebar (`getSupportUnreadCount()` → `support_unread_count()`, cableado en los 4 layouts; badge azul `#2563eb` en "Soporte", tope visual "9+") **+ acceso a Soporte en mobile** (nueva tab en `MobileTabBar` con su badge, antes inaccesible sin sidebar). (2) **Enforcement del tope de fichas por plan** a nivel de app (sin migración): `planLocationLimit()` en `plans.ts` (starter=2/professional=10/custom·legacy=ilimitado), validación en `createLocation` + UX en `/fichas` (contador "n / tope", botón deshabilitado al límite, aviso) | ✅ 2026-06-10 |
| —. **Fix de seguridad CRITICAL (mig 022)**: la vista `reviews_active` (mig 010) se creó sin `security_invoker` → ejecutaba como su dueño (postgres) y se saltaba la RLS de `reviews`; cualquiera con la anon key leía reseñas de todas las orgs vía PostgREST (verificado E2E antes y después del fix). Detectado por el Security Advisor de Supabase. Fix: `alter view ... set (security_invoker = true)`. De paso, **reparado el drift del historial de migraciones remoto** (015-021 se aplicaron por SQL Editor sin registrarse; `supabase migration repair --status applied` → `db push --linked` vuelve a ser usable) | ✅ 2026-06-10 |
| —. **Pricing v3 — híbrido por comerciales** (decisión + implementación): 3 tiers + a medida (Básico `basic` 5 comerciales/1 ficha 45 € · Estándar `standard` 15/3 99 € **destacado** · Plus `plus` 30/10 199 € · `custom` ilimitado). `planSalesLimit()` en `plans.ts` + `lib/plan-seats.ts` (seats = sales + office_director con status invited/active; pausar libera), enforcement en `inviteSales`/`inviteOfficeDirector`/reactivaciones + UX de tope en `/comerciales` y `/directores` (contador, botón deshabilitado, aviso). Landing ES+EN con 4 tarjetas. Las 2 orgs existentes (plan legacy `standard`) migradas a `basic` por SQL. Tests `plans.test.ts`. Detalle → spec §10.4 / handoff | ✅ 2026-06-11 |
| —. **Mejoras SERP + blog bilingüe con Sanity CMS**: favicon válido para Google (ico 16/32/48 + icon 192px), titles ≤60, JSON-LD `WebSite`/`Organization`/`SoftwareApplication`; blog `/blog` (ES) + `/en/blog` (EN) con Studio embebido en `/studio` (sanity@4 + next-sanity@11, ⚠️ no subir a v5/v12 hasta Next 16), ISR 600s, modo degradado sin env vars, bugfix noindex/403 de `/en/terms`+`/en/privacy`. **Sanity ACTIVADO 2026-07-04** (proyecto `afup27st`, dataset `production`, CORS + env vars en Vercel; admin `a.castillo.esv@gmail.com` vía Google). Detalle → handoff §21 | ✅ 2026-07-04 |
| —. **Reestructuración de la landing → URLs por sección + navegación unificada**: la home de una sola página con anclas se parte en páginas propias indexables (ES+EN): `/producto`·`/en/product`, `/precios`·`/en/pricing`, `/casos`·`/en/case-studies`, `/demo`·`/en/demo`. Home = hub (hero, problema, cómo funciona, características, FAQ, teasers→páginas, CTA→/demo). **Cabecera única `components/site/SiteHeader.tsx`** (sustituye `landing/Header` + `blog/BlogHeader`, borrados) usada en home/secciones/blog/legales/gracias; rutas en `lib/marketing/nav.ts`, helper SEO en `lib/marketing/seo.ts`; secciones en componentes por locale (`components/sections/*`, fuente única ES/EN). SoftwareApplication JSON-LD movido a `/precios`, FAQPage sigue en home. SEO sincronizado en los 3 puntos (next.config lookahead + middleware + sitemap) | ✅ 2026-07-04 |
| —. **Revisión por buyer persona + mejoras de copy**: auditoría del sitio con los 4 buyer personas (Excel en `Buyer Persona/`, gitignored) vía 4 agentes. Cambios: sección `WhyAtribuya` (4 voces: reseña→negocio, ranking que reconoce, control operativo, reputación/CX + alerta 1-2★ + APIs Google); dato de precisión coherente (100%-verificadas ↔ «mayoría solas, resto a un clic»); sello Google/RGPD/DPA + 2º CTA «Ver precios» en hero; «Un producto de Castillo Cantón» en footer; FAQ de Birdeye reencuadrada (complemento), nuevas FAQ de migración y respuesta a reseñas. Detalle + pendientes → handoff §22 | ✅ 2026-07-04 |
| —. **Primer artículo del blog + lectura de Sanity con token**: publicado el 1er post ES («Cómo saber qué comercial ha conseguido cada reseña de Google», `/blog/atribuir-resenas-google-comerciales`, autor Alejandro Castillo con foto, enlaces a `/producto` y `/demo`), creado vía nuevo `scripts/seed-post.mjs` (seed idempotente) + `sanity/lib/writeClient.ts`. **Gotcha resuelto**: el dataset `production`, aunque marcado `aclMode=public`, **no sirve lecturas anónimas por la API** (probado exhaustivamente) → el cliente de lectura (`sanity/lib/client.ts`) pasa a usar `SANITY_API_READ_TOKEN` (permiso Viewer, server-only, `useCdn=!token`; sin token degrada a anónimo sin romper build). Además: la proyección de `author` no pedía `image` y la firma era solo texto → añadido avatar en `BlogPostPage`. Verificado E2E en prod. Ver §7 | ✅ 2026-07-04 |
| —. **Página de autor (E-E-A-T SEO)**: nueva ruta `/blog/autor/[slug]` (`app/blog/autor/[slug]/page.tsx` + `components/blog/AuthorPage.tsx`) con foto, bio, cargo, enlaces a perfiles y listado de artículos. **JSON-LD `ProfilePage` + `Person`** con `sameAs` (LinkedIn/X/web), `jobTitle` y `worksFor`→org (señal E-E-A-T clave). Esquema `author` extendido (`slug`+`bio`+`sameAs`); la firma del post enlaza al autor; páginas de autor en el sitemap. Ficha de Alejandro Castillo poblada vía `seed-post.mjs`. Indexable (cubierta por `blog/.*` en el noindex de `next.config`). **Bilingüe (2026-07-04)**: ruta EN `/en/blog/author/[slug]` (`AuthorPage` ya era locale-aware); páginas de autor ES+EN en el sitemap. Verificado E2E | ✅ 2026-07-04 |
| —. **Post EN + paginación del blog (2026-07-04)**: versión inglesa del 1er artículo (`scripts/seed-post-en.mjs`, `/en/blog/attribute-google-reviews-to-sales-reps`, categoría EN propia, autor y assets compartidos) + **sección de políticas de Google** en ambos idiomas (ES+EN) con captura del centro de ayuda de Google Maps (pedir reseñas con contenido que identifique a un empleado está prohibido). **Sistema de paginación** del índice: `components/blog/BlogPagination.tsx` (ventana de números + Anterior/Siguiente, acento terracota) + `BlogIndexPage` corta por `PAGE_SIZE=9` leyendo `?page=N` de `searchParams`; página 1 = ruta limpia (canónica). Enlaces del cuerpo del post en terracota (`PortableTextComponents`) | ✅ 2026-07-04 |
| —. **Audit de datos estructurados + cierre del grafo E-E-A-T**: revisión de todo el JSON-LD del sitio y correcciones: (1) `BlogPosting.author` enlaza a la entidad `Person` del autor (mismo `@id` `…/blog/autor/alejandro-castillo#person` que emite `AuthorPage`) + foto; (2) el post recibe **imagen principal** (portada `ranking.png` subida a Sanity vía `seed-post.mjs`) → resuelve el `image` requerido del rich result de Article + og:image + miniatura; (3) `BreadcrumbList` en post/índice/autor (antes solo en secciones); (4) `Organization` con `description` + `founder`→Person. El mismo `@id` de Person aparece en author del post, founder de la org y ProfilePage → Google fusiona una única entidad con `sameAs` (LinkedIn/X/web). Nota: la OG dinámica (`/opengraph-image`) no sirve para JSON-LD (redirige a `/login` sin hash + hash variable por deploy) → usar imágenes de `cdn.sanity.io`. Verificado E2E en prod | ✅ 2026-07-04 |
| —. **6 fixes de navegación/i18n/layout (web pública)**: (1) **«Cómo funciona» pasa de ancla a página propia** indexable `/como-funciona`·`/en/how-it-works` (sección de pasos extraída a `components/sections/HowItWorks.tsx`, reutilizada en home + página; plomería en next.config lookahead + middleware `PUBLIC_SEGMENT_PREFIXES`/`PUBLIC_SEO_PATHS` + sitemap + `nav.ts`). (2) **Selector de idioma desplegable** `components/site/LangSwitcher.tsx` (client): muestra ambos idiomas con bandera, marca el actual; desktop + móvil. (3) **Estado activo del menú** `components/site/MainNav.tsx` (client, `usePathname` + `aria-current`), también en `MobileMenu`. (4) **Breadcrumb alineado al logo** (`mx-auto w-full max-w-6xl px-5 pt-6`) en TODAS: sacado del contenedor estrecho en blog y legales (layout legal simplificado, el `<article>` 720 pasó a las páginas). (5) **Casos** con layout 2 columnas + panel de métricas (100%/≈8h/mes/0). (6) **Tabla de contenidos** en artículos (`lib/blog/toc.ts` + `components/blog/ArticleToc.tsx`; `ptComponents`→factory `makePtComponents(idByKey)` con `id`+`scroll-mt-28`; se muestra con ≥3 encabezados). Verificado E2E en prod. **Nota build**: `app/(admin)/resenas` y `app/(admin)/ajustes` son WIP local **sin rastrear** que rompe `next build` local (conflicto con `(profile)/resenas/verificacion`); no están en git ni en Vercel | ✅ 2026-07-04 |
| —. **Pulido de UI global** (post-6-fixes): estado activo del menú **sin caja** (texto en tinta + peso; acento fino en móvil); **cabecera con fondo gris + blur al hacer scroll** (`components/site/HeaderShell.tsx`, isla client; transparente arriba); **footer reorganizado** (identidad en 2 líneas + menú operativo / línea 1px / menú legal, **sin** selector de idioma); **artículos a 2 columnas** con `<aside>` sticky (tarjeta «Pedir demo» `components/blog/SidebarDemoCta.tsx`) y **TOC plegable** (`<details>`). Revisión móvil (14 páginas públicas, 0 scroll horizontal). Detalle → handoff §23.5 | ✅ 2026-07-04 |
| —. **Rediseño de la home (audit de diseño Hallmark)**: la home se veía «coja». Fixes en `app/page.tsx`: **hero fusionado** (el H1 abre; el panel de stats `100%/0/Día 1` baja a franja de prueba, copy arreglado); **banda de producto real** (captura del dashboard vía `ProductShot`) tras «Cómo funciona»; **franja de confianza** real (APIs oficiales de Google · RGPD · DPA · aislamiento RLS) antes del CTA final, sin logos/testimonios inventados; **acento de marca terracota** `--accent #A84A2A` (token en `globals.css`+`tailwind.config.ts`, uso *restrained*: números del piloto + enlaces; CTAs siguen en tinta); **CTA intermedio**. Pendiente bloqueado por contenido: testimonio nominal + logos. Detalle → handoff §23.6 | ✅ 2026-07-04 |
| —. **Acento terracota extendido a toda la web pública (ES+EN)**: el `--accent` solo se veía en 3 stats + 1 enlace del hero. Nivel «Editorial + CTA»: cursivas serif de titular + números gigantes `01/02/03` (Cómo funciona) en terracota, **CTAs de conversión** a `bg-accent`/`hover:accent-strong` (header, heros, CTA intermedio, `SectionCta`, submit de demo, plan destacado + badge de precios, CTA de blog, páginas de gracias; la cookie se queda neutra por RGPD), bullets decorativos a terracota (los verdes semánticos «Verificada»/éxito se mantienen). Tocados los componentes compartidos (`sections/*`, `SiteHeader`, `LeadForm`, `SidebarDemoCta`) → propaga a todas las subpáginas. **Excepción**: cursivas sobre fondo negro (sección «Problema») siguen en blanco por contraste | ✅ 2026-07-04 |
| —. **Home EN a paridad con la ES**: replicado el rediseño Hallmark completo en `app/en/page.tsx` (hero fusionado con franja de stats de apoyo, banda de producto `ProductShot`, CTA intermedio, franja de confianza de 4 columnas). Orden de secciones idéntico al de `app/page.tsx`. Cierra el pendiente de §8.2 | ✅ 2026-07-04 |
| —. **Blog: 1er artículo ES+EN + sección políticas de Google + autor bilingüe + paginación (2026-07-04/05)**: post ES (`/blog/atribuir-resenas-google-comerciales`) y EN (`/en/blog/attribute-google-reviews-to-sales-reps`, `scripts/seed-post-en.mjs`, categoría EN propia, autor y assets compartidos); **sección de políticas de Google** en ambos con captura del centro de ayuda de Google Maps (pedir reseñas con contenido que identifique a un empleado está prohibido); enlaces del cuerpo en terracota (`PortableTextComponents`). **Página de autor bilingüe**: ruta EN `/en/blog/author/[slug]` (`AuthorPage` ya locale-aware) + autores ES+EN en sitemap. **Paginación**: `components/blog/BlogPagination.tsx` + `BlogIndexPage` corta por `PAGE_SIZE=9` leyendo `?page=N`; página 1 = ruta limpia (canónica) | ✅ 2026-07-05 |
| —. **Auditoría Lighthouse (25 páginas públicas) + fixes (2026-07-05)**: best-practices 100 y SEO 100 en todas las indexables; a11y 100 (tras poner `AttributionAnimation` **estática** — el bucle de opacidad daba falso positivo de contraste). Corregidos: contraste `text-ink-4`→`ink-3` en toda la web + `--ok` #217A3E + iniciales de avatar en tinta; `Stars` `role="img"`; URL del `BrowserFrame` a `aria-hidden`; enlace del cookie banner descriptivo; **legales ES `/terminos`+`/privacidad` a indexables** (heredaban noindex mientras las EN estaban indexadas) con canonical+hreflang; meta-description en `/login`; CTA de precios «Empezar»→«Pedir demo»/«Book a demo». **`/llms.txt`** (público en middleware + fuera del noindex). **`robots.txt`** con permiso explícito a bots de LLMs (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) + sitemap. `browserslist` moderno + `sizes` en el logo (el «JavaScript antiguo» de PSI es de una dependencia prebundleada, sin puntuación, se deja). Detalle → handoff | ✅ 2026-07-05 |
| —. **Texto legal RGPD completo en el formulario de demo (ES+EN)** (`LeadForm.tsx`): responsable Atribuya.com, finalidad, base legal (consentimiento), no cesión, derechos ARCO+ y contacto `alejandro@atribuya.com` (mailto); «política de privacidad» enlazada | ✅ 2026-07-05 |
| —. **Iubenda revertido (2026-07-05)**: se deshizo la integración de Iubenda (commits `aa3204a`/`6b2d2fa`/`146c3d1`/`959ffb4`), restauración temporal del banner propio y **env `NEXT_PUBLIC_IUBENDA_*` eliminadas de Vercel** (3 entornos) + `.env.local`. Sustituido acto seguido por vanilla-cookieconsent (fila siguiente) | ✅ 2026-07-05 |
| —. **Consentimiento → vanilla-cookieconsent (2026-07-05)**: migrado el banner propio a la librería OSS `vanilla-cookieconsent` (orestbida, v3.1.0, MIT, npm, **no embed** → sin el fallo `document.currentScript` que mató a Iubenda, **sin cambios en la CSP**). Cumple RGPD de forma proporcionada: registro versionado en cookie first-party `atribuya_consent` (ID + timestamp + `revision` + categorías = prueba art. 7.1), re-consentimiento al subir `CONSENT_REVISION`, categorías granulares (necessary + analytics), «Rechazar» a igual peso que «Aceptar» (AEPD), modal de preferencias. Config + i18n ES/EN en `lib/cookie-consent-config.ts`; orquestador `components/analytics/Analytics.tsx` arranca `CookieConsent.run()` en páginas públicas y gatea gtag por el callback `onConsent/onChange` (GA solo tras aceptar + solo en prod); `CookiePrefs` (footer «Cookies») → `CookieConsent.showPreferences()`; tema de marca en `globals.css` (`#cc-main` vars). Borrados `CookieBanner.tsx` + `lib/consent.ts`. **Sin log en servidor** (no exigido para analítica). ⚠️ La librería trae `hideFromBots:true` (no muestra el banner a bots/`navigator.webdriver` → Playwright headless no lo ve; spoofear `navigator.webdriver` para testear). Detalle → handoff | ✅ 2026-07-05 |
| —. **Página de Política de Cookies (ES+EN)**: nuevas rutas indexables `/cookies`·`/en/cookies` (`app/(legal)/cookies/` + `app/en/(legal)/cookies/`, mismo template legal que privacidad, con tabla de cookies `atribuya_consent`/sesión/`_ga`, base jurídica, gestión/retirada con `CookiePrefs`, transferencias Google + opt-out). Segunda capa AEPD: el banner y el modal de preferencias enlazan a `/cookies`; footer con enlace «Cookies» (→ política) + botón «Preferencias» (→ modal); Privacidad §8 (ES+EN) enlaza a la política. Alta SEO en los 3 puntos (next.config lookahead + middleware `PUBLIC_SEGMENT_PREFIXES`/`PUBLIC_SEO_PATHS` + sitemap) con canonical+hreflang | ✅ 2026-07-05 |
| —. **Plan de contenidos + lead magnet + 1er artículo del Pilar A (2026-07-05)**: motor de captación para leads/ventas siguiendo el marco de 8 pasos de la guía BIG school (`Plan de contenidos/`, gitignored). **Estrategia** (detalle → handoff §24): keywords de nicho de bajo volumen + head-terms de intención equivocada → apuesta por autoridad temática + long-tail agregado + **GEO** (motores de respuesta) + LinkedIn + lead magnet (fuentes primarias: guía IA de Google + paper GEO KDD 2024 + BrightLocal). **Artículo #1** publicado en Sanity: `/blog/conseguir-resenas-google-equipo-comercial` (`scripts/seed-post-conseguir-resenas.mjs`, categoría nueva «Conseguir reseñas de Google»), optimizado SEO/GEO con cita verbatim verificada de la política de Google + estadística con fuente + FAQ, cover `enlace-qr`. **Lead magnet** «Plantilla de atribución de reseñas» (Excel en `public/recursos/` + página indexable `/recursos/plantilla-atribucion-resenas` con `FAQPage` JSON-LD + captación `submitLeadMagnet`→`leads` `source:lead-magnet:*` + evento GA4 `download_lead_magnet` + entrega Brevo). **Fix JSON-LD** (todos los posts): `publisher` autocontenido + `articleSection`. Pendiente: artículos #2-#12, difusión LinkedIn, marcar `download_lead_magnet` como evento clave en GA4 | ✅ 2026-07-05 |
| —. Google OAuth Business Profile (Vía B) — todas las reseñas | ❌ **RECHAZADA 2026-06-24** por Google: "No approved project" + "The listing ID is associated with a different website". Causa raíz: consent screen sin URLs (homepage/privacidad/términos vacíos) + dominio autorizado `atribuya.com` ≠ web de la ficha GBP de Castillo Cantón (`castillocanton.com`). **Corrección aplicada + RE-SOLICITUD ENVIADA 2026-06-24** (ver §7 + handoff §7.3): (1A) ✅ consent screen alineado con `castillocanton.com` (homepage + `/politica-de-privacidad/` + `/terminos-de-servicio/` + dominio autorizado); (1B) ✅ página de términos creada (`castillocanton.com/terminos-de-servicio/`); (2) ✅ formulario reenviado ("acceso básico a las APIs", proyecto `443155173600`, web `castillocanton.com`). **Esperando aprobación** (indicador: cuota "Requests per minute" de Business Information API; `0`=pendiente, `~300`=ok). ⚠️ Vigilar también el aviso de verificación del GBP de Castillo Cantón. |
| —. **Legales bilingües + email de marca**: creadas `/en/terms` y `/en/privacy` (`app/en/(legal)/`, layout propio EN), traducción de las ES; `Footer`/`LeadForm`/`CookieBanner` enlazan a rutas EN según locale; layout legal ES añade enlace "English"; ambas al `sitemap.ts` con `index:true`. Email de contacto de `/terminos` y `/privacidad` cambiado `@castillocanton.com` → `@atribuya.com` (el DPA sigue con `@castillocanton.com`, ver handoff §7.6) | ✅ 2026-07-01 |
| —. **Auditoría exhaustiva de código + hardening (6 agentes)**: ~17 hallazgos corregidos. **Dinero/matcher**: reasignar/«Es mía»/rechazar/eliminar/restaurar recalculan duplicados (`recomputeClientPrincipal` en `duplicate-detection.ts`, sustituye al muerto `promoteNextPrincipal`) → fin del doble/infra-conteo; menciones con nombre = palabra común filtradas por `STOPWORDS_ES`; `nameSimilarity` de 1 token → `pending`. **Seguridad**: `inviteReviewsManager` exige admin; `/api/sync/now` acotado a la org del llamante (era IDOR cross-tenant); callback OAuth exige admin + ficha de su org (cierra secuestro de conexión — relevante antes de la Vía B); **mig 023** dropa `audit_log_self_insert` (permitía fabricar auditoría). **Correctitud**: rangos/comisión en `Europe/Madrid` (no UTC del runtime); Business Profile descarta rating 0★; email de soporte con `await` (serverless); `excelSafe` uniforme en export; editar asiento no consume cupo; validación misma-org de `location_id`/`sales_id`/`director_id`. **P3**: `.eq(org_id)` defensivo (export/verificación), `server-only` en service.ts, CSRF en signout, prefijos middleware por segmento, Zod en query params, anti-CRLF en cabeceras de email. typecheck+lint+228 tests+build verdes. **Deferidos con motivo** (no romper prod / requieren infra): CSP nonce, rate-limiting de la landing, TOCTOU del tope de asientos. Detalle → handoff | ✅ 2026-07-03 |

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

**Migraciones aplicadas:** 001 → 023. La **023** (`023_fix_audit_log_insert_policy.sql`, 2026-07-03, aplicada por SQL Editor el 2026-07-04) dropa la policy `audit_log_self_insert` de la mig 008, que solo exigía `actor_id = auth.uid()` y dejaba `org_id`/`entity_type`/`entity_id`/`action`/`payload` libres → cualquier usuario autenticado podía FABRICAR entradas de auditoría vía PostgREST. Sin uso real (todos los inserts van por service-role). Nota: la CLI local está autenticada en otra cuenta Supabase y no ve el proyecto de Atribuya, por eso se aplicó por SQL Editor. La 015 (calidad de reseñas + lockdown auto-update) aplicada el 2026-06-06. La **016** (helpdesk de soporte multi-tenant — 3 tablas `support_*` + RLS + `support_unread_count()`) aplicada el 2026-06-06. La **017** (`leads_phone`) aplicada el 2026-06-07. **Portado ReseñaHub → Atribuya (2026-06-08), todas aplicadas:** **018** (`commission_rate` + objetivo por defecto 5 + lockdown congela tarifa), **019** (verificación abierta al comercial: `current_user_location()` + RLS `reviews_unmatched_location_select`/`reviews_sales_claim_update`, org-scoped), **020** (enum `office_director`, aislada), **021** (`director_id` + constraint `role_requires_location` + `current_office_location()` + RLS de director por equipo y org + lockdown congela `director_id`). El número 017 que el plan original reservaba para la caché de rating nunca se creó (descartada). La **022** (2026-06-10, fix de seguridad: `reviews_active` pasa a `security_invoker = true`; antes la vista se saltaba la RLS de `reviews` y era legible con la anon key) aplicada vía `supabase db push --linked`. **Nota historial**: las 015-021 se aplicaron en su día por SQL Editor sin registrarse en el historial remoto; el 2026-06-10 se reparó con `supabase migration repair --status applied 015 ... 021`, así que `migration list`/`db push --linked` vuelven a reflejar la realidad.

**Estado actual de datos (verificado 2026-06-10):**
- `organizations` — 2 filas: Acme Promotora (active) y **AleCris** (trial, org de prueba real). Los seeds sintéticos originales (Beta Apartamentos, etc.) ya no reflejan el estado.
- `locations` — 2 filas: "Acme Promotora — Ficha test" (sin Place ID) y **"Burger King"** (AleCris, con Place ID real, sincronizando por Vía A).
- `reviews` — **5 filas reales** (`source='places_api'`, top-5 de la ficha Burger King). Ya NO está vacía.
- `profiles` — 3 filas. `clients` y `share_links` — vacías.

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
| Vercel | ✅ `atribuya.com` (apex, **dominio canónico/primario**) + `www` 308 → apex + `atribuya.vercel.app`. Hobby, auto-deploy desde `main`. Repo **público** (Hobby bloquea deploys de repos privados). |
| Supabase | ✅ Proyecto `iuiveiznvwjeoyhescmx` (free tier) = prod. Auth Site URL `https://atribuya.com`. Super_admin `a.castillo.esv@gmail.com` (OTP). |
| Email (Brevo SMTP) | ✅ Operativo. Transaccional + Supabase Auth Custom SMTP. From `notificaciones@atribuya.com`, reply-to Gmail. Cuenta Free 300/día compartida con la newsletter de Castillo Cantón. Detalle + gotcha de plantillas Auth → handoff §7.2 / §8.1. |
| Crons | ✅ 2 diarios en `vercel.json` (Places + Business Profile) + horario en `.github/workflows/sync-places-hourly.yml` (secrets `APP_URL`/`CRON_SECRET`). |
| Legal + SEO | ✅ `/terminos`, `/privacidad`, **DPA** (`docs/legal/dpa.{md,docx}`). sitemap + OG 1200×630 + Twitter cards + canonical/hreflang. **Search Console** verificado (TXT en Hostinger) + sitemap enviado. |
| **Analítica (GA4)** | ✅ `G-GKYPWE3QRK`, `NEXT_PUBLIC_GA_ID` en Vercel. Solo páginas públicas/legales (la app interna NO se rastrea), hits solo en prod. **Consentimiento vía vanilla-cookieconsent** (`components/analytics/Analytics.tsx` + `lib/cookie-consent-config.ts`; opt-in RGPD, gtag no carga hasta «Aceptar»; preferencias/retirada desde el footer vía `CookiePrefs` → `showPreferences()`). CSP de `next.config.ts` permite los dominios de Google (la librería es npm, no añade dominios). Evento de conversión **`generate_lead`** en el envío del formulario (`lib/gtag.ts`), marcado como **evento clave** en GA4 el 2026-06-11. Nuevo evento **`download_lead_magnet`** (descarga de la plantilla, 2026-07-05) — **pendiente de marcar como evento clave** en GA4. Vinculado a Search Console. *(Iubenda se probó y se revirtió el 2026-07-05, ver §3.)* |
| **Google Places (Vía A)** | ✅ Proyecto Cloud `atribuya`, Places API **legacy** (no "New"), key restringida, facturación activa, **cuota 500/día + alerta 10 €/mes**. `GOOGLE_PLACES_API_KEY` en `.env.local` + Vercel. Probado E2E (`scripts/find-place.mjs`). Top-5 reseñas recientes por ficha, datos públicos. **Búsqueda de Place integrada en el alta de ficha** (Text Search legacy, `findPlaceCandidates` + asistente; ver §3 / handoff §16): el admin/proveedor busca el negocio y autorrellena el Place ID sin tocar la cuenta de Google del cliente. |
| **Google OAuth (Vía B)** | ⏳ **RE-SOLICITUD ENVIADA 2026-06-24** tras el rechazo del mismo día ("No approved project. The listing ID is associated with a different website"). Causa raíz corregida: consent screen del proyecto `atribuya` ahora alineado con `castillocanton.com` (homepage + `/politica-de-privacidad/` + `/terminos-de-servicio/` + dominio autorizado), página de términos creada, y formulario reenviado ("acceso básico a las APIs", proyecto `443155173600`, web `castillocanton.com`, motivo = lectura de reseñas con OAuth por cliente). **Esperando aprobación de Google** (~7-10 días). Indicador: cuota "Requests per minute" de Business Information API (`0`=pendiente, `~300`=aprobado). ⚠️ Vigilar el aviso de **verificación del GBP** de Castillo Cantón (prereq de Google). Detalle → handoff §7.3. **Tras aprobar**: subir `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` a Vercel + probar OAuth. ⚠️ **Usar el `REDIRECT_URI` SIN www** (`https://atribuya.com/api/google/oauth/callback`). |
| **Blog / CMS (Sanity)** | ✅ Proyecto Sanity `afup27st` (dataset `production` público), creado por API el 2026-07-04. `NEXT_PUBLIC_SANITY_PROJECT_ID`/`NEXT_PUBLIC_SANITY_DATASET` en Vercel (los 3 entornos) + `.env.local`. CORS para `localhost:3000` y `atribuya.com`. Studio en `atribuya.com/studio` (login Google, admin `a.castillo.esv@gmail.com`). Blog `/blog`+`/en/blog`. Panel de gestión: sanity.io/manage/project/afup27st. ⚠️ El login del Studio distingue por proveedor: usar siempre «Continuar con Google». ⚠️ **La lectura pública NO funciona sin token**: el dataset marcado `public` deniega lecturas anónimas por la API, así que la app lee con `SANITY_API_READ_TOKEN` (permiso Viewer, server-only, en Vercel prod+preview como `sensitive` + en `.env.local`). Para crear/editar contenido por API existe `SANITY_API_WRITE_TOKEN` (Editor, solo local) que consume `scripts/seed-post.mjs`. Los `NEXT_PUBLIC_SANITY_*` de Vercel son ahora tipo `plain` (`afup27st`/`production`). |
| Stripe (billing) | ❌ No aplica. Facturación manual hasta cliente #5-8. |

---

## 8. Open questions

Sin resolver hasta que el usuario las decida (decisiones de negocio, no técnicas):

1. ~~**Pricing tiers**~~: **decidido (2026-06-11, v3)**. Modelo **híbrido por nº de comerciales con tope de fichas**: el valor crece con el equipo (casi todo el mercado tiene 1 ficha y varios comerciales), las fichas quedan como segundo eje porque son el coste de API. **3 tiers + a medida**: Básico `basic` hasta 5 comerciales + 1 ficha **45 €/mes** · Estándar `standard` hasta 15 + 3 fichas **99 €/mes** (**destacado**) · Plus `plus` hasta 30 + 10 fichas **199 €/mes** · `custom` a medida. **Los directores ocupan plaza** (productores); cuentan `role in (sales, office_director)` con `status in (invited, active)`, pausar libera. Bloques holgados a propósito: si compensara esconder comerciales, el matcher perdería el roster y la atribución parecería rota. Enforcement a nivel de app (sin migración): `planLocationLimit()`/`planSalesLimit()` en `plans.ts` + `lib/plan-seats.ts`, impuesto en `createLocation`, `inviteSales`, `inviteOfficeDirector` y reactivaciones. Legacy v2 (`starter`/`professional`) conserva su tope de fichas con comerciales ilimitados. Detalle → spec §10.4. *Histórico v2 (2026-06-07): por fichas, 45/149 €, comerciales ilimitados.*
2. ~~**Setup pagado**~~: **decidido (2026-06-07; revisado a 129 € el 2026-06-08)**: **129 € plano** para todas las fichas (filtro de compromiso, no ingreso). Incluye conexión de fichas, alta del equipo, formación y soporte inicial. **Nota (2026-06-07)**: el programa **Cliente Insignia** y la **garantía de 90 días** se han retirado de la landing (ES+EN) y de la FAQ por decisión del usuario; si se vuelven a ofrecer, hay que reañadir esos bloques en `app/page.tsx` / `app/en/page.tsx`.
3. **Billing**: primeros 5-8 clientes facturación manual con Holded. Stripe a partir del cliente 6-8.
4. **Mover rutas autenticadas bajo `/o/[orgSlug]/...`**: deferred en Fase 6. Reevaluar cuando llegue al cliente #5.

*Ya decididas*: nombre **Atribuya**, dominio **atribuya.com**, routing por path-prefix `/o/[orgSlug]/c/...`, **modelo de pricing v3 (por comerciales con tope de fichas, 3 tiers + a medida)**.

### 8.1 Camino crítico al primer cliente (técnico)

En orden: ~~Brevo SMTP~~ (✅ hecho 2026-06-06) → ~~Google Cloud Places (Vía A)~~ (✅ hecho 2026-06-07) → ~~DPA~~ (✅ hecho 2026-06-07, ver fase 8) → **solo queda OAuth Business Profile (Vía B)**: rechazada el 2026-06-24 y **re-solicitud enviada el mismo día** con todo alineado a `castillocanton.com` (consent screen + términos + formulario). **Esperando aprobación de Google** (~7-10 días; indicador = cuota de Business Information API). Ver §7 y handoff §7.3. Lo demás de §8 son decisiones de negocio, no bloqueantes técnicos.

**Gotcha de plantillas de email de Supabase Auth**: las plantillas (Magic Link, Invite, Confirm signup, Recovery) NO deben usar el `{{ .ConfirmationURL }}` de fábrica — ese va por el flujo implícito y deja el token en el `#` de la home sin crear sesión. Tienen que apuntar al handler propio: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=/` (ver `app/auth/confirm/route.ts`, que hace `verifyOtp` server-side). La plantilla Magic Link branded vive versionada en `supabase/email-templates/magic-link.html`. Las invitaciones por código (`lib/invite.ts`) ya construyen ese link bien; el hueco estaba solo en el magic link de auto-login.

### 8.2 Roadmap de features pendientes (del producto base)

Lotes 1 y 2 hechos (Fases 14-15). Pendiente de portar desde el producto base single-tenant (detalle → handoff §7.8):
- ✅ **Portado (2026-06-08)**: comisiones por reseña, rol "director de oficina" (RLS por equipo/org), autoatribución «Es mía» y autovinculación de huérfanas — todo ya en producción (mig 018-021). Ver §3 / handoff.
- **🟡 medio**: suite E2E Playwright. *(Caché de rating por ficha: descartada, innecesaria.)*
- **🟡 pendientes de la revisión por buyer persona (2026-07-04)** — impacto medio, no bloqueantes (detalle → handoff §22):
  - Captura real de la **cola de reseñas dudosas** en `/producto` (pantalla del día a día de Operaciones; requiere screenshot que hoy no existe).
  - **Tabla de roles** en `/precios` (qué ve admin vs comercial vs manager).
  - **DPA descargable** desde `/precios`.
  - Mini **comparativa «Atribuya vs Birdeye vs Excel»** en `/precios` o `/casos`.
  - Cita/testimonio **nominal** en `/casos` cuando se firme el permiso comercial (hoy el caso es anónimo). *(También aplica a la home: falta testimonio + logos reales, bloqueado por contenido.)*
  - ✅ **Primer artículo del blog** publicado el 2026-07-04 (ver §3 / handoff §23.1). **Plan de contenidos + 2º artículo (Pilar A) + lead magnet** hechos el 2026-07-05 (ver §3 / handoff §24). Pendiente: artículos **#2-#12** del backlog (validar keywords + clusters long-tail antes de escribir), difusión LinkedIn.
  - ✅ **Replicar en EN el rediseño de la home** (hecho 2026-07-04; `app/en/page.tsx` a paridad con la ES). Terracota extendido a toda la web pública (ES+EN) en la misma sesión.
- ✅ **Helpdesk (2026-06-10)**: badge de no-leídos en el sidebar (`getSupportUnreadCount()` en los 4 layouts) + acceso a Soporte en mobile (tab en `MobileTabBar`). Hecho.
- **Capturas `public/help/*.png`**: 8/9 hechas. 02-09 vía `scripts/capture-help.py` (modo demo + Playwright); **06 (diagrama de flujo)** generado el 2026-06-10 con `scripts/capture-help-06.py` (renderiza `scripts/help-06-diagram.html`, paleta/fuentes de marca, captura a 2x). Pendiente solo **01 (email magic link)** — captura real de bandeja, a mano.

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
