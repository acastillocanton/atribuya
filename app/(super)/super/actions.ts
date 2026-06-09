"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentOrgContext } from "@/lib/supabase/org";
import { recordAudit } from "@/lib/audit";
import { notifyInvitedAdmin } from "@/lib/email/notify-invited-admin";
import { DEFAULT_PLAN } from "./plans";

/**
 * Server actions for the super-admin panel.
 *
 * Defense-in-depth: every action re-checks `is_super_admin` from the JWT
 * even though the URL is already gated by middleware + layout. A server
 * action is a public HTTP endpoint — never trust the surrounding chrome.
 *
 * Every action writes to `audit_log` with the actor's user_id. Successful
 * mutations target the specific org via `org_id`; global actions (create)
 * use the new org's id as scope so the audit row is visible to a future
 * admin of that org via the admin_select policy.
 */

const ORG_STATUSES = ["trial", "active", "suspended", "churned"] as const;
type OrgStatus = (typeof ORG_STATUSES)[number];

async function assertSuperAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const ctx = await getCurrentOrgContext(supabase);
  if (!ctx) return { ok: false, error: "No autenticado." };
  if (!ctx.isSuperAdmin) return { ok: false, error: "No autorizado." };
  return { ok: true, userId: ctx.userId };
}

// ---------------------------------------------------------------------------
// createOrg
// ---------------------------------------------------------------------------

/** Optional, free-text fiscal field — empty string normalizes to null. */
const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null));

const billingEmailField = z
  .string()
  .email("Email inválido.")
  .max(120)
  .optional()
  .nullable()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : null));

const planField = z
  .string()
  .max(40)
  .optional()
  .nullable()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : DEFAULT_PLAN));

/** Fiscal / billing identity fields, shared by create and update. */
const fiscalFields = {
  legalName: optionalText(200),
  taxId: optionalText(40),
  address: optionalText(200),
  postalCode: optionalText(20),
  city: optionalText(80),
  province: optionalText(80),
  country: optionalText(80),
} as const;

const createOrgSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto.").max(120, "Demasiado largo."),
  slug: z
    .string()
    .min(2, "Slug demasiado corto.")
    .max(60, "Slug demasiado largo.")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones."),
  billingEmail: billingEmailField,
  contactName: optionalText(120),
  contactPhone: optionalText(40),
  status: z.enum(ORG_STATUSES).default("trial"),
  plan: planField,
  // --- fiscal / billing identity (optional at creation, completable later) ---
  ...fiscalFields,
});

export type CreateOrgInput = z.input<typeof createOrgSchema>;

type FiscalParsed = { [K in keyof typeof fiscalFields]: string | null };

/** Build the `organizations.fiscal_data` JSON payload from the parsed input. */
function buildFiscalData(parsed: FiscalParsed): Record<string, string> {
  const fd: Record<string, string> = {};
  if (parsed.legalName) fd.legal_name = parsed.legalName;
  if (parsed.taxId) fd.tax_id = parsed.taxId;
  if (parsed.address) fd.address = parsed.address;
  if (parsed.postalCode) fd.postal_code = parsed.postalCode;
  if (parsed.city) fd.city = parsed.city;
  if (parsed.province) fd.province = parsed.province;
  if (parsed.country) fd.country = parsed.country;
  return fd;
}

export async function createOrg(input: CreateOrgInput): Promise<
  { ok: true; orgId: string; slug: string } | { ok: false; error: string }
> {
  const auth = await assertSuperAdmin();
  if (!auth.ok) return auth;
  const parsed = createOrgSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createServiceClient();
  const fiscalData = buildFiscalData(parsed.data);
  const { data, error } = await admin
    .from("organizations")
    .insert({
      name: parsed.data.name.trim(),
      slug: parsed.data.slug,
      status: parsed.data.status,
      plan: parsed.data.plan,
      billing_email: parsed.data.billingEmail,
      contact_name: parsed.data.contactName,
      contact_phone: parsed.data.contactPhone,
      fiscal_data: fiscalData,
    } as never)
    .select("id, slug")
    .single<{ id: string; slug: string }>();

  if (error || !data) {
    if (error?.code === "23505") {
      return { ok: false, error: "Ya existe una organización con ese slug." };
    }
    console.error("[super] createOrg failed:", error);
    return { ok: false, error: error?.message ?? "No se pudo crear la organización." };
  }

  await recordAudit({
    entityType: "organization",
    entityId: data.id,
    action: "org_created",
    orgId: data.id,
    payload: {
      actor_id: auth.userId,
      name: parsed.data.name.trim(),
      slug: parsed.data.slug,
      status: parsed.data.status,
      plan: parsed.data.plan,
      fiscal_data_filled: Object.keys(fiscalData).length > 0,
    },
  });

  revalidatePath("/super");
  return { ok: true, orgId: data.id, slug: data.slug };
}

