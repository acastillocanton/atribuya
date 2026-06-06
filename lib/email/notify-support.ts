import "server-only";
import { sendEmail } from "./brevo";

/**
 * Email del helpdesk interno (soporte). Portado del producto base y adaptado a
 * Atribuya (marca única, sin `lib/branding`): el logo sale de
 * `${appBase}/brand/logo-horizontal.png` y la firma es "Atribuya".
 *
 * - Nueva conversación / mensaje del opener → notifica a los respondedores
 *   (admin + reviews_manager de la MISMA org) via BCC.
 * - Mensaje de un respondedor → notifica al opener.
 *
 * Mismo patrón que notify-low-rating.ts.
 */

export type SupportNotificationInput = {
  conversationId: string;
  subject: string;
  messagePreview: string;
  authorName: string;
  /** ¿El autor es el opener (asker) o un respondedor? */
  isFromOpener: boolean;
  openerEmail: string;
  /** Emails de respondedores (admin + reviews_manager activos de la org). Deduplicados. */
  responderEmails: string[];
  appBase: string;
};

/**
 * Función pura: resuelve quién recibe la notificación.
 * - Mensaje del opener → notifica a los respondedores (menos el propio opener
 *   si resultara ser admin/manager).
 * - Mensaje de un respondedor → notifica solo al opener.
 */
export function resolveSupportRecipients(
  isFromOpener: boolean,
  openerEmail: string,
  responderEmails: string[],
): string[] {
  if (!isFromOpener) {
    return [openerEmail];
  }
  const lower = openerEmail.toLowerCase();
  return responderEmails.filter((e) => e.toLowerCase() !== lower);
}

export async function notifySupportMessage(input: SupportNotificationInput) {
  const recipients = resolveSupportRecipients(
    input.isFromOpener,
    input.openerEmail,
    input.responderEmails,
  );

  if (recipients.length === 0) {
    return { ok: false as const, skipped: true, reason: "no_recipients" as const };
  }

  const prefix = input.isFromOpener ? "Nueva consulta" : "Respuesta";
  const emailSubject = `[Soporte] ${prefix}: ${input.subject}`;
  const conversationUrl = `${input.appBase}/soporte/${input.conversationId}`;

  const html = renderHtml(input, conversationUrl);
  const text = renderText(input, conversationUrl);

  // Varios destinatarios → BCC para no exponer la lista. Uno → `to` directo.
  if (recipients.length === 1) {
    return sendEmail({ to: recipients[0]!, subject: emailSubject, html, text });
  }
  return sendEmail({
    to: process.env.BREVO_FROM_EMAIL ?? recipients[0]!,
    bcc: recipients,
    subject: emailSubject,
    html,
    text,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderText(
  input: SupportNotificationInput,
  conversationUrl: string,
): string {
  const prefix = input.isFromOpener ? "Nueva consulta de soporte" : "Respuesta en soporte";
  return [
    `${prefix} en Atribuya.`,
    "",
    `Asunto: ${input.subject}`,
    `De: ${input.authorName}`,
    "",
    input.messagePreview,
    "",
    `Ver conversación: ${conversationUrl}`,
    "",
    `Atribuya`,
  ].join("\n");
}

function renderHtml(
  input: SupportNotificationInput,
  conversationUrl: string,
): string {
  const safeSubject = escapeHtml(input.subject);
  const safeAuthor = escapeHtml(input.authorName);
  const safePreview = escapeHtml(input.messagePreview);
  const isNew = input.isFromOpener;
  const headerLabel = isNew ? "Nueva consulta" : "Respuesta recibida";
  const accentColor = isNew ? "#2563eb" : "#059669";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${headerLabel}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f5f3ee;">${safeAuthor}: ${safePreview.slice(0, 100)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f3ee;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:100%;">
        <tr><td style="padding:0 8px 28px 8px;">
          <a href="${input.appBase}" style="text-decoration:none;border:0;outline:none;"><img src="${input.appBase}/brand/logo-horizontal.png" alt="Atribuya" width="200" style="width:200px;max-width:60%;height:auto;display:block;border:0;outline:none;text-decoration:none;"></a>
          <div style="margin-top:18px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${accentColor};font-weight:700;">Soporte · ${headerLabel}</div>
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:36px 40px;">
          <h1 style="margin:0 0 8px 0;font-size:20px;line-height:1.3;font-weight:700;letter-spacing:-0.015em;color:#111111;">${safeSubject}</h1>
          <p style="margin:0 0 22px 0;font-size:13px;color:#888888;">De: ${safeAuthor}</p>

          <div style="padding:18px 20px;background:#fafaf8;border:1px solid #e5e5e5;border-radius:10px;">
            <p style="margin:0;font-size:14px;line-height:1.6;color:#333333;white-space:pre-wrap;">${safePreview}</p>
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
            <tr><td style="border-radius:8px;background:#111111;">
              <a href="${conversationUrl}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.005em;">Ver conversación →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 8px 0 8px;font-size:11.5px;line-height:1.6;color:#a8a294;">
          Recibes este correo porque participas en esta conversación de soporte.
          <br><br>
          Atribuya
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
