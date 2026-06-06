"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Server action que recibe el formulario de captación de leads en la
 * landing pública `/`. Trabaja siempre con cliente service-role: la tabla
 * `leads` no tiene policy de INSERT para anon/authenticated (migración 014),
 * así que el insert SOLO funciona con bypass de RLS.
 *
 * Anti-spam de bajo coste sin captcha:
 *   - Honeypot: campo `website` oculto por CSS, los humanos lo dejan vacío,
 *     muchos bots lo rellenan. Si llega con valor, simulamos éxito (200 OK)
 *     pero no insertamos — así el bot no detecta la trampa.
 *   - Validación Zod estricta: nombres/empresas mínimo 2 caracteres, email
 *     bien formado, mensaje limitado a 2000 chars.
 *
 * Si el spam escala, el siguiente paso es Cloudflare Turnstile (gratis,
 * sin tracking, drop-in) — no captcha visible.
 */

type Locale = "es" | "en";

function normalizeLocale(raw: unknown): Locale {
  return raw === "en" ? "en" : "es";
}

const MESSAGES = {
  es: {
    nameShort: "Nombre demasiado corto.",
    nameLong: "Nombre demasiado largo.",
    emailInvalid: "Email no válido.",
    companyShort: "Nombre de empresa demasiado corto.",
    companyLong: "Nombre de empresa demasiado largo.",
    messageLong: "Mensaje demasiado largo.",
    reviewFields: "Revisa los datos del formulario.",
    retry: "No se pudo enviar el mensaje. Inténtalo de nuevo en un momento.",
  },
  en: {
    nameShort: "Name is too short.",
    nameLong: "Name is too long.",
    emailInvalid: "Invalid email address.",
    companyShort: "Company name is too short.",
    companyLong: "Company name is too long.",
    messageLong: "Message is too long.",
    reviewFields: "Please review the form fields.",
    retry: "Could not send the message. Please try again in a moment.",
  },
} as const;

function makeSchema(locale: Locale) {
  const m = MESSAGES[locale];
  return z.object({
    name: z.string().trim().min(2, m.nameShort).max(120, m.nameLong),
    email: z.string().trim().toLowerCase().email(m.emailInvalid).max(160),
    company: z.string().trim().min(2, m.companyShort).max(200, m.companyLong),
    message: z
      .string()
      .trim()
      .max(2000, m.messageLong)
      .optional()
      .transform((v) => (v && v.length > 0 ? v : null)),
  });
}

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Acepta el FormData directamente para simplificar el cliente (un único
 * `<form action={submitLead}>`). No usa `useActionState` para mantener la
 * forma consistente con el resto del proyecto (useTransition + useState).
 */
export async function submitLead(formData: FormData): Promise<SubmitLeadResult> {
  // Honeypot: campo "website" debe llegar vacío. Si tiene algo, es un bot.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    // Devolvemos éxito para no dar pistas al scraper.
    return { ok: true };
  }

  const locale = normalizeLocale(formData.get("locale"));
  const m = MESSAGES[locale];

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    company: String(formData.get("company") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = makeSchema(locale).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString() ?? "_";
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: m.reviewFields, fieldErrors };
  }

  // Metadata de la petición — útil para detectar spam en revisión manual
  // y para correlacionar con logs si llega el caso.
  const hdrs = await headers();
  const userAgent = hdrs.get("user-agent") || null;
  const fwd = hdrs.get("x-forwarded-for");
  // x-forwarded-for puede traer varias IPs en cadena ("client, proxy1, proxy2").
  // La primera es la del cliente real (cuando viene tras Vercel/Cloudflare).
  const ipFromFwd = fwd ? fwd.split(",")[0]?.trim() || null : null;
  const ip = ipFromFwd || hdrs.get("x-real-ip") || null;

  const supabase = createServiceClient();
  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company,
    message: parsed.data.message,
    source: locale === "en" ? "landing-en" : "landing",
    user_agent: userAgent,
    ip,
  });

  if (error) {
    // No filtramos detalles del error al cliente. Lo logueamos a server
    // (Vercel captura console.error en sus logs).
    console.error("submitLead insert failed", error);
    return {
      ok: false,
      error: m.retry,
    };
  }

  return { ok: true };
}
