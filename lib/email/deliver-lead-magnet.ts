import "server-only";
import { sendEmail } from "./brevo";

/**
 * Entrega un lead magnet al usuario que lo pide desde su página de recurso
 * (`/recursos/...`). Los archivos viven en `public/` y se sirven como descarga
 * directa, así que aquí solo mandamos el enlace (Brevo/Nodemailer no lleva
 * adjuntos en este wrapper). El enlace es la confirmación de que el email es
 * real y arranca la relación en su bandeja.
 *
 * Best-effort: el caller lo invoca en try/catch. El lead ya está guardado y la
 * página muestra además un botón de descarga directa como fallback inmediato,
 * así que un fallo de email no deja al usuario sin su descarga.
 */

const ORIGIN = "https://atribuya.com";
const DEMO_PATH = "/demo";

type MagnetId = "plantilla-atribucion-resenas" | "plantillas-respuesta-resenas";

const MAGNET_COPY: Record<
  MagnetId,
  { downloadPath: string; subject: string; title: string; intro: string; button: string }
> = {
  "plantilla-atribucion-resenas": {
    downloadPath: "/recursos/plantilla-atribucion-resenas-google.xlsx",
    subject: "Tu plantilla de atribución de reseñas de Google",
    title: "Aquí tienes tu plantilla",
    intro:
      "gracias por descargarla. Con esta plantilla puedes registrar qué comercial ha conseguido cada reseña de Google y ver un ranking automático de tu equipo, sin pedirle el nombre del vendedor al cliente.",
    button: "Descargar la plantilla",
  },
  "plantillas-respuesta-resenas": {
    downloadPath: "/recursos/plantillas-respuesta-resenas-google.docx",
    subject: "Tu pack de plantillas de respuesta a reseñas de Google",
    title: "Aquí tienes tu pack de plantillas",
    intro:
      "gracias por descargarlo. Son 20 respuestas listas para adaptar: positivas, negativas, casos delicados y sectores con confidencialidad. Recuerda la regla de oro: cambia los corchetes y añade siempre un detalle real de tu negocio.",
    button: "Descargar el pack",
  },
};

export type DeliverLeadMagnetInput = {
  to: string;
  name: string;
  magnet?: MagnetId;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function deliverLeadMagnet({
  to,
  name,
  magnet = "plantilla-atribucion-resenas",
}: DeliverLeadMagnetInput) {
  const copy = MAGNET_COPY[magnet];
  const url = `${ORIGIN}${copy.downloadPath}`;
  return sendEmail({
    to,
    subject: copy.subject,
    html: renderHtml(name, url, copy),
    text: renderText(name, url, copy),
  });
}

function renderText(name: string, url: string, copy: (typeof MAGNET_COPY)[MagnetId]): string {
  return [
    `Hola ${name},`,
    "",
    `${copy.intro.charAt(0).toUpperCase()}${copy.intro.slice(1)} Descarga desde este enlace:`,
    url,
    "",
    `Cuando tengas demasiadas reseñas para llevarlo a mano, Atribuya lo hace solo. Pide una demo: ${ORIGIN}${DEMO_PATH}`,
    "",
    "Un producto de Castillo Cantón · atribuya.com · alejandro@atribuya.com",
  ].join("\n");
}

function renderHtml(rawName: string, url: string, copy: (typeof MAGNET_COPY)[MagnetId]): string {
  const name = escapeHtml(rawName);
  const demo = `${ORIGIN}${DEMO_PATH}`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f3ee;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:100%;">
        <tr><td style="background:#ffffff;border:1px solid #e9e4d8;border-radius:12px;padding:36px 40px;">
          <h1 style="margin:0 0 8px 0;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-0.015em;color:#111111;">${escapeHtml(copy.title)}</h1>
          <p style="margin:0 0 24px 0;font-size:14.5px;line-height:1.6;color:#555555;">Hola ${name}, ${escapeHtml(copy.intro)}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:9999px;background:#A84A2A;">
            <a href="${url}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:9999px;">${escapeHtml(copy.button)}</a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:13.5px;line-height:1.6;color:#8a8478;">Cuando tengas demasiadas reseñas para llevarlo a mano, Atribuya lo hace solo: cada comercial comparte su enlace personal y cada reseña queda atribuida sin Excel. <a href="${demo}" style="color:#A84A2A;text-decoration:none;font-weight:600;">Pide una demo</a>.</p>
        </td></tr>
        <tr><td style="padding:24px 8px 0 8px;font-size:11.5px;line-height:1.6;color:#a8a294;">
          Un producto de Castillo Cantón · atribuya.com · alejandro@atribuya.com
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
