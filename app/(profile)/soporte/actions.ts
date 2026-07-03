"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentOrgContext } from "@/lib/supabase/org";
import { recordAudit } from "@/lib/audit";
import { notifySupportMessage } from "@/lib/email/notify-support";
import type { Role, SupportCategory } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const CATEGORIES: SupportCategory[] = [
  "general",
  "review_question",
  "technical",
  "billing",
];

const createConversationSchema = z.object({
  // Sin saltos de línea: `subject` acaba en la cabecera Subject de un email
  // (aunque Nodemailer ya rechaza CRLF, cortamos el vector en el borde).
  subject: z.string().min(3).max(200).regex(/^[^\r\n]+$/, "Asunto inválido."),
  body: z.string().min(1).max(5000),
  category: z.enum(CATEGORIES as [SupportCategory, ...SupportCategory[]]).default("general"),
  linkedReviewId: z.string().uuid().nullable().optional(),
  linkedClientId: z.string().uuid().nullable().optional(),
});

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

const conversationIdSchema = z.string().uuid();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type CurrentUser = {
  id: string;
  role: Role;
  fullName: string;
  email: string | null;
  orgId: string;
};

async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle<{ role: Role; full_name: string; email: string | null }>();
  if (!data) return null;
  // El helpdesk es intra-org: necesitamos el org_id del usuario (super_admin no
  // participa → orgId null lo descarta).
  const orgCtx = await getCurrentOrgContext(supabase);
  if (!orgCtx?.orgId) return null;
  return {
    id: user.id,
    role: data.role,
    fullName: data.full_name,
    email: data.email,
    orgId: orgCtx.orgId,
  };
}

/** Emails de respondedores (admin + reviews_manager activos) DE LA ORG dada.
 *  Lee de profiles.email con fallback a auth.users.email (algunos perfiles
 *  admin tienen email NULL en profiles pero sí en auth.users). */
async function getResponderEmails(orgId: string): Promise<string[]> {
  const srv = createServiceClient();
  const { data } = await srv
    .from("profiles")
    .select("id, email")
    .in("role", ["admin", "reviews_manager"])
    .eq("status", "active")
    .eq("org_id", orgId)
    .returns<{ id: string; email: string | null }[]>();
  if (!data || data.length === 0) return [];

  const emails: string[] = [];
  const missingIds: string[] = [];
  for (const p of data) {
    if (p.email) {
      emails.push(p.email);
    } else {
      missingIds.push(p.id);
    }
  }

  if (missingIds.length > 0) {
    // Resolvemos por id (getUserById), NO con listUsers({perPage:100}): esto
    // último solo miraba la primera página de TODOS los usuarios del proyecto,
    // así que con >100 usuarios auth un responder con profiles.email NULL
    // fuera de esa página no se encontraba. missingIds es un edge case raro.
    for (const id of missingIds) {
      const { data: { user: authUser } } = await srv.auth.admin.getUserById(id);
      if (authUser?.email) emails.push(authUser.email);
    }
  }

  return emails;
}

/** Email de un usuario, con fallback a auth.users si profiles.email es null. */
async function getProfileEmail(userId: string): Promise<string> {
  const srv = createServiceClient();
  const { data } = await srv
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle<{ email: string | null }>();
  if (data?.email) return data.email;
  const { data: { user: authUser } } = await srv.auth.admin.getUserById(userId);
  return authUser?.email ?? "";
}

function appBase(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://atribuya.com";
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type CreateConversationResult =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };

