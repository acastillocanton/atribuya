"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { deliverLeadMagnet } from "@/lib/email/deliver-lead-magnet";

/**
 * Server action del lead magnet (Plantilla Excel de atribución de reseñas),
 * servido en `/recursos/plantilla-atribucion-resenas`. Comparte tabla e
 * infraestructura con el formulario de demo (`submit-lead.ts`), pero:
 *   - Pide solo nombre + email (fricción mínima, es captación TOFU).
 *   - Guarda con `source = "lead-magnet:..."` para distinguirlo de la demo.
 *   - Entrega la plantilla por email (best-effort) y devuelve la URL de
 *     descarga para que la página la ofrezca también como botón directo.
 *
 * `leads.company` es NOT NULL (migración 014). Como el magnet no pide empresa,
 * insertamos un valor centinela claro para no romper la restricción sin
 * ensuciar los datos: el `source` ya identifica el origen real.
 *
 * Anti-spam: honeypot `website` (igual que `submit-lead.ts`) + Zod estricto.
 */

const DOWNLOAD_PATH = "/recursos/plantilla-atribucion-resenas-google.xlsx";
const SOURCE = "lead-magnet:plantilla-atribucion-resenas";
const COMPANY_SENTINEL = "Descarga de plantilla";

type Locale = "es" | "en";

function normalizeLocale(raw: unknown): Locale {
  return raw === "en" ? "en" : "es";
}

const MESSAGES = {
  es: {
    nameShort: "Nombre demasiado corto.",
    nameLong: "Nombre demasiado largo.",
    emailInvalid: "Email no válido.",
    reviewFields: "Revisa los datos del formulario.",
    retry: "No se pudo procesar la descarga. Inténtalo de nuevo en un momento.",
  },
  en: {
    nameShort: "Name is too short.",
    nameLong: "Name is too long.",
    emailInvalid: "Invalid email address.",
    reviewFields: "Please review the form fields.",
    retry: "Could not process the download. Please try again in a moment.",
  },
} as const;

function makeSchema(locale: Locale) {
  const m = MESSAGES[locale];
  return z.object({
    // regex anti-CRLF: el nombre acaba en el cuerpo del email de entrega.
    name: z.string().trim().min(2, m.nameShort).max(120, m.nameLong).regex(/^[^\r\n]+$/, m.nameLong),
    email: z.string().trim().toLowerCase().email(m.emailInvalid).max(160),
  });
}

export type SubmitLeadMagnetResult =
  | { ok: true; downloadUrl: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function submitLeadMagnet(formData: FormData): Promise<SubmitLeadMagnetResult> {
  // Honeypot: si "website" llega con valor, es un bot. Simulamos éxito.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    return { ok: true, downloadUrl: DOWNLOAD_PATH };
  }

  const locale = normalizeLocale(formData.get("locale"));
  const m = MESSAGES[locale];

  const parsed = makeSchema(locale).safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString() ?? "_";
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: m.reviewFields, fieldErrors };
  }

  const hdrs = await headers();
  const userAgent = hdrs.get("user-agent") || null;
  const fwd = hdrs.get("x-forwarded-for");
  const ipFromFwd = fwd ? fwd.split(",")[0]?.trim() || null : null;
  const ip = ipFromFwd || hdrs.get("x-real-ip") || null;

  const supabase = createServiceClient();
  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: COMPANY_SENTINEL,
    source: SOURCE,
    user_agent: userAgent,
    ip,
  });

  if (error) {
    console.error("submitLeadMagnet insert failed", error);
    return { ok: false, error: m.retry };
  }

  // Entrega por email best-effort. La página ofrece además el botón de descarga
  // directa, así que un fallo de email no deja al usuario sin la plantilla.
  try {
    await deliverLeadMagnet({ to: parsed.data.email, name: parsed.data.name });
  } catch (deliverErr) {
    console.error("submitLeadMagnet deliver failed", deliverErr);
  }

  return { ok: true, downloadUrl: DOWNLOAD_PATH };
}
