import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database, Role } from "./types";
import { isSupabaseConfigured } from "./config";
import { isSafeNext } from "../url-validation";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard",
  sales: "/panel",
  reviews_manager: "/dashboard",
  office_director: "/dashboard",
};

/** Where to send a super_admin after login or when hitting `/`. */
const SUPER_ADMIN_HOME = "/super";

// Bots, crawlers y link-previewers. Reciben 403 incluso en rutas públicas
// (login, /c/..., legales). Capa adicional sobre X-Robots-Tag — aquel evita
// que indexen, esto evita que hagan fetch siquiera.
//
// El check va ANTES de isPublicPath para que cubra TODA la app. Email
// scanners (Microsoft Safe Links, etc.) NO incluyen "bot" en su UA, así que
// el HEAD a /auth/confirm sigue funcionando (§4.9 del CLAUDE.md). Vercel
// Cron usa "vercel-cron/1.0" → tampoco matchea.
const BLOCKED_UA_KEYWORDS = [
  // Detectores genéricos
  "bot", "crawler", "spider", "scraper", "crawling",
  // Buscadores principales
  "googlebot", "bingbot", "baidu", "yandex", "duckduckgo",
  // Previewers sociales / mensajería
  "facebookexternalhit", "facebot", "twitterbot", "linkedinbot",
  "slackbot", "whatsapp", "telegrambot", "discordbot",
  // Apple
  "applebot",
  // LLM / AI crawlers
  "gptbot", "ccbot", "claudebot", "claude-web", "anthropic-ai",
  "perplexitybot", "chatgpt-user", "google-extended", "amazonbot",
  // SEO / scrapers misc.
  "bytespider", "petalbot", "ahrefsbot", "semrushbot",
  "mj12bot", "dotbot",
];

function isBlockedBot(ua: string | null): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BLOCKED_UA_KEYWORDS.some((k) => lower.includes(k));
}

// Routes accessible without an authenticated session.
//  - /login            sign-in page
//  - /accept-invite    initial onboarding from emailed invite
//  - /c/               public landing for the client (redirects to Google)
//  - /auth/            magic-link callback + signout (anyone, by design)
//  - /api/cron/        cron endpoints (self-authenticated via CRON_SECRET)
//  - /api/google/oauth/callback  OAuth return from Google Business Profile
//  - /privacidad, /terminos  legal pages linked from OAuth consent
//  - /gracias          confirmación tras enviar el formulario de la landing
//  - /_next, /favicon  framework + static assets
// Prefijos de PÁGINAS/rutas públicas que hacen match por LÍMITE DE SEGMENTO
// (pathname === p || empieza por `p + "/"`). Así `/login` no abre `/loginX` ni
// `/terminos` abre `/terminos-falso` — el `startsWith` laxo anterior sí lo haría.
const PUBLIC_SEGMENT_PREFIXES = [
  "/login",
  "/accept-invite",
  "/auth",
  "/api/cron",
  "/api/google/oauth/callback",
  "/privacidad",
  "/terminos",
  "/cookies",
  "/gracias",
  "/en",
  "/blog",
  // Páginas de sección de marketing (la home se partió en URLs propias).
  "/producto",
  "/precios",
  "/casos",
  "/demo",
  "/como-funciona",
  // Recursos descargables (lead magnets): páginas de conversión públicas.
  "/recursos",
  // El Studio de Sanity gestiona su propio login (cuenta Sanity, no Supabase).
  "/studio",
];

// Assets y ficheros de crawl: match por prefijo crudo (p. ej. `/favicon.ico`,
// `/_next/static/...`). No son superficie sensible.
const PUBLIC_ASSET_PREFIXES = ["/_next", "/favicon"];
const PUBLIC_EXACT_PATHS = new Set<string>(["/robots.txt", "/sitemap.xml", "/llms.txt"]);

// Public pages que SÍ queremos que Google / Slack / LinkedIn / etc. puedan
// indexar y previsualizar. La landing comercial, las páginas legales y los
// metadatos de crawl son los únicos puntos del producto que están abiertos
// al mundo; el resto sigue bloqueado a bots por el filtro de User-Agent.
const PUBLIC_SEO_PATHS = new Set<string>([
  "/",
  "/en",
  "/terminos",
  "/privacidad",
  "/cookies",
  "/en/terms",
  "/en/privacy",
  "/en/cookies",
  // Páginas de sección de marketing (indexables por bots).
  "/producto",
  "/precios",
  "/casos",
  "/demo",
  "/como-funciona",
  "/en/product",
  "/en/pricing",
  "/en/case-studies",
  "/en/demo",
  "/en/how-it-works",
  "/robots.txt",
  "/sitemap.xml",
]);

// Rutas SEO con subrutas dinámicas (posts del blog): match por límite de
// segmento. `/studio` queda fuera a propósito: los bots reciben 403 ahí.
const PUBLIC_SEO_PREFIXES = ["/blog", "/en/blog"];