export async function createConversation(
  input: z.infer<typeof createConversationSchema>,
): Promise<CreateConversationResult> {
  const parsed = createConversationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const supabase = await createClient();

  // Los punteros linked_* deben ser de la MISMA org: leerlos con el cookie-client
  // (RLS los oculta si son de otra org). Si un id no pertenece, lo dejamos en
  // null para no crear un puntero colgante cross-org (las FK de la mig 016 solo
  // validan existencia, no org).
  let linkedReviewId = parsed.data.linkedReviewId ?? null;
  let linkedClientId = parsed.data.linkedClientId ?? null;
  if (linkedReviewId) {
    const { data } = await supabase
      .from("reviews")
      .select("id")
      .eq("id", linkedReviewId)
      .maybeSingle<{ id: string }>();
    if (!data) linkedReviewId = null;
  }
  if (linkedClientId) {
    const { data } = await supabase
      .from("clients")
      .select("id")
      .eq("id", linkedClientId)
      .maybeSingle<{ id: string }>();
    if (!data) linkedClientId = null;
  }

  // Crear conversación via cookie-client (RLS fuerza opener_id = self + org_id).
  const { data: conv, error: convErr } = await supabase
    .from("support_conversations")
    .insert({
      org_id: user.orgId,
      subject: parsed.data.subject,
      category: parsed.data.category,
      opener_id: user.id,
      linked_review_id: linkedReviewId,
      linked_client_id: linkedClientId,
    } as never)
    .select("id")
    .single();

  if (convErr || !conv) {
    console.error("[support] create conversation failed:", convErr);
    return { ok: false, error: "Error al crear la consulta." };
  }

  const convId = (conv as { id: string }).id;

  // Primer mensaje
  const { error: msgErr } = await supabase.from("support_messages").insert({
    org_id: user.orgId,
    conversation_id: convId,
    author_id: user.id,
    body: parsed.data.body,
  } as never);

  if (msgErr) {
    console.error("[support] create first message failed:", msgErr);
    // La conversación existe aunque el mensaje falle — devolvemos el id igual.
  }

  // Marcar como leída para el opener
  await supabase.from("support_read_receipts").upsert(
    {
      user_id: user.id,
      conversation_id: convId,
      org_id: user.orgId,
      last_read_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id,conversation_id" },
  );

  await recordAudit({
    entityType: "conversation",
    entityId: convId,
    action: "conversation_created",
    orgId: user.orgId,
    payload: { category: parsed.data.category, opener: user.id },
  });

  // Notificación por email a los respondedores de la org (best-effort). Debe
  // ir con await: en serverless la instancia se congela al responder y un
  // sendMail sin await se cortaría a medias (email perdido sin traza). El
  // try/catch preserva el best-effort: un fallo de email no rompe la creación.
  const responderEmails = await getResponderEmails(user.orgId);
  const openerEmail = user.email || await getProfileEmail(user.id);
  try {
    await notifySupportMessage({
      conversationId: convId,
      subject: parsed.data.subject,
      messagePreview: parsed.data.body.slice(0, 500),
      authorName: user.fullName,
      isFromOpener: true,
      openerEmail,
      responderEmails,
      appBase: appBase(),
    });
  } catch (err) {
    console.error("[support] notify failed:", err);
  }

  revalidatePath("/soporte");
  return { ok: true, conversationId: convId };
}

export type SendMessageResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendMessage(
  input: z.infer<typeof sendMessageSchema>,
): Promise<SendMessageResult> {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const supabase = await createClient();

  // Insertar mensaje via cookie-client (RLS comprueba visibilidad + org_id).
  const { error: msgErr } = await supabase.from("support_messages").insert({
    org_id: user.orgId,
    conversation_id: parsed.data.conversationId,
    author_id: user.id,
    body: parsed.data.body,
  } as never);

  if (msgErr) {
    console.error("[support] send message failed:", msgErr);
    return { ok: false, error: "Error al enviar el mensaje." };
  }

  // Actualizar last_message_at via service-client (el autor respondedor puede
  // no tener UPDATE sobre la conversación si no es el opener). Filtramos por
  // org_id como defensa en profundidad (service-role bypassa RLS).
  const srv = createServiceClient();
  await srv
    .from("support_conversations")
    .update({ last_message_at: new Date().toISOString() } as never)
    .eq("id", parsed.data.conversationId)
    .eq("org_id", user.orgId);

  // Marcar como leída para el emisor
  await supabase.from("support_read_receipts").upsert(
    {
      user_id: user.id,
      conversation_id: parsed.data.conversationId,
      org_id: user.orgId,
      last_read_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id,conversation_id" },
  );

  await recordAudit({
    entityType: "conversation",
    entityId: parsed.data.conversationId,
    action: "message_sent",
    orgId: user.orgId,
    payload: { author: user.id },
  });

  // ¿Es del opener o de un respondedor? Notificar en consecuencia.
  const { data: convData } = await srv
    .from("support_conversations")
    .select("opener_id, subject")
    .eq("id", parsed.data.conversationId)
    .eq("org_id", user.orgId)
    .single();

  if (convData) {
    const opener = convData as { opener_id: string; subject: string };
    const isFromOpener = opener.opener_id === user.id;

    const openerEmail = isFromOpener
      ? (user.email || await getProfileEmail(user.id))
      : await getProfileEmail(opener.opener_id);

    const responderEmails = await getResponderEmails(user.orgId);

    // await + try/catch: ver nota en createConversation (evita el email
    // perdido por congelación de la instancia serverless).
    try {
      await notifySupportMessage({
        conversationId: parsed.data.conversationId,
        subject: opener.subject,
        messagePreview: parsed.data.body.slice(0, 500),
        authorName: user.fullName,
        isFromOpener,
        openerEmail,
        responderEmails,
        appBase: appBase(),
      });
    } catch (err) {
      console.error("[support] notify failed:", err);
    }
  }

  revalidatePath(`/soporte/${parsed.data.conversationId}`);
  revalidatePath("/soporte");
  return { ok: true };
}

export type CloseConversationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function closeConversation(
  conversationId: string,
): Promise<CloseConversationResult> {
  const id = conversationIdSchema.safeParse(conversationId);
  if (!id.success) return { ok: false, error: "ID inválido." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const supabase = await createClient();
  const isResponder = user.role === "admin" || user.role === "reviews_manager";

  if (isResponder) {
    // Service-client para respondedores (cierran cualquier conversación de su
    // org); filtramos por org_id explícitamente.
    const srv = createServiceClient();
    const { error } = await srv
      .from("support_conversations")
      .update({ status: "closed", closed_at: new Date().toISOString() } as never)
      .eq("id", id.data)
      .eq("org_id", user.orgId);
    if (error) return { ok: false, error: "Error al cerrar." };
  } else {
    // El opener cierra la suya — cookie-client, RLS fuerza opener_id = self.
    const { error } = await supabase
      .from("support_conversations")
      .update({ status: "closed", closed_at: new Date().toISOString() } as never)
      .eq("id", id.data);
    if (error) return { ok: false, error: "Error al cerrar." };
  }

  await recordAudit({
    entityType: "conversation",
    entityId: id.data,
    action: "conversation_closed",
    orgId: user.orgId,
    payload: { closedBy: user.id },
  });

  revalidatePath(`/soporte/${id.data}`);
  revalidatePath("/soporte");
  return { ok: true };
}

export async function reopenConversation(
  conversationId: string,
): Promise<CloseConversationResult> {
  const id = conversationIdSchema.safeParse(conversationId);
  if (!id.success) return { ok: false, error: "ID inválido." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const isResponder = user.role === "admin" || user.role === "reviews_manager";

  if (isResponder) {
    const srv = createServiceClient();
    const { error } = await srv
      .from("support_conversations")
      .update({ status: "open", closed_at: null } as never)
      .eq("id", id.data)
      .eq("org_id", user.orgId);
    if (error) return { ok: false, error: "Error al reabrir." };
  } else {
    const supabase = await createClient();
    const { error } = await supabase
      .from("support_conversations")
      .update({ status: "open", closed_at: null } as never)
      .eq("id", id.data);
    if (error) return { ok: false, error: "Error al reabrir." };
  }

  await recordAudit({
    entityType: "conversation",
    entityId: id.data,
    action: "conversation_reopened",
    orgId: user.orgId,
    payload: { reopenedBy: user.id },
  });

  revalidatePath(`/soporte/${id.data}`);
  revalidatePath("/soporte");
  return { ok: true };
}

export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  const id = conversationIdSchema.safeParse(conversationId);
  if (!id.success) return;

  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("support_read_receipts").upsert(
    {
      user_id: user.id,
      conversation_id: id.data,
      org_id: user.orgId,
      last_read_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id,conversation_id" },
  );

  revalidatePath("/soporte");
}
