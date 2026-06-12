import { createServiceClient } from "@/lib/supabase/service";
import { planSalesLimit } from "@/app/(super)/super/plans";
import type { Role, ProfileStatus } from "@/lib/supabase/types";

/**
 * Tope de comerciales por plan (pricing v3, 2026-06-11).
 *
 * Ocupan plaza los perfiles "productores": role sales u office_director (el
 * director tiene panel propio y genera reseñas igual que un comercial), con
 * status invited o active. Pausar un perfil libera su plaza.
 *
 * Enforcement a nivel de app, igual que el tope de fichas de createLocation:
 * es un freno comercial, no de seguridad. Best-effort: si el plan o el conteo
 * no se pueden leer, no bloqueamos el alta.
 */

const SEAT_ROLES: Role[] = ["sales", "office_director"];
const SEAT_STATUSES: ProfileStatus[] = ["invited", "active"];

/**
 * Nº de plazas ocupadas en la org. Va por service-role porque el gestor
 * (reviews_manager) no tiene policy de SELECT sobre directores y el conteo
 * debe incluirlos; el filtro org_id explícito es obligatorio (service-role
 * salta RLS). `excludeId` permite recontar sin un perfil concreto (p. ej. al
 * reactivar uno pausado, que aún no ocupa plaza).
 */
export async function countSeats(orgId: string, excludeId?: string): Promise<number | null> {
  const admin = createServiceClient();
  let query = admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .in("role", SEAT_ROLES)
    .in("status", SEAT_STATUSES);
  if (excludeId) query = query.neq("id", excludeId);
  const { count } = await query;
  return count;
}

/** Tope de comerciales del plan de la org, o `null` si es ilimitado. */
export async function orgSeatLimit(orgId: string): Promise<number | null> {
  const admin = createServiceClient();
  const { data: org } = await admin
    .from("organizations")
    .select("plan")
    .eq("id", orgId)
    .maybeSingle<{ plan: string | null }>();
  return planSalesLimit(org?.plan);
}

/**
 * Comprueba si queda plaza libre para un comercial o director más.
 * Devuelve `null` si hay hueco (o el plan es ilimitado / no se pudo leer),
 * o `{ error }` con mensaje para el usuario si se alcanzó el tope.
 */
export async function checkSeatLimit(
  orgId: string,
  excludeId?: string,
): Promise<{ error: string } | null> {
  const limit = await orgSeatLimit(orgId);
  if (limit === null) return null;
  const count = await countSeats(orgId, excludeId);
  if (count !== null && count >= limit) {
    return {
      error:
        `Has alcanzado el tope de ${limit} comerciales de tu plan ` +
        `(los directores de oficina también ocupan plaza). ` +
        `Para ampliar el equipo, escribe a soporte y te cambiamos de plan.`,
    };
  }
  return null;
}
