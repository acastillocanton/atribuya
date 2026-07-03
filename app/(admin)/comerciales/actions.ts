"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createInvitedProfile } from "@/lib/invite";
import { generateAccessLink } from "@/lib/auth/resend-link";
import { checkSeatLimit } from "@/lib/plan-seats";
import { slugify } from "@/lib/utils";

/**
 * Comprueba que el caller puede administrar comerciales (admin o
 * reviews_manager). Defensa en profundidad sobre el gating de la UI y la
 * RLS — los server actions son endpoints HTTP y un atacante autenticado
 * pero sin rol suficiente no debe poder dispararlos aunque conozca la URL.
 */
async function assertCanManageSales(): Promise<
  { ok: true; orgId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const { data: actor } = await supabase
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .maybeSingle<{ role: string; org_id: string | null }>();
  if (actor?.role !== "admin" && actor?.role !== "reviews_manager") {
    return { ok: false, error: "No autorizado." };
  }
  if (!actor.org_id) {
    return {
      ok: false,
      error:
        "Tu perfil no tiene organización asignada. Pide al super-admin que te asocie a una.",
    };
  }
  return { ok: true, orgId: actor.org_id };
}

/**
 * Valida (defensa en profundidad, #13) que la ficha y, si viene, el director
 * responsable pertenecen a la MISMA org. La RLS ancla el `org_id` de la fila
 * del perfil pero NO el de los ids que se le asignan; sin esto un admin podría
 * asignar a un comercial un `location_id`/`director_id` de otra org (si conoce
 * el UUID), contaminando el roster del matcher. Vía service-role con filtro
 * `org_id` explícito para no depender de las policies de SELECT del rol actor.
 */
async function assertLocationAndDirectorInOrg(
  orgId: string,
  locationId: string,
  directorId: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createServiceClient();
  const { data: loc } = await admin
    .from("locations")
    .select("id")
    .eq("id", locationId)
    .eq("org_id", orgId)
    .maybeSingle<{ id: string }>();
  if (!loc) return { ok: false, error: "La ficha seleccionada no es válida." };
  if (directorId) {
    const { data: dir } = await admin
      .from("profiles")
      .select("id")
      .eq("id", directorId)
      .eq("role", "office_director")
      .eq("org_id", orgId)
      .maybeSingle<{ id: string }>();
    if (!dir) return { ok: false, error: "El director seleccionado no es válido." };
  }
  return { ok: true };
}

// Tarifa €/reseña: acepta string del formulario ("", "20", "2,5"), número o
// null. Vacío → null (tarifa sin configurar). Negativos/no-numéricos → null.
const commissionRateSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim().replace(",", ".");
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? n : null;
  });

// Director responsable: uuid del office_director, o null (pool del admin).
// Vacío del formulario ("") → null.
const directorIdSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    const s = (v ?? "").toString().trim();
    return s === "" ? null : s;
  })
  .refine(
    (v) => v === null || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
    { message: "Director inválido." },
  );

const inviteSchema = z.object({
  fullName: z.string().min(2, "Nombre demasiado corto.").max(120),
  email: z.string().email("Email inválido."),
  phone: z
    .string()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  locationId: z.string().uuid("Selecciona una ficha."),
  monthlyGoal: z.coerce.number().int().min(0).max(1000),
  commissionRate: commissionRateSchema,
  directorId: directorIdSchema,
});

export type InviteSalesInput = z.infer<typeof inviteSchema>;

export async function inviteSales(input: InviteSalesInput): Promise<
  | { ok: true; inviteLink: string; email: string; emailSent: boolean }
  | { ok: false; error: string }
> {
  const auth = await assertCanManageSales();
  if (!auth.ok) return auth;
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const baseSlug = slugify(parsed.data.fullName);
  if (!baseSlug) {
    return { ok: false, error: "No se pudo generar el identificador del comercial." };
  }
  // #13: ficha y director deben ser de esta org.
  const belongs = await assertLocationAndDirectorInOrg(
    auth.orgId,
    parsed.data.locationId,
    parsed.data.directorId,
  );
  if (!belongs.ok) return { ok: false, error: belongs.error };
  // Tope de comerciales por plan (pricing v3): los seats incluyen directores.
  const seatBlock = await checkSeatLimit(auth.orgId);
  if (seatBlock) return { ok: false, error: seatBlock.error };
  return createInvitedProfile({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    slug: baseSlug,
    role: "sales",
    orgId: auth.orgId,
    extra: {
      location_id: parsed.data.locationId,
      monthly_goal: parsed.data.monthlyGoal,
      commission_rate: parsed.data.commissionRate,
      director_id: parsed.data.directorId,
    },
    nextPath: "/panel",
    // Sin revalidate aquí: refrescaría la lista al instante y, si la página
    // estaba en empty-state, desmontaría el botón (y su modal con el enlace).
    // El refresco lo hace el modal con router.refresh() al cerrarse.
    revalidate: [],
  });
}

