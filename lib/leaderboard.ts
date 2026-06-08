import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { TEAM } from "@/lib/demo-data";

/**
 * Helper compartido del leaderboard de comerciales (rol `sales`).
 *
 * Portado del producto base single-tenant y adaptado a multi-tenant:
 *   - El ranking es por org. Para admin/gestor es global de la org; para un
 *     office_director la RLS (mig 021) lo scopea automáticamente a SU equipo.
 *   - Todas las queries filtran por `org_id` (derivado del servidor vía
 *     `requireOrgContext`, NUNCA del cliente) — defensa en profundidad sobre RLS.
 *
 * Dos APIs:
 *   - `computeLeaderboard(...)`: función PURA que recibe los datos ya cargados
 *     y devuelve las filas ordenadas. La consume el dashboard, que ya tiene
 *     `sales`, `locations`, `shares` y `reviews` cargados para otros KPIs.
 *   - `getLeaderboard({ orgId, ... })`: hace su propia query (mínima) y llama a
 *     `computeLeaderboard`. La consumen `/ranking` (admin) y `/panel/ranking` (sales).
 *
 * El sort es estable: métrica DESC, full_name ASC (orden determinista en tests
 * para comerciales con 0 reseñas). `visits` se calcula como dato interno
 * (compatibilidad), pero NO se usa para ordenar.
 */

export type LeaderboardSales = {
  id: string;
  full_name: string;
  slug: string;
  status: string;
  monthly_goal: number;
  location_id: string | null;
  role: string;
  /** Foto de perfil; opcional para no romper fixtures de tests. */
  avatar_url?: string | null;
};

export type LeaderboardLocation = {
  id: string;
  name: string;
};

export type LeaderboardShare = {
  sales_id: string;
};

export type LeaderboardReview = {
  sales_id: string | null;
  match_state: string;
};

export type LeaderboardRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  branch: string;
  /** visits/conv se calculan por compatibilidad pero NO se muestran en ninguna
   *  pantalla (las visitas dejaron de ser KPI accionable). Se conservan por si
   *  se reactivan. */
  visits: number;
  reviews: number;
  counted: number;
  /** Conversión visitas → reseñas, 0..100 (entero). Ver nota de `visits`. */
  conv: number;
  goal: number;
  /** True si la fila es un office_director. Los directores quedan FUERA del
   *  ranking agregado y del dashboard (gestionan, no compiten: ver el filtro
   *  role='sales' en getLeaderboard), pero el campo se mantiene para vistas que
   *  sí listan directores y para el badge "★ Director" de las cards. */
  isDirector: boolean;
  /** Foto de perfil del comercial (o null → la card pinta iniciales). */
  avatarUrl: string | null;
  /** Marca la fila del usuario actual (rol sales viendo /panel/ranking). */
  isSelf: boolean;
};

export function computeLeaderboard(args: {
  sales: LeaderboardSales[];
  locations: LeaderboardLocation[];
  shares: LeaderboardShare[];
  reviews: LeaderboardReview[];
  /** Si se pasa, la fila con `id === currentUserId` se marca con `isSelf: true`. */
  currentUserId?: string;
  /**
   * Métrica de ordenación:
   *   - "reviews" (default): por reseñas atribuidas no-duplicadas (uso admin).
   *   - "counted": por reseñas VERIFICADAS (abonables). Lo usa el panel del
   *     comercial para que la posición/"Líder" sea coherente con la comisión.
   */
  metric?: "reviews" | "counted";
}): LeaderboardRow[] {
  const { sales, locations, shares, reviews, currentUserId, metric = "reviews" } = args;

  // Índice por id para evitar O(n·m) con locations.find dentro del map.
  const locationById = new Map<string, LeaderboardLocation>();
  for (const l of locations) locationById.set(l.id, l);

  const sharesBySales = new Map<string, number>();
  for (const s of shares) {
    sharesBySales.set(s.sales_id, (sharesBySales.get(s.sales_id) ?? 0) + 1);
  }

  const reviewsBySales = new Map<string, number>();
  const reviewsCountedBySales = new Map<string, number>();
  for (const r of reviews) {
    if (!r.sales_id) continue;
    reviewsBySales.set(r.sales_id, (reviewsBySales.get(r.sales_id) ?? 0) + 1);
    if (r.match_state === "counted") {
      reviewsCountedBySales.set(
        r.sales_id,
        (reviewsCountedBySales.get(r.sales_id) ?? 0) + 1,
      );
    }
  }

  return sales
    .map((s) => {
      const location = s.location_id ? locationById.get(s.location_id) : undefined;
      const visits = sharesBySales.get(s.id) ?? 0;
      const reviewsN = reviewsBySales.get(s.id) ?? 0;
      const counted = reviewsCountedBySales.get(s.id) ?? 0;
      const conv = visits > 0 ? Math.round((reviewsN / visits) * 100) : 0;
      return {
        id: s.id,
        slug: s.slug,
        name: s.full_name,
        status: s.status,
        branch: location?.name ?? "—",
        visits,
        reviews: reviewsN,
        counted,
        conv,
        goal: s.monthly_goal,
        isDirector: s.role === "office_director",
        avatarUrl: s.avatar_url ?? null,
        isSelf: currentUserId !== undefined && s.id === currentUserId,
      };
    })
    .sort(
      (a, b) =>
        (metric === "counted" ? b.counted - a.counted : b.reviews - a.reviews) ||
        a.name.localeCompare(b.name, "es"),
    );
}

