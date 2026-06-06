/**
 * Lógica pura de alertas tempranas por reseñas con rating bajo (≤2★).
 *
 * El cron procesa reseñas frescas y, además de la notificación habitual
 * al comercial atribuido (cualquier rating), encola una alerta separada
 * cuando `rating ≤ LOW_RATING_THRESHOLD`. Esta alerta va a múltiples
 * destinatarios: admin + reviews_manager (siempre) + (si counted/pending)
 * el sales atribuido.
 *
 * Mantener este módulo **sin I/O** facilita los tests unit (no necesita
 * mocks de Supabase ni de SMTP).
 */

import type { MatchState, ProfileStatus } from "@/lib/supabase/types";

/** Reseñas con rating ≤ este valor disparan alerta. 1★ y 2★ por
 *  decisión de producto (las 3★ se consideran tibias pero no críticas). */
export const LOW_RATING_THRESHOLD = 2;

/** Devuelve true si el rating califica como "bajo" y dispara alerta. */
export function isLowRating(rating: number): boolean {
  return Number.isFinite(rating) && rating > 0 && rating <= LOW_RATING_THRESHOLD;
}

export type SalesLite = {
  id: string;
  email: string | null;
  status: ProfileStatus;
};

export type ProfileLite = {
  id: string;
  email: string | null;
  status: ProfileStatus;
};

/**
 * Resuelve la lista de emails a notificar para una alerta ≤2★. Reglas:
 *
 *   • admin + reviews_manager activos: SIEMPRE (independiente del
 *     match_state). Si no hay ninguno activo, la alerta no se envía.
 *   • sales atribuido: solo si counted/pending, email no null,
 *     status='active'.
 *   • unmatched: omite sales (no se sabe a quién atribuir).
 *
 * Dedupe por email case-insensitive.
 */
export function resolveLowRatingRecipients(params: {
  matchState: MatchState;
  sales: SalesLite | null;
  admins: ProfileLite[];
  managers: ProfileLite[];
}): string[] {
  const out: string[] = [];

  const pushIfEligible = (p: ProfileLite | null) => {
    if (!p) return;
    if (!p.email) return;
    if (p.status !== "active") return;
    out.push(p.email);
  };

  // Admins y managers: siempre incluidos si están activos.
  for (const a of params.admins) pushIfEligible(a);
  for (const m of params.managers) pushIfEligible(m);

  // Sales: solo si la reseña está atribuida.
  if (params.matchState === "counted" || params.matchState === "pending") {
    if (params.sales) {
      pushIfEligible({
        id: params.sales.id,
        email: params.sales.email,
        status: params.sales.status,
      });
    }
  }

  // Dedupe case-insensitive preservando el formato del primero visto.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const email of out) {
    const key = email.trim().toLowerCase();
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    unique.push(email.trim());
  }
  return unique;
}

/** Payload de alerta que viaja desde `processFreshReviews` hasta el flush. */
export type LowRatingAlert = {
  reviewId: string;
  rating: number;
  authorName: string;
  reviewText: string | null;
  locationId: string;
  locationName: string;
  placeId: string | null;
  matchState: MatchState;
  salesId: string | null;
  clientId: string | null;
};
