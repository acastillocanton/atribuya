"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitLead, type SubmitLeadResult } from "@/app/actions/submit-lead";

export type LeadFormLocale = "es" | "en";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string; fieldErrors?: Record<string, string> }
  | { kind: "success" };

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-4 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10";

const labelClass = "block text-[13px] font-semibold text-ink-2 mb-1.5";

const DICTS = {
  es: {
    successTitle: "✓ Gracias. Te contactamos en menos de 24h.",
    successBody: "Hemos recibido tu mensaje. Mientras tanto, si quieres adelantar algo puedes escribir directamente a",
    honeypotLabel: "No rellenes este campo",
    name: "Tu nombre",
    namePh: "Ana Pérez",
    company: "Empresa",
    companyPh: "Promotora Ejemplo SL",
    email: "Email profesional",
    emailPh: "ana@empresa.com",
    phone: "Teléfono",
    phonePh: "600 123 456",
    message: "¿Qué te interesa?",
    messageOpt: "(opcional)",
    messagePh: "Sector, número de comerciales, qué problema queréis resolver…",
    cta: "Quiero saber quién me genera negocio",
    ctaSending: "Enviando…",
    consent1: "Al enviar aceptas que te contactemos por email para coordinar la demo. No compartimos tus datos con terceros. Más en nuestra",
    consent2: "política de privacidad",
    privacyHref: "/privacidad",
    thanksHref: "/gracias",
  },
  en: {
    successTitle: "✓ Thanks. We'll get back to you within 24h.",
    successBody: "We received your message. Meanwhile, feel free to write directly to",
    honeypotLabel: "Do not fill this field",
    name: "Your name",
    namePh: "Ana Pérez",
    company: "Company",
    companyPh: "Example Real Estate LLC",
    email: "Work email",
    emailPh: "ana@company.com",
    phone: "Phone",
    phonePh: "+34 600 123 456",
    message: "What's your situation?",
    messageOpt: "(optional)",
    messagePh: "Industry, number of sales reps, the problem you want to solve…",
    cta: "Show me who drives my business",
    ctaSending: "Sending…",
    consent1: "By submitting you accept that we contact you by email to schedule the demo. We don't share your data with third parties. More in our",
    consent2: "privacy policy",
    privacyHref: "/privacidad",
    thanksHref: "/en/thanks",
  },
} as const;

export function LeadForm({ locale = "es" }: { locale?: LeadFormLocale }) {
  const t = DICTS[locale];
  const router = useRouter();
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setState({ kind: "submitting" });
      const res: SubmitLeadResult = await submitLead(formData);
      if (res.ok) {
        // Mostramos el éxito inline como fallback inmediato y navegamos a la
        // página de gracias (URL propia: medible como conversión).
        setState({ kind: "success" });
        router.push(t.thanksHref);
        return;
      }
      setState({
        kind: "error",
        message: res.error,
        fieldErrors: res.fieldErrors,
      });
    });
  }

  if (state.kind === "success") {
    return (
      <div className="rounded-lg border border-ok bg-ok-bg p-6">
        <p className="text-base font-semibold text-ok">{t.successTitle}</p>
        <p className="mt-2 text-sm text-ink-2">
          {t.successBody}{" "}
          <a
            href="mailto:hola@atribuya.com"
            className="font-medium text-ink underline"
          >
            hola@atribuya.com
          </a>
          .
        </p>
      </div>
    );
  }

  const fieldErrors = state.kind === "error" ? state.fieldErrors ?? {} : {};
  const generalError = state.kind === "error" ? state.message : null;

  return (
    <form action={handleSubmit} className="space-y-4" noValidate>
      {/* Locale hidden — el server action lo lee para devolver mensajes
          de error en el idioma adecuado. */}
      <input type="hidden" name="locale" value={locale} />

      {/* Honeypot: campo invisible para humanos, irresistible para bots. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">
          {t.honeypotLabel}
          <input
            id="website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className={labelClass}>
            {t.name}
          </label>
          <input
            id="lead-name"
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder={t.namePh}
            className={inputClass}
            disabled={pending}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="lead-company" className={labelClass}>
            {t.company}
          </label>
          <input
            id="lead-company"
            type="text"
            name="company"
            required
            autoComplete="organization"
            placeholder={t.companyPh}
            className={inputClass}
            disabled={pending}
          />
          {fieldErrors.company && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.company}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-email" className={labelClass}>
            {t.email}
          </label>
          <input
            id="lead-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={t.emailPh}
            className={inputClass}
            disabled={pending}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="lead-phone" className={labelClass}>
            {t.phone}
          </label>
          <input
            id="lead-phone"
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            placeholder={t.phonePh}
            className={inputClass}
            disabled={pending}
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="lead-message" className={labelClass}>
          {t.message} <span className="font-normal text-ink-3">{t.messageOpt}</span>
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={4}
          placeholder={t.messagePh}
          className={`${inputClass} resize-y`}
          disabled={pending}
        />
        {fieldErrors.message && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>
        )}
      </div>

      {generalError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-ink-2 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {pending ? t.ctaSending : t.cta}
      </button>
      <p className="text-xs text-ink-3">
        {t.consent1}{" "}
        <a href={t.privacyHref} className="underline">
          {t.consent2}
        </a>
        .
      </p>
    </form>
  );
}
