"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentOrgContext } from "@/lib/supabase/org";
import { createInvitedProfile } from "@/lib/invite";
import { generateAccessLink } from "@/lib/auth/resend-link";
import { slugify } from "@/lib/utils";

const inviteManagerSchema = z.object({
  fullName: z.string().min(2, "Nombre demasiado corto.").max(120),
  email: z.string().email("Email inválido."),
  phone: z
    .string()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

export type InviteManagerInput = z.infer<typeof inviteManagerSchema>;

export async function inviteReviewsManager(input: InviteManagerInput): Promise<
  | { ok: true; inviteLink: string; email: string; emailSent: boolean }
  | { ok: false; error: string }
> {
  const parsed = inviteManagerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  // Multi-tenant: derive the inviter's org from their session. The new
  // manager will be created in the SAME org as the admin who invited them.
  const supabase = await createClient();
  const ctx = await getCurrentOrgContext(supabase);
  if (!ctx) return { ok: false, error: "No autenticado." };
  if (!ctx.orgId) {
    return {
      ok: false,
      error:
        "Tu perfil no tiene organización asignada. Pide al super-admin que te asocie a una.",
    };
  }
  const baseSlug = slugify(parsed.data.fullName);
  if (!baseSlug) {
    return { ok: false, error: "No se pudo generar el identificador del gestor." };
  }
  return createInvitedProfile({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    slug: baseSlug,
    role: "reviews_manager",
    orgId: ctx.orgId,
    extra: {},
    nextPath: "/manager/resenas",
    revalidate: ["/gestores"],
  });
}

export async function resendManagerAccess(id: string): Promise<
  | { ok: true; link: string; email: string }
  | { ok: false; error: string }
> {
  if (!id) return { ok: false, error: "Id inválido." };
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
  if (actor?.role !== "admin") return { ok: false, error: "No autorizado." };
  if (!actor.org_id) return { ok: false, error: "Tu perfil no tiene organización asignada." };

  const admin = createServiceClient();
  // Service-role salta RLS: filtrar por org_id es obligatorio, si no un admin
  // podría generar un magic-link de login para un gestor de OTRA org.
  const { data: target } = await admin
    .from("profiles")
    .select("email")
    .eq("id", id)
    .eq("role", "reviews_manager")
    .eq("org_id", actor.org_id)
    .maybeSingle<{ email: string | null }>();
  if (!target?.email) {
    return { ok: false, error: "Este gestor no tiene email registrado." };
  }
  return generateAccessLink(target.email, "/dashboard");
}

export async function deleteReviewsManager(id: string) {
  if (!id) return { error: "Id inválido." };

  // Verificación explícita del rol del actor: el middleware ya bloquea
  // /gestores para no-admin, pero el server action es una superficie aparte
  // que conviene comprobar también aquí.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .maybeSingle<{ role: string; org_id: string | null }>();
  if (profile?.role !== "admin") return { error: "No autorizado." };
  if (!profile.org_id) return { error: "Tu perfil no tiene organización asignada." };

  // Usamos service-client para el delete del profile + el auth.user. Bypasea
  // la RLS y evita el caso "admin tiene política pero current_role() no lo
  // resuelve" en algún edge case. Coherente con createInvitedProfile, que
  // también pasa por service-client para crear el perfil + el auth.user.
  // Como service-role salta RLS, el filtro por org_id es obligatorio: sin él
  // un admin podría borrar el gestor (y su auth.user) de OTRA org.
  const admin = createServiceClient();
  const { data: deleted, error: profileErr } = await admin
    .from("profiles")
    .delete()
    .eq("id", id)
    .eq("role", "reviews_manager")
    .eq("org_id", profile.org_id)
    .select("id");
  if (profileErr) {
    console.error("[gestores] delete profile failed:", profileErr);
    return { error: profileErr.message };
  }
  if (!deleted || deleted.length === 0) {
    return { error: "Gestor no encontrado." };
  }

  const { error: authErr } = await admin.auth.admin.deleteUser(id);
  if (authErr) {
    // Si el auth user no se puede borrar (el caso típico es que ya no exista
    // porque alguien lo eliminó manualmente desde Supabase), no rompemos la
    // operación: el profile ya está eliminado y el sidebar lo refleja.
    console.warn("[gestores] auth deleteUser failed:", authErr);
  }

  revalidatePath("/gestores");
  return { ok: true };
}
