import "server-only";
import { sendEmail } from "./brevo";

/**
 * Aviso interno al super_admin cuando llega un lead por el formulario de la
 * landing pública. El lead ya está guardado en BD (es lo crítico); este email
 * es solo para enterarse rápido sin tener que mirar la tabla `leads`.
 *
 * Best-effort: el caller (submit-lead.ts) lo invoca en try/catch y nunca deja
 * que un fallo de email rompa la respuesta al visitante. Destinatario en
 * `LEAD_NOTIFY_EMAIL`; si falta, sendEmail degrada (no envía, no rompe).
 *
 * Reply-to apunta directamente al email del lead, así puedes responderle
 * pulsando "Responder" en tu cliente de correo.
 */

export type LeadNotificationInput = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string | null;
  /** "landing" | "landing-en" — de qué versión de la landing vino. */
  source: string;
  /** Metadatos de la petición, para contexto en revisión manual. */
  userAgent: string | null;
  ip: string | null;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function notifyLead(input: LeadNotificationInput) {
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!to) {
    console.warn("[notify-lead] LEAD_NOTIFY_EMAIL no configurado — saltando aviso de lead");
    return { ok: false as const, skipped: true, reason: "no_recipient" as const };
  }

  const subject = `🆕 Nuevo lead de ${input.company}`;

  const html = renderHtml(input);
  const text = renderText(input);

  return sendEmail({
    to,
    subject,
    html,
    text,
    // Responder al email = responder directamente al lead.
    replyTo: input.email,
  });
}

function renderText(input: LeadNotificationInput): string {
  return [
    `Nuevo lead recibido en la landing de Atribuya.`,
    "",
    `Nombre:   ${input.name}`,
    `Email:    ${input.email}`,
    `Teléfono: ${input.phone}`,
    `Empresa:  ${input.company}`,
    `Origen:   ${input.source}`,
    "",
    input.message ? `Mensaje:\n${input.message}` : "(Sin mensaje)",
    "",
    `IP: ${input.ip ?? "N/D"}`,
    `UA: ${input.userAgent ?? "N/D"}`,
  ].join("\n");
}

function renderHtml(input: LeadNotificationInput): string {
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const company = escapeHtml(input.company);
  const phone = escapeHtml(input.phone);
  const source = escapeHtml(input.source);
  const message = input.message ? escapeHtml(input.message) : null;
  const ip = input.ip ? escapeHtml(input.ip) : "N/D";
  const ua = input.userAgent ? escapeHtml(input.userAgent) : "N/D";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>Nuevo lead</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f3ee;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:100%;">
        <tr><td style="padding:0 8px 28px 8px;">
          <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#b35900;font-weight:700;">🆕 Nuevo lead · ${source}</div>
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #e9e4d8;border-radius:12px;padding:36px 40px;">
          <h1 style="margin:0 0 8px 0;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-0.015em;color:#111111;">${company}</h1>
          <p style="margin:0 0 22px 0;font-size:14.5px;line-height:1.6;color:#555555;">Han dejado sus datos en el formulario de la landing. Puedes responder directamente a este correo para contactar con el lead.</p>

          <div style="padding:18px 20px;background:#faf8f3;border:1px solid #e9e4d8;border-radius:10px;">
            <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#a8a294;font-weight:600;">Contacto</div>
            <div style="margin-top:8px;font-size:15px;font-weight:600;color:#1a1a1a;">${name}</div>
            <div style="margin-top:4px;font-size:13px;color:#8a8478;"><a href="mailto:${email}" style="color:#b35900;text-decoration:none;">${email}</a></div>
            <div style="margin-top:4px;font-size:13px;color:#8a8478;"><a href="tel:${phone}" style="color:#b35900;text-decoration:none;">${phone}</a></div>
            ${message ? `<p style="margin:14px 0 0;font-size:14px;line-height:1.55;color:#333333;">${message}</p>` : `<p style="margin:14px 0 0;font-size:13px;color:#a8a294;font-style:italic;">(Sin mensaje.)</p>`}
          </div>

          <div style="margin-top:16px;font-size:11.5px;line-height:1.6;color:#a8a294;">IP: ${ip}<br>UA: ${ua}</div>
        </td></tr>
        <tr><td style="padding:24px 8px 0 8px;font-size:11.5px;line-height:1.6;color:#a8a294;">
          Atribuya
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
