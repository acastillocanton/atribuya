import "server-only";
import { sendEmail } from "./brevo";

/**
 * Entrega el lead magnet (Plantilla Excel de atribución de reseñas) al usuario
 * que lo pide desde `/recursos/plantilla-atribucion-resenas`. El archivo vive
 * en `public/` y se sirve como descarga directa, así que aquí solo mandamos el
 * enlace (Brevo/Nodemailer no lleva adjuntos en este wrapper). El enlace es la
 * confirmación de que el email es real y arranca la relación en su bandeja.
 *
 * Best-effort: el caller lo invoca en try/catch. El lead ya está guardado y la
 * página muestra además un botón de descarga directa como fallback inmediato,
 * así que un fallo de email no deja al usuario sin plantilla.
 */

const ORIGIN = "https://atribuya.com";
const DOWNLOAD_PATH = "/recursos/plantilla-atribucion-resenas-google.xlsx";
const DEMO_PATH = "/demo";

export type DeliverLeadMagnetInput = {
  to: string;
  name: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function deliverLeadMagnet({ to, name }: DeliverLeadMagnetInput) {
  const url = `${ORIGIN}${DOWNLOAD_PATH}`;
  const subject = "Tu plantilla de atribución de reseñas de Google";
  return sendEmail({
    to,
    subject,
    html: renderHtml(name, url),
    text: renderText(name, url),
  });
}

function renderText(name: string, url: string): string {
  return [
    `Hola ${name},`,
    "",
    "Aquí tienes tu plantilla de atribución de reseñas de Google. Descárgala desde este enlace:",
    url,
    "",
    "Con ella puedes registrar qué comercial ha conseguido cada reseña y ver un ranking automático de tu equipo, sin pedirle el nombre del vendedor al cliente.",
    "",
    `Cuando tengas demasiadas reseñas para llevarlo a mano, Atribuya lo hace solo. Pide una demo: ${ORIGIN}${DEMO_PATH}`,
    "",
    "Un producto de Castillo Cantón · atribuya.com",
  ].join("\n");
}

function renderHtml(rawName: string, url: string): string {
  const name = escapeHtml(rawName);
  const demo = `${ORIGIN}${DEMO_PATH}`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>Tu plantilla de atribución de reseñas</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f3ee;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:100%;">
        <tr><td style="background:#ffffff;border:1px solid #e9e4d8;border-radius:12px;padding:36px 40px;">
          <h1 style="margin:0 0 8px 0;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-0.015em;color:#111111;">Aquí tienes tu plantilla</h1>
          <p style="margin:0 0 24px 0;font-size:14.5px;line-height:1.6;color:#555555;">Hola ${name}, gracias por descargarla. Con esta plantilla puedes registrar qué comercial ha conseguido cada reseña de Google y ver un ranking automático de tu equipo, sin pedirle el nombre del vendedor al cliente.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:9999px;background:#A84A2A;">
            <a href="${url}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:9999px;">Descargar la plantilla</a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:13.5px;line-height:1.6;color:#8a8478;">Cuando tengas demasiadas reseñas para llevarlo a mano, Atribuya lo hace solo: cada comercial comparte su enlace personal y cada reseña queda atribuida sin Excel. <a href="${demo}" style="color:#A84A2A;text-decoration:none;font-weight:600;">Pide una demo</a>.</p>
        </td></tr>
        <tr><td style="padding:24px 8px 0 8px;font-size:11.5px;line-height:1.6;color:#a8a294;">
          Un producto de Castillo Cantón · atribuya.com
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