/**
 * Versión server-only que hace la query mínima y devuelve el leaderboard
 * GLOBAL de la org para un rango temporal dado (ISO inclusivo-exclusivo).
 *
 * `orgId` es OBLIGATORIO y debe derivarse del servidor (`requireOrgContext`),
 * nunca de un query-param del cliente. Se aplica explícitamente en las 4 queries
 * además de la RLS (defensa en profundidad: un comercial de la org A jamás ve
 * el ranking de la org B).
 *
 * `privileged`: el rol `sales` no puede leer los perfiles/reseñas de sus
 * compañeros vía RLS (solo se ve a sí mismo). Para el ranking org-global del
 * panel del comercial pasamos `privileged: true` → usa service-role filtrado
 * por `org_id`. Admin/manager pueden leer toda su org vía RLS, así que usan el
 * cliente autenticado (`privileged: false`, por defecto).
 */
export async function getLeaderboard(opts: {
  orgId: string;
  startIso: string;
  endIso: string;
  currentUserId?: string;
  /** Métrica de orden — ver computeLeaderboard. Default "reviews". */
  metric?: "reviews" | "counted";
  privileged?: boolean;
}): Promise<LeaderboardRow[]> {
  // Ambos clientes exponen la misma API de query (`SupabaseClient<Database>`);
  // la anotación evita que el tipo unión rompa los overloads de `.from`.
  const db: Awaited<ReturnType<typeof createClient>> = opts.privileged
    ? (createServiceClient() as unknown as Awaited<ReturnType<typeof createClient>>)
    : await createClient();

  const [salesRes, locationsRes, sharesRes, reviewsRes] = await Promise.all([
    db
      .from("profiles")
      .select("id, full_name, slug, status, monthly_goal, location_id, role, avatar_url")
      .eq("org_id", opts.orgId)
      // Solo comerciales: los office_director gestionan equipos, no compiten en
      // el ranking ni cuentan en los KPIs del dashboard. Decisión deliberada.
      .eq("role", "sales")
      .returns<LeaderboardSales[]>(),
    db
      .from("locations")
      .select("id, name")
      .eq("org_id", opts.orgId)
      .returns<LeaderboardLocation[]>(),
    db
      .from("share_links")
      .select("sales_id")
      .eq("org_id", opts.orgId)
      .gte("opened_at", opts.startIso)
      .lt("opened_at", opts.endIso)
      .returns<LeaderboardShare[]>(),
    db
      .from("reviews")
      .select("sales_id, match_state")
      .eq("org_id", opts.orgId)
      .is("removed_at", null)
      .eq("is_duplicate", false)
      .gte("google_created_at", opts.startIso)
      .lt("google_created_at", opts.endIso)
      .returns<LeaderboardReview[]>(),
  ]);

  return computeLeaderboard({
    sales: salesRes.data ?? [],
    locations: locationsRes.data ?? [],
    shares: sharesRes.data ?? [],
    reviews: reviewsRes.data ?? [],
    currentUserId: opts.currentUserId,
    metric: opts.metric,
  });
}

/**
 * Filas de ejemplo para el modo demo (sin Supabase configurado). Derivadas del
 * `TEAM` de `lib/demo-data.ts` para que `/ranking`, `/panel/ranking` y el panel
 * se vean poblados al arrancar la app sin BD ni login. `selfName` marca la fila
 * propia (highlight "Tú" en la vista del comercial).
 */
export function demoLeaderboardRows(selfName?: string): LeaderboardRow[] {
  return TEAM.map((p) => ({
    id: String(p.id),
    slug: p.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    name: p.name,
    status: p.status ?? "active",
    branch: p.branch,
    visits: p.sent,
    reviews: p.reviews,
    counted: p.reviews,
    conv: p.sent > 0 ? Math.round((p.reviews / p.sent) * 100) : 0,
    goal: p.goal,
    isDirector: false,
    avatarUrl: null,
    isSelf: selfName !== undefined && p.name === selfName,
  })).sort((a, b) => b.reviews - a.reviews || a.name.localeCompare(b.name, "es"));
}