function isPublicSeoPath(pathname: string): boolean {
  if (PUBLIC_SEO_PATHS.has(pathname)) return true;
  return PUBLIC_SEO_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * The public landing for the customer flow lives at
 * `/o/[orgSlug]/c/[salesSlug][/clientSlug]`. We match anything under
 * `/o/<slug>/c/` so the visitor (no session, no cookies) is let through
 * the auth check. The route handler itself enforces tenant resolution
 * via `recordOpenAndRedirect`. Phase 6 migrated this from the old
 * tenant-less `/c/...` path.
 */
const PUBLIC_LANDING_REGEX = /^\/o\/[^/]+\/c(\/|$)/;

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_LANDING_REGEX.test(pathname)) return true;
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  if (PUBLIC_ASSET_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return PUBLIC_SEGMENT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// Allowlist of route prefixes per role. Keep this explicit — do NOT use a
// blanket `/api` match because future API routes default to NO access.
function pathAllowedForRole(
  pathname: string,
  role: Role,
  isSuperAdmin: boolean,
): boolean {
  // Super-admins are the SaaS operators, not org members. They're confined
  // to /super (+ /perfil and /ayuda). Their `role` field in profiles is
  // typically "admin" with NULL org_id, but that doesn't grant them access
  // to the org-scoped routes — RLS would filter to empty anyway and that
  // looks broken in the UI.
  if (isSuperAdmin) {
    if (pathname === "/super" || pathname.startsWith("/super/")) return true;
    if (pathname === "/perfil" || pathname.startsWith("/perfil/")) return true;
    if (pathname === "/ayuda" || pathname.startsWith("/ayuda/")) return true;
    return false;
  }
  // Regular org-scoped routes — never accessible to super_admins.
  if (pathname === "/super" || pathname.startsWith("/super/")) return false;
  // /perfil y /ayuda son accesibles a todos los roles. Perfil para foto +
  // datos personales; ayuda para el manual de uso (sales, admin, manager).
  if (pathname === "/perfil" || pathname.startsWith("/perfil/")) return true;
  if (pathname === "/ayuda" || pathname.startsWith("/ayuda/")) return true;
  // Helpdesk interno — accesible a los tres roles de org (no super_admin).
  if (pathname === "/soporte" || pathname.startsWith("/soporte/")) return true;
  if (role === "admin") return true;
  if (role === "office_director") {
    // Dual: productor (su panel/enlace/clientes/reseñas) + gestor de su equipo
    // (dashboard, comerciales, ranking, su ficha, verificación). RLS (mig 021)
    // lo limita a su equipo y su org. NO accede a /gestores ni /directores.
    return (
      pathname === "/dashboard" ||
      pathname.startsWith("/panel") ||
      pathname.startsWith("/clientes") ||
      pathname.startsWith("/comerciales") ||
      pathname.startsWith("/ranking") ||
      pathname.startsWith("/fichas") ||
      pathname.startsWith("/resenas/verificacion") ||
      pathname === "/manager/export" ||
      pathname.startsWith("/api/export") ||
      pathname.startsWith("/api/google/oauth")
    );
  }
  if (role === "sales") {
    return (
      pathname.startsWith("/panel") ||
      pathname.startsWith("/clientes") ||
      // Bandeja de huérfanas de su ficha: ver y reclamar ("Es mía", mig 019).
      pathname.startsWith("/resenas/verificacion") ||
      // Autoservicio de su propio Excel; el endpoint valida que salesId = self.
      pathname.startsWith("/api/export/sales")
    );
  }
  if (role === "reviews_manager") {
    // El gestor comparte vistas con el admin (Dashboard + comerciales) y
    // tiene plenos permisos de administración sobre el rol `sales` (migración
    // 005): invitar, editar, reenviar acceso, eliminar. Lo que sigue siendo
    // solo-admin: /gestores, /fichas, /resenas/verificacion.
    // /manager/* aloja los listados read-only del propio gestor (lista global
    // de reseñas, exportar Excel).
    return (
      pathname === "/dashboard" ||
      pathname.startsWith("/comerciales") ||
      pathname.startsWith("/ranking") ||
      pathname.startsWith("/manager") ||
      pathname.startsWith("/api/export")
    );
  }
  return false;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Block bots/crawlers en toda la app EXCEPTO la landing comercial, las
  // páginas legales y el blog. Esas sí deben poder ser indexadas y
  // previsualizadas por Google, Slack, LinkedIn, etc. Las rutas de producto
  // (dashboard, panel, /o/.../c/..., /studio) siguen prohibidas a bots.
  if (
    isBlockedBot(request.headers.get("user-agent")) &&
    !isPublicSeoPath(pathname)
  ) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  let response = NextResponse.next({ request });

  // Demo mode: Supabase not yet connected. Let every request through so the
  // user can navigate the UI before configuring env vars.
  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicPath(pathname)) {
    return response;
  }

  if (!user) {
    // Landing comercial: visitantes anónimos en `/` ven la landing.
    // (Los autenticados caen abajo y son redirigidos a su role-home.)
    if (pathname === "/") {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Only echo `next` back to the login page if it's safe; otherwise drop it.
    if (isSafeNext(pathname)) {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  const [profileRes, superRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, org_id")
      .eq("id", user.id)
      .maybeSingle<{ role: Role; org_id: string | null }>(),
    supabase
      .from("super_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle<{ user_id: string }>(),
  ]);

  const role = profileRes.data?.role ?? null;
  const orgId = profileRes.data?.org_id ?? null;
  const isSuperAdmin = superRes.data !== null;

  if (!role) {
    // Authenticated but no profile yet — send to invite acceptance.
    if (!pathname.startsWith("/accept-invite")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "no-profile");
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Multi-tenant invariant: every authenticated user must either belong to
  // an org (org_id non-null) or be a super_admin. If neither, RLS would make
  // every query return zero rows and the UI would silently break — fail loud
  // by bouncing them back to login.
  if (!orgId && !isSuperAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "no-org");
    return NextResponse.redirect(url);
  }

  const homePath = isSuperAdmin ? SUPER_ADMIN_HOME : ROLE_HOME[role];

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = homePath;
    return NextResponse.redirect(url);
  }

  if (!pathAllowedForRole(pathname, role, isSuperAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = homePath;
    return NextResponse.redirect(url);
  }

  return response;
}
