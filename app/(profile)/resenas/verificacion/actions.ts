"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { recomputeClientPrincipal } from "@/lib/cron/duplicate-detection";
import { recordAudit } from "@/lib/audit";
import { createClientRecord } from "@/app/(sales)/clientes/actions";

const reviewIdSchema = z.string().uuid();

/**
 * Contexto del admin: user id + org_id. El org_id se usa para (a) validar que
 * los `sales_id`/`client_id` reasignados son de la misma org y (b) añadir
 * `.eq("org_id", …)` explícito a las mutaciones de `reviews` (defensa en
 * profundidad sobre la RLS, §4 de CLAUDE.md).
 */
async function getAdminContext(): Promise<
  { userId: string; orgId: string } | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .maybeSingle<{ role: string; org_id: string | null }>();
  if (profile?.role !== "admin" || !profile.org_id) return null;
  return { userId: user.id, orgId: profile.org_id };
}

/**
 * Para acciones operativas (marcar eliminada, restaurar) admitimos también
 * al gestor de reseñas. Estas acciones no afectan a matching ni a stats
 * permanentes; solo soft-delete + soft-restore con audit trail. Devuelve el
 * `org_id` para el filtro explícito.
 */
async function getAdminOrManagerContext(): Promise<
  { userId: string; role: "admin" | "reviews_manager"; orgId: string } | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .maybeSingle<{ role: string; org_id: string | null }>();
  if (!profile?.org_id) return null;
  if (profile.role === "admin") return { userId: user.id, role: "admin", orgId: profile.org_id };
  if (profile.role === "reviews_manager")
    return { userId: user.id, role: "reviews_manager", orgId: profile.org_id };
  return null;
}

async function audit(
  entityId: string,
  action: string,
  payload: Record<string, unknown>,
) {
  // audit_log tiene RLS habilitado sin política de INSERT para ningún rol:
  // se escribe vía service-role para que el comercial/admin no pueda fabricar
  // entradas a mano. Helper en lib/audit.ts.
  await recordAudit({ entityType: "review", entityId, action, payload });
}

/**
 * Confirma la atribución propuesta por el matcher. Marca match_state='counted'
 * y deja sales_id/client_id como estaban. Usado para reseñas con confianza
 * entre 40-75 donde la propuesta del algoritmo es razonable y el admin la
 * valida sin cambios.
 */
export async function confirmReview(reviewId: string) {
  const parsed = reviewIdSchema.safeParse(reviewId);
  if (!parsed.success) return { ok: false as const, error: "Id inválido." };

  const admin = await getAdminContext();
  if (!admin) return { ok: false as const, error: "No autorizado." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ match_state: "counted" } as never)
    .eq("id", parsed.data)
    .eq("org_id", admin.orgId);
  if (error) {
    console.error("[verificacion] confirmReview failed:", error);
    return { ok: false as const, error: error.message };
  }

  await audit(parsed.data, "confirm", { confirmed_by: admin.userId });
  revalidatePath("/resenas/verificacion");
  return { ok: true as const };
}

/**
 * Rechaza la atribución: limpia sales_id/client_id/share_link_id y marca como
 * 'unmatched'. La reseña permanece en la base (sigue siendo una reseña real
 * de Google) pero ya no se contabiliza para ningún comercial.
 */