const updateSchema = z.object({
  id: z.string().uuid(),
  monthlyGoal: z.coerce.number().int().min(0).max(1000),
  locationId: z.string().uuid("Selecciona una ficha."),
  status: z.enum(["invited", "active", "paused"]),
  commissionRate: commissionRateSchema,
  directorId: directorIdSchema,
});

export type UpdateSalesInput = z.input<typeof updateSchema>;

export async function updateSales(input: UpdateSalesInput) {
  const auth = await assertCanManageSales();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();

  // #13: ficha y director deben ser de esta org.
  const belongs = await assertLocationAndDirectorInOrg(
    auth.orgId,
    parsed.data.locationId,
    parsed.data.directorId,
  );
  if (!belongs.ok) return { ok: false as const, error: belongs.error };

  // Tope de plazas (#12): solo se valida cuando la edición AÑADE una plaza, es
  // decir, reactivar un perfil que estaba pausado. Editar un perfil que ya
  // ocupaba plaza (invited/active) no consume una nueva, aunque la org esté por
  // encima del tope (p. ej. plan rebajado de standard legacy a basic) — si no,
  // el admin no podría ni tocar la tarifa de un comercial existente.
  if (parsed.data.status !== "paused") {
    const { data: current } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", parsed.data.id)
      .eq("org_id", auth.orgId)
      .maybeSingle<{ status: string }>();
    const wasOccupying = current?.status === "active" || current?.status === "invited";
    if (!wasOccupying) {
      const seatBlock = await checkSeatLimit(auth.orgId, parsed.data.id);
      if (seatBlock) return { ok: false as const, error: seatBlock.error };
    }
  }

  // RLS: admin (profiles_admin_all) + reviews_manager (profiles_manager_update_sales
  // de la migración 005) son los únicos que pueden hacer UPDATE en filas con
  // role='sales'. Middleware también gatea esta ruta.
  const { error } = await supabase
    .from("profiles")
    .update({
      monthly_goal: parsed.data.monthlyGoal,
      location_id: parsed.data.locationId,
      status: parsed.data.status,
      commission_rate: parsed.data.commissionRate,
      director_id: parsed.data.directorId,
    } as never)
    .eq("id", parsed.data.id)
    .eq("role", "sales")
    .eq("org_id", auth.orgId);

  if (error) {
    console.error("[comerciales] updateSales failed:", error);
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/comerciales");
  revalidatePath(`/comerciales/${parsed.data.id}`);
  return { ok: true as const };
}

export async function resendSalesAccess(id: string): Promise<
  | { ok: true; link: string; email: string }
  | { ok: false; error: string }
> {
  if (!id) return { ok: false, error: "Id inválido." };
  const auth = await assertCanManageSales();
  if (!auth.ok) return auth;

  const admin = createServiceClient();
  // Service-role salta RLS: el filtro de org_id es obligatorio aquí, si no un
  // admin podría generar un magic-link de login para un comercial de OTRA org.
  const { data: target } = await admin
    .from("profiles")
    .select("email")
    .eq("id", id)
    .eq("role", "sales")
    .eq("org_id", auth.orgId)
    .maybeSingle<{ email: string | null }>();
  if (!target?.email) {
    return { ok: false, error: "Este comercial no tiene email registrado." };
  }
  return generateAccessLink(target.email, "/panel");
}

export async function deleteSales(id: string) {
  if (!id) return { error: "Id inválido." };
  const auth = await assertCanManageSales();
  if (!auth.ok) return { error: auth.error };
  const supabase = await createClient();
  // RLS: admin + reviews_manager (migración 005) son los únicos roles que
  // pueden hacer DELETE en filas con role='sales'. Filtramos también por
  // org_id (defensa en profundidad) y comprobamos que el delete afectó una
  // fila ANTES de borrar el auth.user: si no, un delete cross-org (0 filas,
  // no es error bajo RLS) seguido de deleteUser destruiría la cuenta de un
  // comercial de otra org.
  const { data: deleted, error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id)
    .eq("role", "sales")
    .eq("org_id", auth.orgId)
    .select("id");
  if (error) {
    console.error("[comerciales] deleteSales failed:", error);
    return { error: error.message };
  }
  if (!deleted || deleted.length === 0) {
    return { error: "Comercial no encontrado." };
  }
  // Also wipe the auth.users row so the slot is free for re-invitation.
  const admin = createServiceClient();
  await admin.auth.admin.deleteUser(id);
  revalidatePath("/comerciales");
  return { ok: true };
}
