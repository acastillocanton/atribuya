import "server-only";
import { sendEmail } from "./brevo";

/**
 * Email de bienvenida al primer admin de una organización recién creada (o a
 * un admin adicional invitado más tarde desde `/super`). Contiene el enlace
 * mágico de acceso de un solo uso (`/auth/confirm?...&type=invite`).
 *
 * Best-effort: el caller (inviteOrgAdmin) lo invoca sin dejar que un fallo de
 * email rompa la invitación — el enlace también se devuelve a la UI para que
 * el super_admin pueda copiarlo y pasarlo a mano si el correo no llega.
 *
 * Reply-to por defecto (BREVO_REPLY_TO) para que el nuevo admin pueda
 * responder con dudas a un buzón que se lee.
 */

export type InvitedAdminNotificationInput = {
  /** Email del nuevo admin (destinatario). */
  adminEmail: string;
  /** Nombre completo del admin — para el saludo. */
  adminName: string;
  /** Nombre comercial de la organización a la que se le da acceso. */
  orgName: string;
  /** Enlace mágico de un solo uso para completar el acceso. */
  inviteLink: string;
  /** Base URL para el logo y enlaces absolutos. */
  appBase: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function notifyInvitedAdmin(input: InvitedAdminNotificationInput) {
  const firstName = input.adminName.split(" ")[0] || input.adminName;
  const subject = `Tu acceso a Atribuya (${input.orgName})`;

  const html = renderHtml(input, firstName);
  const text = renderText(input, firstName);

  return sendEmail({
    to: input.adminEmail,
    subject,
    html,
    text,
  });
}

function renderText(input: InvitedAdminNotificationInput, firstName: string): string {
  return [
    `Hola, ${firstName}.`,
    "",
    `Te hemos dado de alta como administrador de "${input.orgName}" en Atribuya, la plataforma para atribuir reseñas de Google a tu equipo comercial.`,
    "",
    `Entra por este enlace para crear tu acceso (es de un solo uso):`,
    input.inviteLink,
    "",
    `Si el enlace caduca, pídenos uno nuevo.`,
    "",
    "Atribuya",
  ].join("\n");
}

function renderHtml(input: InvitedAdminNotificationInput, firstName: string): string {
  const safeFirstName = escapeHtml(firstName);
  const safeOrg = escapeHtml(input.orgName);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>Tu acceso a Atribuya</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f5f3ee;">Te hemos dado acceso de administrador a ${safeOrg} en Atribuya.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f3ee;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:100%;">
        <tr><td style="padding:0 8px 28px 8px;">
          <a href="${input.appBase}" style="text-decoration:none;border:0;outline:none;">
            <img src="${input.appBase}/brand/logo-horizontal.png" alt="Atribuya" width="200" style="width:200px;max-width:60%;height:auto;display:block;border:0;outline:none;text-decoration:none;">
          </a>
          <div style="margin-top:18px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8a8478;font-weight:600;">Atribuya · Invitación</div>
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #e9e4d8;border-radius:12px;padding:36px 40px;">
          <h1 style="margin:0 0 8px 0;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-0.015em;color:#111111;">Te damos la bienvenida, ${safeFirstName}.</h1>
          <p style="margin:0 0 22px 0;font-size:14.5px;line-height:1.6;color:#555555;">Te hemos dado de alta como administrador de <strong>${safeOrg}</strong> en Atribuya, la plataforma que atribuye las reseñas de Google a cada comercial de tu equipo.</p>

          <div style="padding:18px 20px;background:#f8f6f0;border:1px solid #ece8df;border-radius:10px;">
            <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#a8a294;font-weight:600;">Tu primer paso</div>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:#333333;">Pulsa el botón para crear tu acceso. El enlace es personal y de un solo uso.</p>
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
            <tr><td style="border-radius:8px;background:#111111;">
              <a href="${input.inviteLink}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.005em;">Crear mi acceso →</a>
            </td></tr>
          </table>

          <p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#a8a294;">¿El botón no funciona? Copia y pega esta dirección en tu navegador:<br><span style="color:#8a8478;word-break:break-all;">${input.inviteLink}</span></p>
        </td></tr>
        <tr><td style="padding:24px 8px 0 8px;font-size:11.5px;line-height:1.6;color:#a8a294;">
          Recibes este correo porque alguien te ha invitado a administrar una cuenta en Atribuya. Si crees que es un error, ignóralo.
          <br><br>
          Atribuya
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
