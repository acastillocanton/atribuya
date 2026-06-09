import "server-only";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyInvitedUser } from "@/lib/email/notify-invited-user";

type CreateInvitedProfileArgs = {
  fullName: string;
  email: string;
  phone: string | null;
  slug: string;
  role: "sales" | "reviews_manager" | "office_director";
  /**
   * Org to which the invited user will belong. Required for multi-tenant
   * isolation: a profile without org_id is invisible to its own org under
   * RLS (current_org_id() returns null). Callers derive this from
   * requireOrgContext(supabase) on the inviting admin's session.
   */
  orgId: string;
  /** Campos extra del profile específicos del rol (location_id, monthly_goal, …). */
  extra: Record<string, unknown>;
  /** Path al que se redirige al usuario tras aceptar el invite. */
  nextPath: string;
  /** Path(s) a revalidar tras crear el profile, para refrescar listados. */
  revalidate: string[];
};

/**
 * Genera invite-link de Supabase + inserta la fila en profiles. Helper
 * común a sales y reviews_manager — la única diferencia es el rol, los
 * campos extra del profile y la ruta a la que redirigimos tras el primer
 * login.
 *
 * Envía además un email de invitación al invitado (best-effort, vía Brevo):
 * si el correo falla, la invitación NO se rompe y devolvemos `emailSent:false`
 * para que la UI muestre el enlace de respaldo y se pueda compartir a mano.
 * El link apunta a /auth/confirm (verifyOtp server-side) en lugar del
 * action_link nativo de Supabase porque el verifier-en-cookies del flujo
 * PKCE rompía cuando el invitado abría el link desde otro dispositivo.
 */
export async function createInvitedProfile(
  args: CreateInvitedProfileArgs,
): Promise<
  | { ok: true; inviteLink: string; email: string; emailSent: boolean }
  | { ok: false; error: string }
> {
  const admin = createServiceClient();

  // Unicidad de slug POR ORG (migración 013: UNIQUE (org_id, slug)). Sin el
  // filtro de org_id, dos orgs no podrían reusar un mismo slug y un slug ya
  // usado en otra org bloquearía la invitación con un falso conflicto.
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("org_id", args.orgId)
    .eq("slug", args.slug)
    .maybeSingle<{ id: string }>();
  if (existing) {
    return {
      ok: false,
      error: `Ya existe un perfil con el slug "${args.slug}". Cambia el nombre o añade un apellido.`,
    };
  }

  const headerStore = await headers();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `https://${headerStore.get("host") ?? "localhost:3000"}`;

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: args.email,
    options: {
      data: { full_name: args.fullName },
    },
  });

  if (linkError || !linkData?.user?.id || !linkData?.properties?.hashed_token) {
    console.error("[invite] generateLink failed:", linkError);
    if (linkError?.code === "email_exists") {
      return { ok: false, error: "Este email ya está registrado." };
    }
    return { ok: false, error: linkError?.message ?? "No se pudo crear la invitación." };
  }

  const newUserId = linkData.user.id;
  const inviteLink = `${origin}/auth/confirm?token_hash=${encodeURIComponent(
    linkData.properties.hashed_token,
  )}&type=invite&next=${encodeURIComponent(args.nextPath)}`;

  const { error: profileError } = await admin.from("profiles").insert({
    id: newUserId,
    full_name: args.fullName.trim(),
    role: args.role,
    slug: args.slug,
    email: args.email,
    phone: args.phone,
    status: "invited",
    org_id: args.orgId,
    ...args.extra,
  } as never);

  if (profileError) {
    // Roll back the auth user so we don't leave it orphaned.
    await admin.auth.admin.deleteUser(newUserId);
    console.error("[invite] profile insert failed:", profileError);
    return { ok: false, error: profileError.message };
  }

  // Email de invitación al invitado (best-effort). Necesita el nombre de la
  // org para el copy; lo leemos con el mismo cliente service-role.
  let emailSent = false;
  try {
    const { data: org } = await admin
      .from("organizations")
      .select("name")
      .eq("id", args.orgId)
      .maybeSingle<{ name: string }>();
    const mail = await notifyInvitedUser({
      email: args.email,
      name: args.fullName,
      orgName: org?.name ?? "tu organización",
      inviteLink,
      appBase: origin,
      role: args.role,
    });
    emailSent = mail.ok;
    if (!mail.ok) {
      console.warn("[invite] email de invitación no enviado:", mail);
    }
  } catch (err) {
    console.error("[invite] notifyInvitedUser threw:", err);
  }

  for (const path of args.revalidate) {
    revalidatePath(path);
  }
  return { ok: true, inviteLink, email: args.email, emailSent };
}
