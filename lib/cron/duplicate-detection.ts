import "server-only";
import type { createServiceClient } from "@/lib/supabase/service";

/**
 * Helpers de la lógica anti-fraude del marcado de duplicados por `client_id`
 * (migración 015). La principal por cada cliente = la de google_created_at
 * más antiguo. Las demás → is_duplicate=true. Las queries de KPIs/Excel
 * filtran `is_duplicate = false` para no contar duplicadas en métricas
 * pagables al comercial.
 *
 * Se invoca desde `lib/cron/process-reviews.ts` justo antes del INSERT de
 * cada reseña. Usa el service-client (admin) para sortear RLS de reviews y
 * poder mirar el conjunto entero por client_id (que ya está aislado por org,
 * porque un client_id pertenece a una sola organización).
 */

type ServiceClient = ReturnType<typeof createServiceClient>;

export type DuplicateDecision = {
  /** Valor de `is_duplicate` con el que la nueva reseña debe quedar. */
  newIsDuplicate: boolean;
  /** Si no es null, esa reseña vieja debe pasar a is_duplicate=true porque
   *  la nueva es cronológicamente más antigua e invierte la principal. */
  demotedReviewId: string | null;
};

/**
 * Función PURA — decide la marca de duplicado de una reseña entrante dada
 * la lista de principales activas (is_duplicate=false, removed_at IS NULL)
 * que comparten su mismo `client_id`.
 *
 * Se separa para tener tests unitarios sin mockear Supabase. La consulta
 * a BD vive en `decideDuplicateForClient`.
 */
export function decideFromPrincipals(
  principals: { id: string; google_created_at: string }[],
  incomingGoogleCreatedAt: string,
): DuplicateDecision {
  if (principals.length === 0) {
    return { newIsDuplicate: false, demotedReviewId: null };
  }
  // Aunque en el caso ideal solo hay 1 principal activa por client_id, si
  // hubiera varias (estado inconsistente) comparamos contra la más antigua.
  const oldest = principals.reduce((min, r) =>
    new Date(r.google_created_at).getTime() <
    new Date(min.google_created_at).getTime()
      ? r
      : min,
  );
  const incomingMs = new Date(incomingGoogleCreatedAt).getTime();
  const oldestMs = new Date(oldest.google_created_at).getTime();
  if (incomingMs >= oldestMs) {
    return { newIsDuplicate: true, demotedReviewId: null };
  }
  return { newIsDuplicate: false, demotedReviewId: oldest.id };
}

/**
 * Decide si una reseña que va a insertarse (o reasignarse a un client) debe
 * marcarse duplicada, y si hay que demotar a una principal previa.
 *
 * @param admin service-client
 * @param args.clientId el client_id de la reseña entrante
 * @param args.orgId org del cliente — filtro OBLIGATORIO: service-client salta
 *        RLS, así que un client_id mal-vinculado (p. ej. de otra org) no debe
 *        poder arrastrar reseñas de esa org al conjunto (regla §4 / MEMORY).
 * @param args.incomingGoogleCreatedAt ISO timestamp de la reseña entrante
 * @param args.excludeReviewId opcional — id de la reseña entrante si ya existe
 *        en BD (caso confirm/reassign que UPDATE-an y no deben contarse a sí
 *        mismas como principal previa).
 */
export async function decideDuplicateForClient(
  admin: ServiceClient,
  args: {
    clientId: string;
    orgId: string;
    incomingGoogleCreatedAt: string;
    excludeReviewId?: string;
  },
): Promise<DuplicateDecision> {
  let q = admin
    .from("reviews")
    .select("id, google_created_at")
    .eq("client_id", args.clientId)
    .eq("org_id", args.orgId)
    .eq("is_duplicate", false)
    .is("removed_at", null);
  if (args.excludeReviewId) {
    q = q.neq("id", args.excludeReviewId);
  }
  const { data: principals } = await q.returns<
    { id: string; google_created_at: string }[]
  >();

  return decideFromPrincipals(principals ?? [], args.incomingGoogleCreatedAt);
}

/**
 * Función PURA — dada la lista de reseñas ACTIVAS (removed_at IS NULL) de un
 * mismo client_id, devuelve el id de la que debe ser principal: la de
 * `google_created_at` más antiguo. Empates deterministas por `fetched_at` y
 * luego `id` (nulls al final). Devuelve null si la lista está vacía.
 */
export function pickPrincipalId(
  rows: { id: string; google_created_at: string; fetched_at?: string | null }[],
): string | null {
  if (rows.length === 0) return null;
  const key = (v: string | null | undefined) =>
    v ? new Date(v).getTime() : Number.POSITIVE_INFINITY;
  const winner = rows.reduce((best, r) => {
    const rc = key(r.google_created_at);
    const bc = key(best.google_created_at);
    if (rc !== bc) return rc < bc ? r : best;
    const rf = key(r.fetched_at);
    const bf = key(best.fetched_at);
    if (rf !== bf) return rf < bf ? r : best;
    return r.id < best.id ? r : best;
  });
  return winner.id;
}

/**
 * Recalcula desde cero la marca de duplicado de TODAS las reseñas activas
 * (removed_at IS NULL) de un client_id: la más antigua queda principal
 * (is_duplicate=false) y el resto duplicadas (is_duplicate=true). Idempotente.
 *
 * A diferencia de `decideDuplicateForClient` (decisión incremental para el
 * INSERT del cron y el vínculo de huérfanas), este helper recalcula el
 * conjunto entero. Se usa en los caminos MANUALES de baja frecuencia
 * (reasignar, reclamar «Es mía», rechazar, marcar/restaurar eliminada), donde
 * una reseña puede entrar o salir del cliente y hay que reasentar la principal
 * sin arrastrar el estado previo. Service-client: mira todas las reseñas del
 * cliente saltando RLS. `orgId` es OBLIGATORIO y filtra todas las queries: sin
 * él, un client_id mal-vinculado (input del cliente en el claim) podría tocar
 * `is_duplicate` de reseñas de OTRA org (regla §4 / MEMORY: service-role
 * siempre re-filtra org_id).
 */
export async function recomputeClientPrincipal(
  admin: ServiceClient,
  clientId: string,
  orgId: string,
): Promise<void> {
  const { data: rows } = await admin
    .from("reviews")
    .select("id, google_created_at, fetched_at")
    .eq("client_id", clientId)
    .eq("org_id", orgId)
    .is("removed_at", null)
    .returns<
      { id: string; google_created_at: string; fetched_at: string | null }[]
    >();

  const list = rows ?? [];
  const principalId = pickPrincipalId(list);
  if (!principalId) return; // el cliente no tiene reseñas activas en esta org

  const { error: pErr } = await admin
    .from("reviews")
    .update({ is_duplicate: false } as never)
    .eq("id", principalId)
    .eq("org_id", orgId);
  if (pErr) {
    console.error("[duplicate-detection] recompute principal failed:", pErr);
  }

  const dupIds = list.filter((r) => r.id !== principalId).map((r) => r.id);
  if (dupIds.length > 0) {
    const { error: dErr } = await admin
      .from("reviews")
      .update({ is_duplicate: true } as never)
      .in("id", dupIds)
      .eq("org_id", orgId);
    if (dErr) {
      console.error("[duplicate-detection] recompute duplicates failed:", dErr);
    }
  }
}
