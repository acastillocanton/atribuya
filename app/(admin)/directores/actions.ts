"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createInvitedProfile } from "@/lib/invite";
import { generateAccessLink } from "@/lib/auth/resend-link";
import { slugify } from "@/lib/utils";
import { recordAudit } from "@/lib/audit";

/**
 * Solo admin/reviews_manager administran directores. Las escrituras sobre filas
 * role='office_director' van por service-role (el gestor no tiene policy de
 * UPDATE/DELETE sobre directores), validando org_id en código. El office_director
 * NO puede crear/editar otros directores.
 */
async function assertCanManageDirectors(): Promise<
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
  if (!actor.org_id) return { ok: false, error: "Tu perfil no tiene organización asignada." };
  return { ok: true, orgId: actor.org_id };
}

const commissionRateSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim().replace(",", ".");
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? n : null;
  });

const inviteDirectorSchema = z.object({
  fullName: z.string().min(2, "Nombre demasiado corto.").max(120),
  email: z.string().email("Email inválido."),
  phone: z
    .string()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  locationId: z.string().uuid("Selecciona la ficha del director."),
  monthlyGoal: z.coerce.number().int().min(0).max(1000),
  commissionRate: commissionRateSchema,
});

export type InviteDirectorInput = z.input<typeof inviteDirectorSchema>;

export async function inviteOfficeDirector(input: InviteDirectorInput): Promise<
  { ok: true; inviteLink: string; email: string; emailSent: boolean } | { ok: false; error: string }
> {
  const guard = await assertCanManageDirectors();
  if (!guard.ok) return guard;
  const parsed = inviteDirectorSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const baseSlug = slugify(parsed.data.fullName);
  if (!baseSlug) return { ok: false, error: "No se pudo generar el identificador del director." };

  return createInvitedProfile({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    slug: baseSlug,
    role: "office_director",
    orgId: guard.orgId,
    extra: {
      location_id: parsed.data.locationId,
      monthly_goal: parsed.data.monthlyGoal,
      commission_rate: parsed.data.commissionRate,
    },
    nextPath: "/dashboard",
    revalidate: ["/directores"],
  });
}

const updateDirectorSchema = z.object({
  id: z.string().uuid(),
  monthlyGoal: z.coerce.number().int().min(0).max(1000),
  locationId: z.string().uuid("Selecciona una ficha."),
  status: z.enum(["invited", "active", "paused"]),
  commissionRate: commissionRateSchema,
});

export async function updateDirector(input: z.input<typeof updateDirectorSchema>) {
  const guard = await assertCanManageDirectors();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  const parsed = updateDirectorSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createServiceClient();
  const { error } = await admin
    .from("profiles")
    .update({
      monthly_goal: parsed.data.monthlyGoal,
      location_id: parsed.data.locationId,
      status: parsed.data.status,
      commission_rate: parsed.data.commissionRate,
    } as never)
    .eq("id", parsed.data.id)
    .eq("role", "office_director")
    .eq("org_id", guard.orgId);
  if (error) return { ok: false as const, error: error.message };

  await recordAudit({
    entityType: "profile",
    entityId: parsed.data.id,
    action: "update_director",
    orgId: guard.orgId,
  });
  revalidatePath("/directores");
  return { ok: true as const };
}

export async function resendDirectorAccess(id: string): Promise<
  { ok: true; link: string; email: string } | { ok: false; error: string }
> {
  if (!id) return { ok: false, error: "Id inválido." };
  const guard = await assertCanManageDirectors();
  if (!guard.ok) return guard;
  const admin = createServiceClient();
  const { data: target } = await admin
    .from("profiles")
    .select("email")
    .eq("id", id)
    .eq("role", "office_director")
    .eq("org_id", guard.orgId)
    .maybeSingle<{ email: string | null }>();
  if (!target?.email) return { ok: false, error: "Este director no tiene email registrado." };
  return generateAccessLink(target.email, "/dashboard");
}

export async function deleteDirector(id: string) {
  if (!id) return { ok: false as const, error: "Id inválido." };
  const guard = await assertCanManageDirectors();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  const admin = createServiceClient();
  // Sus comerciales quedan huérfanos (director_id → NULL por la FK on delete set null).
  const { error } = await admin
    .from("profiles")
    .delete()
    .eq("id", id)
    .eq("role", "office_director")
    .eq("org_id", guard.orgId);
  if (error) return { ok: false as const, error: error.message };
  await recordAudit({
    entityType: "profile",
    entityId: id,
    action: "delete_director",
    orgId: guard.orgId,
  });
  revalidatePath("/directores");
  return { ok: true as const };
}