// ---------------------------------------------------------------------------
// updateOrg — edit an existing org (everything except the slug, which is fixed
// because it is part of the public /o/[slug]/... URLs)
// ---------------------------------------------------------------------------

const updateOrgSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(2, "Nombre demasiado corto.").max(120, "Demasiado largo."),
  billingEmail: billingEmailField,
  contactName: optionalText(120),
  contactPhone: optionalText(40),
  status: z.enum(ORG_STATUSES).default("trial"),
  plan: planField,
  ...fiscalFields,
});

export type UpdateOrgInput = z.input<typeof updateOrgSchema>;

export async function updateOrg(input: UpdateOrgInput): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const auth = await assertSuperAdmin();
  if (!auth.ok) return auth;
  const parsed = updateOrgSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createServiceClient();
  const { data: before } = await admin
    .from("organizations")
    .select("name, status, plan, fiscal_data")
    .eq("id", parsed.data.orgId)
    .maybeSingle<{
      name: string;
      status: OrgStatus;
      plan: string;
      fiscal_data: Record<string, string> | null;
    }>();
  if (!before) {
    return { ok: false, error: "Organización no encontrada." };
  }

  const fiscalData = buildFiscalData(parsed.data);
  const { error } = await admin
    .from("organizations")
    .update({
      name: parsed.data.name.trim(),
      status: parsed.data.status,
      plan: parsed.data.plan,
      billing_email: parsed.data.billingEmail,
      contact_name: parsed.data.contactName,
      contact_phone: parsed.data.contactPhone,
      fiscal_data: fiscalData,
    } as never)
    .eq("id", parsed.data.orgId);
  if (error) {
    console.error("[super] updateOrg failed:", error);
    return { ok: false, error: error.message };
  }

  await recordAudit({
    entityType: "organization",
    entityId: parsed.data.orgId,
    action: "org_updated",
    orgId: parsed.data.orgId,
    payload: {
      actor_id: auth.userId,
      before: {
        name: before.name,
        status: before.status,
        plan: before.plan,
        fiscal_data: before.fiscal_data,
      },
      after: {
        name: parsed.data.name.trim(),
        status: parsed.data.status,
        plan: parsed.data.plan,
        fiscal_data: fiscalData,
      },
    },
  });

  revalidatePath("/super");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// setOrgStatus
// ---------------------------------------------------------------------------

const setStatusSchema = z.object({
  orgId: z.string().uuid(),
  status: z.enum(ORG_STATUSES),
});

export async function setOrgStatus(input: z.input<typeof setStatusSchema>): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const auth = await assertSuperAdmin();
  if (!auth.ok) return auth;
  const parsed = setStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createServiceClient();
  const { data: before } = await admin
    .from("organizations")
    .select("status")
    .eq("id", parsed.data.orgId)
    .maybeSingle<{ status: OrgStatus }>();
  if (!before) {
    return { ok: false, error: "Organización no encontrada." };
  }

  const { error } = await admin
    .from("organizations")
    .update({ status: parsed.data.status } as never)
    .eq("id", parsed.data.orgId);
  if (error) {
    console.error("[super] setOrgStatus failed:", error);
    return { ok: false, error: error.message };
  }

  await recordAudit({
    entityType: "organization",
    entityId: parsed.data.orgId,
    action: "org_status_changed",
    orgId: parsed.data.orgId,
    payload: {
      actor_id: auth.userId,
      from: before.status,
      to: parsed.data.status,
    },
  });

  revalidatePath("/super");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// deleteOrg — hard delete, cascades to locations/profiles/clients/etc via FK
// ---------------------------------------------------------------------------