export async function rejectReview(reviewId: string) {
  const parsed = reviewIdSchema.safeParse(reviewId);
  if (!parsed.success) return { ok: false as const, error: "Id inválido." };

  const admin = await getAdminContext();
  if (!admin) return { ok: false as const, error: "No autorizado." };

  const supabase = await createClient();
  // Cliente previo: si al rechazar sacamos esta reseña de un cliente y era su
  // principal, hay que reasentar la principal (promover la siguiente) o el
  // comercial dejaría de contar reseñas legítimas de ese cliente.
  const { data: prev } = await supabase
    .from("reviews")
    .select("client_id")
    .eq("id", parsed.data)
    .eq("org_id", admin.orgId)
    .maybeSingle<{ client_id: string | null }>();

  const { error } = await supabase
    .from("reviews")
    .update({
      match_state: "unmatched",
      sales_id: null,
      client_id: null,
      share_link_id: null,
      is_duplicate: false,
    } as never)
    .eq("id", parsed.data)
    .eq("org_id", admin.orgId);
  if (error) {
    console.error("[verificacion] rejectReview failed:", error);
    return { ok: false as const, error: error.message };
  }

  if (prev?.client_id) {
    await recomputeClientPrincipal(createServiceClient(), prev.client_id, admin.orgId);
  }

  await audit(parsed.data, "reject", { rejected_by: admin.userId });
  revalidatePath("/resenas/verificacion");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

const reassignSchema = z.object({
  reviewId: z.string().uuid(),
  salesId: z.string().uuid(),
  clientId: z.string().uuid().optional().nullable(),
});

/**
 * Reasigna manualmente la reseña a otro comercial (y opcionalmente otro
 * cliente). Marca como 'counted'. Usado cuando el matcher acertó en parte
 * o cuando el admin sabe a quién corresponde porque tiene contexto que el
 * algoritmo no puede tener.
 */
export async function reassignReview(input: z.input<typeof reassignSchema>) {
  const parsed = reassignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const admin = await getAdminContext();
  if (!admin) return { ok: false as const, error: "No autorizado." };

  const supabase = await createClient();
  const newClientId = parsed.data.clientId ?? null;

  // Defensa en profundidad (#13): validar que el comercial y el cliente
  // destino son de la MISMA org. Al leer con el cookie-client, la RLS solo
  // devuelve filas de la org del admin → un id foráneo sale como "no válido".
  const { data: targetSales } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", parsed.data.salesId)
    .maybeSingle<{ role: string }>();
  if (!targetSales || (targetSales.role !== "sales" && targetSales.role !== "office_director")) {
    return { ok: false as const, error: "El comercial destino no es válido." };
  }
  if (newClientId) {
    const { data: targetClient } = await supabase
      .from("clients")
      .select("id")
      .eq("id", newClientId)
      .maybeSingle<{ id: string }>();
    if (!targetClient) {
      return { ok: false as const, error: "El cliente destino no es válido." };
    }
  }

  // Cliente previo: si la reseña sale de otro cliente, hay que reasentar su
  // principal después.
  const { data: prev } = await supabase
    .from("reviews")
    .select("client_id")
    .eq("id", parsed.data.reviewId)
    .eq("org_id", admin.orgId)
    .maybeSingle<{ client_id: string | null }>();
  if (!prev) return { ok: false as const, error: "Reseña no encontrada." };
  const oldClientId = prev.client_id;

  const { error } = await supabase
    .from("reviews")
    .update({
      match_state: "counted",
      sales_id: parsed.data.salesId,
      client_id: newClientId,
      // Base; si hay cliente, `recomputeClientPrincipal` fija el valor real
      // según el conjunto del cliente. Sin cliente, no hay dedup posible.
      is_duplicate: false,
    } as never)
    .eq("id", parsed.data.reviewId)
    .eq("org_id", admin.orgId);
  if (error) {
    console.error("[verificacion] reassignReview failed:", error);
    return { ok: false as const, error: error.message };
  }

  // Recalcular duplicados (#1): en el cliente nuevo (la reseña puede ser una
  // segunda del mismo cliente → debe quedar duplicada y no contar doble) y en
  // el antiguo (por si esta era su principal).
  const svc = createServiceClient();
  if (newClientId) await recomputeClientPrincipal(svc, newClientId, admin.orgId);
  if (oldClientId && oldClientId !== newClientId) {
    await recomputeClientPrincipal(svc, oldClientId, admin.orgId);
  }

  await audit(parsed.data.reviewId, "reassign", {
    reassigned_by: admin.userId,
    new_sales_id: parsed.data.salesId,
    new_client_id: newClientId,
    old_client_id: oldClientId,
  });
  revalidatePath("/resenas/verificacion");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

/**
 * Marca una reseña como eliminada en Google (soft delete). Usado para
 * casos que el cron de Places API no puede detectar automáticamente
 * (reseñas antiguas fuera del top-5, modificaciones que Google reordena
 * etc.). Admin y reviews_manager.
 *
 * No tocamos sales_id/client_id ni match_state — si Google la vuelve a
 * mostrar y la restauramos, el matching propuesto sigue ahí.
 */
export async function markReviewRemoved(reviewId: string) {
  const parsed = reviewIdSchema.safeParse(reviewId);
  if (!parsed.success) return { ok: false as const, error: "Id inválido." };

  const actor = await getAdminOrManagerContext();
  if (!actor) return { ok: false as const, error: "No autorizado." };

  const supabase = await createClient();
  const { data: prev } = await supabase
    .from("reviews")
    .select("client_id")
    .eq("id", parsed.data)
    .eq("org_id", actor.orgId)
    .maybeSingle<{ client_id: string | null }>();

  const { error } = await supabase
    .from("reviews")
    .update({ removed_at: new Date().toISOString() } as never)
    .eq("id", parsed.data)
    .eq("org_id", actor.orgId)
    .is("removed_at", null);
  if (error) {
    console.error("[verificacion] markReviewRemoved failed:", error);
    return { ok: false as const, error: error.message };
  }

  // Al salir del conjunto activo del cliente, reasentar su principal (si era
  // la principal, promueve la siguiente; si no, no cambia nada).
  if (prev?.client_id) {
    await recomputeClientPrincipal(createServiceClient(), prev.client_id, actor.orgId);
  }

  await audit(parsed.data, "mark_removed", {
    removed_by: actor.userId,
    actor_role: actor.role,
    source: "manual",
  });
  revalidatePath("/resenas/verificacion");
  revalidatePath("/manager/resenas");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

/**
 * Restaura una reseña que estaba marcada como eliminada (volver a
 * removed_at = NULL). Usado cuando se marcó por error, o cuando Google
 * la vuelve a mostrar y el admin quiere reactivarla a mano (el cron lo
 * haría también en el siguiente run, pero acelera).
 */
export async function restoreReview(reviewId: string) {
  const parsed = reviewIdSchema.safeParse(reviewId);
  if (!parsed.success) return { ok: false as const, error: "Id inválido." };

  const actor = await getAdminOrManagerContext();
  if (!actor) return { ok: false as const, error: "No autorizado." };

  const supabase = await createClient();
  const { data: prev } = await supabase
    .from("reviews")
    .select("client_id")
    .eq("id", parsed.data)
    .eq("org_id", actor.orgId)
    .maybeSingle<{ client_id: string | null }>();

  const { error } = await supabase
    .from("reviews")
    .update({ removed_at: null } as never)
    .eq("id", parsed.data)
    .eq("org_id", actor.orgId)
    .not("removed_at", "is", null);
  if (error) {
    console.error("[verificacion] restoreReview failed:", error);
    return { ok: false as const, error: error.message };
  }

  // Al reingresar al conjunto activo, recalcular la principal del cliente
  // (la restaurada puede ser más antigua que la que se promovió al eliminarla).
  if (prev?.client_id) {
    await recomputeClientPrincipal(createServiceClient(), prev.client_id, actor.orgId);
  }

  await audit(parsed.data, "restore", {
    restored_by: actor.userId,
    actor_role: actor.role,
    source: "manual",
  });
  revalidatePath("/resenas/verificacion");
  revalidatePath("/manager/resenas");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

const claimSchema = z
  .object({
    reviewId: z.string().uuid(),
    clientId: z.string().uuid().optional().nullable(),
    newClientName: z
      .string()
      .trim()
      .min(2, "Nombre de cliente demasiado corto.")
      .max(120)
      .optional()
      .nullable(),
  })
  // XOR: o un cliente existente, o uno nuevo (o ninguno: reclamar sin cliente).
  .refine((v) => !(v.clientId && v.newClientName), {
    message: "Elige un cliente existente o crea uno nuevo, no ambos.",
  });

/**
 * "Es mía": el comercial reclama una reseña huérfana (sin atribuir) de su
 * ficha. La pasa a counted con sales_id = él mismo y, opcionalmente, la vincula
 * a un cliente suyo (existente o creado al vuelo). La RLS reviews_sales_claim_update
 * (mig 019) garantiza el aislamiento: solo unmatched, de su ficha, su org, y la
 * fila resultante queda forzosamente con sales_id = auth.uid() y counted.
 */
export async function claimReview(input: z.input<typeof claimSchema>) {
  const parsed = claimSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autorizado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .maybeSingle<{ role: string; org_id: string | null }>();
  if (profile?.role !== "sales") {
    return { ok: false as const, error: "Solo el comercial puede reclamar una reseña." };
  }
  if (!profile.org_id) {
    return { ok: false as const, error: "Tu perfil no tiene organización asignada." };
  }
  const orgId = profile.org_id;

  // Cliente: uno EXISTENTE del propio comercial, o uno nuevo (createClientRecord
  // valida org y unicidad de slug).
  let clientId: string | null = parsed.data.clientId ?? null;
  let wasNewClient = false;
  if (clientId) {
    // Validar el cliente existente contra la RLS de `clients` (cookie-client):
    // solo devuelve los del propio comercial en su org. IMPRESCINDIBLE: el claim
    // escribe client_id directo y la policy reviews_sales_claim_update (mig 019)
    // NO restringe client_id; sin esta comprobación un sales podría vincular un
    // client_id de OTRA org y el recompute (service-role) tocaría is_duplicate de
    // reseñas ajenas (escritura cross-tenant).
    const { data: ownClient } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .maybeSingle<{ id: string }>();
    if (!ownClient) {
      return { ok: false as const, error: "El cliente seleccionado no es válido." };
    }
  } else if (parsed.data.newClientName) {
    const created = await createClientRecord({ fullName: parsed.data.newClientName });
    if (!created.ok) return { ok: false as const, error: created.error };
    clientId = created.client.id;
    wasNewClient = true;
  }

  // Reclamar. `.is("sales_id", null)` hace la operación race-safe (si otro se
  // adelanta, no afecta filas). La RLS impone ficha/org/estado final.
  const { data: claimed, error } = await supabase
    .from("reviews")
    .update({ sales_id: user.id, match_state: "counted", client_id: clientId } as never)
    .eq("id", parsed.data.reviewId)
    .is("sales_id", null)
    .select("id");
  if (error) {
    console.error("[verificacion] claimReview failed:", error);
    return { ok: false as const, error: error.message };
  }
  if (!claimed || claimed.length === 0) {
    // Otro comercial/cron atribuyó la reseña entre medias. Si habíamos creado
    // un cliente al vuelo para esta reclamación, lo borramos para no dejarlo
    // huérfano (no llegó a vincularse a ninguna reseña).
    if (wasNewClient && clientId) {
      await supabase.from("clients").delete().eq("id", clientId);
    }
    return { ok: false as const, error: "Esta reseña ya fue atribuida." };
  }

  // Si se vinculó a un cliente, recalcular su principal (#1): la reclamada
  // podría ser una segunda reseña del mismo cliente y debe quedar marcada
  // duplicada para no contar doble. La RLS del comercial no puede escribir
  // `is_duplicate`, así que se hace por service-client tras el claim (que ya
  // validó ficha/org/estado). Sin cliente, no hay dedup posible.
  if (clientId) {
    await recomputeClientPrincipal(createServiceClient(), clientId, orgId);
  }

  await audit(parsed.data.reviewId, "claim", {
    claimed_by: user.id,
    client_id: clientId,
    was_new_client: wasNewClient,
  });
  revalidatePath("/resenas/verificacion");
  revalidatePath("/panel");
  revalidatePath("/panel/resenas");
  revalidatePath("/clientes");
  revalidatePath("/ranking");
  return { ok: true as const, clientId, wasNewClient };
}
