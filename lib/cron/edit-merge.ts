/**
 * Lógica pura de "fusión por autor" — detecta cuándo una reseña fresca es en
 * realidad una EDICIÓN de una reseña que ya tenemos, no una nueva.
 *
 * Contexto: Google permite **una sola reseña por persona y negocio**. El sync
 * vía Places API legacy no recibe un `reviewId` estable, así que sintetizamos
 * `google_review_id = places:{place_id}_{unix_time}_{md5_8(autor)}`. Cuando el
 * autor EDITA su reseña (p.ej. 1★→5★), Google cambia el timestamp → cambia el
 * id sintético → el cron la trataría como NUEVA e insertaría una fila fantasma
 * (que luego el anti-fraude mig 015 marca como duplicada, dejando la vieja como
 * principal). Para evitarlo: si llega una reseña de un autor (no anónimo) que YA
 * existe en esa ficha, es la misma reseña editada → actualizamos la fila
 * existente en vez de insertar.
 *
 * Este módulo es SIN I/O (la query de incumbentes y el UPDATE viven en
 * `process-reviews.ts`); solo decide. Igual separación que
 * `duplicate-detection.ts::decideFromPrincipals`.
 */

import { isLowRating } from "@/lib/cron/low-rating-alerts";

/** Datos mínimos de una reseña existente del mismo autor+ficha. */
export type IncumbentLite = {
  id: string;
  rating: number;
  removed_at: string | null;
  low_rating_alerted_at: string | null;
};

export type EditMergeDecision =
  | { action: "insert" }
  | {
      action: "merge";
      incumbentId: string;
      /** El incumbente estaba soft-deleted y la edición lo "revive". */
      clearRemovedAt: boolean;
      /** La edición baja el rating a ≤2★ por primera vez → re-alertar. */
      reAlertLowRating: boolean;
    };

/**
 * Decide si una reseña fresca debe FUSIONARSE con un incumbente (misma
 * persona, misma ficha → misma reseña editada) o insertarse como nueva.
 *
 *   - Autor anónimo → siempre insert (no se puede identificar a la persona).
 *   - 0 incumbentes → insert (es genuinamente nueva).
 *   - ≥2 incumbentes → insert (ambigüedad legacy; no adivinamos a cuál fusionar.
 *     Tras la limpieza one-shot el estado estable es ≤1 incumbente por autor).
 *   - exactamente 1 → merge.
 *
 * `reAlertLowRating` solo es true si el rating ENTRANTE es bajo, el del
 * incumbente NO lo era, y aún no se había alertado (evita spam al editar entre
 * ratings ya bajos o re-alertar lo ya alertado).
 */
export function decideEditMerge(p: {
  hasAuthorName: boolean;
  incumbents: IncumbentLite[];
  incomingRating: number;
}): EditMergeDecision {
  if (!p.hasAuthorName) return { action: "insert" };
  if (p.incumbents.length !== 1) return { action: "insert" };
  const [inc] = p.incumbents;
  if (!inc) return { action: "insert" };

  const clearRemovedAt = inc.removed_at !== null;
  const reAlertLowRating =
    isLowRating(p.incomingRating) &&
    !isLowRating(inc.rating) &&
    inc.low_rating_alerted_at === null;

  return { action: "merge", incumbentId: inc.id, clearRemovedAt, reAlertLowRating };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reclamo cross-fuente (transición Vía A → Vía B)
//
// Cuando una ficha que sincronizaba por Places API conecta OAuth, el cron de
// Business Profile trae TODAS las reseñas con su reviewId REAL. Las que ya
// habíamos importado por Places viven en DB con id sintético `places:%`, así
// que el dedup por google_review_id no las reconoce → duplicado. La reseña es
// LA MISMA entidad, de modo que en vez de insertar+borrar, la fila de Places
// se RECLAMA: se actualiza en el sitio con el id real y source nueva,
// conservando id de fila, atribución, comisión, sello de alerta y auditoría.
// ─────────────────────────────────────────────────────────────────────────────

/** Fila `places:%` candidata a ser reclamada por su gemela de Business Profile. */
export type PlacesIncumbent = IncumbentLite & {
  author_name: string;
  hasAuthorName: boolean;
  google_created_at: string;
};

export type CrossSourceDecision =
  | { action: "insert" }
  | {
      action: "claim";
      incumbentId: string;
      clearRemovedAt: boolean;
      reAlertLowRating: boolean;
    };

/**
 * Tolerancia para emparejar reseñas ANÓNIMAS por instante de publicación.
 * Places (`time`, unix) y Business Profile (`createTime`/`updateTime`, ISO)
 * describen el mismo momento; el margen absorbe redondeos de formato.
 */
export const ANON_CLAIM_TOLERANCE_MS = 10 * 60_000;

/**
 * Decide si una reseña fresca de Business Profile debe RECLAMAR una fila
 * `places:%` existente (misma reseña importada antes por Vía A) o insertarse.
 *
 *   - Autor con nombre → gemela = incumbente `places:%` del MISMO autor
 *     (Google permite una reseña por persona y negocio). Exactamente 1 → claim.
 *     El rating y la fecha pueden diferir (edición entre syncs): sigue siendo
 *     la misma reseña.
 *   - Autor anónimo → el nombre no identifica, pero la transición no es una
 *     edición: gemela = incumbente anónimo con MISMO rating y timestamp a
 *     ≤ ANON_CLAIM_TOLERANCE_MS de createTime o updateTime. Exactamente 1 → claim.
 *   - Ambigüedad (0 o ≥2 candidatas) → insert; la fila `places:%` sobrante la
 *     resuelve el barrido posterior (sweepPlacesLeftovers) con política
 *     conservadora.
 *
 * Sin I/O; el caller pasa las incumbentes aún no reclamadas en este run.
 */
export function decideCrossSourceClaim(p: {
  hasAuthorName: boolean;
  authorName: string;
  incomingRating: number;
  incomingCreatedAt: string;
  incomingUpdatedAt?: string | null;
  incumbents: PlacesIncumbent[];
}): CrossSourceDecision {
  let candidates: PlacesIncumbent[];

  if (p.hasAuthorName) {
    candidates = p.incumbents.filter(
      (inc) => inc.hasAuthorName && inc.author_name === p.authorName,
    );
  } else {
    const incomingTimes = [p.incomingCreatedAt, p.incomingUpdatedAt]
      .filter((t): t is string => Boolean(t))
      .map((t) => new Date(t).getTime())
      .filter((ms) => !Number.isNaN(ms));
    candidates = p.incumbents.filter((inc) => {
      if (inc.hasAuthorName || inc.rating !== p.incomingRating) return false;
      const incMs = new Date(inc.google_created_at).getTime();
      if (Number.isNaN(incMs)) return false;
      return incomingTimes.some(
        (ms) => Math.abs(ms - incMs) <= ANON_CLAIM_TOLERANCE_MS,
      );
    });
  }

  if (candidates.length !== 1) return { action: "insert" };
  const [inc] = candidates;
  if (!inc) return { action: "insert" };

  const clearRemovedAt = inc.removed_at !== null;
  const reAlertLowRating =
    isLowRating(p.incomingRating) &&
    !isLowRating(inc.rating) &&
    inc.low_rating_alerted_at === null;

  return { action: "claim", incumbentId: inc.id, clearRemovedAt, reAlertLowRating };
}