export async function deleteOrg(orgId: string): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const auth = await assertSuperAdmin();
  if (!auth.ok) return auth;
  if (!orgId || typeof orgId !== "string") {
    return { ok: false, error: "Id inválido." };
  }

  const admin = createServiceClient();
  const { data: snapshot } = await admin
    .from("organizations")
    .select("id, name, slug, status, plan")
    .eq("id", orgId)
    .maybeSingle<{
      id: string;
      name: string;
      slug: string;
      status: OrgStatus;
      plan: string;
    }>();
  if (!snapshot) {
    return { ok: false, error: "Organización no encontrada." };
  }

  // Audit FIRST: once the FK cascade fires, all child rows (and their audit
  // entries by org_id) are gone. We want the trail of WHO deleted WHAT to
  // survive in a row whose org_id is null (super-admin scope).
  await recordAudit({
    entityType: "organization",
    entityId: orgId,
    action: "org_deleted",
    orgId: null,
    payload: {
      actor_id: auth.userId,
      snapshot,
    },
  });

  const { error } = await admin.from("organizations").delete().eq("id", orgId);
  if (error) {
    console.error("[super] deleteOrg failed:", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/super");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// inviteOrgAdmin — create the first admin user for a freshly-created org
// ---------------------------------------------------------------------------

const inviteAdminSchema = z.object({
  orgId: z.string().uuid(),
  email: z.string().email("Email inválido.").max(120),
  fullName: z.string().min(2, "Nombre demasiado corto.").max(120),
});

export async function inviteOrgAdmin(input: z.input<typeof inviteAdminSchema>): Promise<
  | { ok: true; inviteLink: string; email: string; emailSent: boolean }
  | { ok: false; error: string }
> {
  const auth = await assertSuperAdmin();
  if (!auth.ok) return auth;
  const parsed = inviteAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createServiceClient();
  const { data: org } = await admin
    .from("organizations")
    .select("id, slug, name")
    .eq("id", parsed.data.orgId)
    .maybeSingle<{ id: string; slug: string; name: string }>();
  if (!org) return { ok: false, error: "Organización no encontrada." };

  // Generate the invite link via Supabase Auth admin API.
  const headerStore = await headers();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `https://${headerStore.get("host") ?? "localhost:3000"}`;

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "invite",
    email: parsed.data.email,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (linkErr || !linkData?.user?.id || !linkData?.properties?.hashed_token) {
    console.error("[super] inviteOrgAdmin generateLink failed:", linkErr);
    if (linkErr?.code === "email_exists") {
      return { ok: false, error: "Este email ya está registrado." };
    }
    return { ok: false, error: linkErr?.message ?? "No se pudo crear la invitación." };
  }

  const newUserId = linkData.user.id;
  const inviteLink = `${origin}/auth/confirm?token_hash=${encodeURIComponent(
    linkData.properties.hashed_token,
  )}&type=invite&next=${encodeURIComponent("/dashboard")}`;

  // Derive a unique slug for the admin profile from the email local part.
  // Collisions are very unlikely (first admin per org) but possible across
  // orgs — fall back to suffixing with the org slug.
  const baseSlug = parsed.data.email
    .split("@")[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") ?? "admin";
  const candidateSlug = baseSlug;
  let slug = candidateSlug;
  const { data: existingSlug } = await admin
    .from("profiles")
    .select("id")
    .eq("slug", candidateSlug)
    .maybeSingle<{ id: string }>();
  if (existingSlug) slug = `${candidateSlug}-${org.slug}`;

  const { error: profileErr } = await admin.from("profiles").insert({
    id: newUserId,
    full_name: parsed.data.fullName.trim(),
    role: "admin",
    slug,
    email: parsed.data.email,
    status: "invited",
    org_id: org.id,
  } as never);
  if (profileErr) {
    await admin.auth.admin.deleteUser(newUserId);
    console.error("[super] inviteOrgAdmin profile insert failed:", profileErr);
    return { ok: false, error: profileErr.message };
  }

  // Best-effort: enviar el enlace de acceso por email. Si falla (SMTP caído,
  // sin credenciales en este entorno), no rompemos — devolvemos el link para
  // que el super_admin lo copie y lo pase a mano.
  let emailSent = false;
  try {
    const mail = await notifyInvitedAdmin({
      adminEmail: parsed.data.email,
      adminName: parsed.data.fullName,
      orgName: org.name,
      inviteLink,
      appBase: origin,
    });
    emailSent = mail.ok;
    if (!mail.ok) {
      console.warn("[super] inviteOrgAdmin email no enviado:", mail);
    }
  } catch (err) {
    console.error("[super] inviteOrgAdmin notifyInvitedAdmin threw:", err);
  }

  await recordAudit({
    entityType: "profile",
    entityId: newUserId,
    action: "org_admin_invited",
    orgId: org.id,
    payload: {
      actor_id: auth.userId,
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      org_slug: org.slug,
      email_sent: emailSent,
    },
  });

  revalidatePath("/super");
  return { ok: true, inviteLink, email: parsed.data.email, emailSent };
}
