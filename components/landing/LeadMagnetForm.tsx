"use client";

import { useState, useTransition } from "react";
import {
  submitLeadMagnet,
  type SubmitLeadMagnetResult,
} from "@/app/actions/submit-lead-magnet";
import { trackEvent } from "@/lib/gtag";

export type LeadMagnetFormLocale = "es" | "en";

type FormState =
  | { kind: "idle" }
  | { kind: "error"; message: string; fieldErrors?: Record<string, string> }
  | { kind: "success"; downloadUrl: string };

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-3 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelClass = "block text-[13px] font-semibold text-ink-2 mb-1.5";

const DICTS = {
  es: {
    successTitle: "✓ Lista para descargar",
    successBody: "Te la hemos enviado también a tu email por si quieres tenerla a mano.",
    download: "Descargar la plantilla",
    name: "Tu nombre",
    namePh: "Ana Pérez",
    email: "Email profesional",
    emailPh: "ana@empresa.com",
    honeypotLabel: "No rellenes este campo",
    cta: "Descargar la plantilla gratis",
    ctaSending: "Preparando…",
    legal1:
      "De conformidad con el RGPD (UE) 2016/679, los datos que facilitas serán tratados por Atribuya.com para enviarte la plantilla y contactarte sobre el producto. La base legal es tu consentimiento al enviar este formulario. No cedemos tus datos a terceros salvo obligación legal. Puedes acceder, rectificar y suprimir tus datos, como se explica en nuestra ",
    legalPrivacy: "política de privacidad",
    legal2: ". Para ejercer tus derechos, escribe a ",
    privacyHref: "/privacidad",
  },
  en: {
    successTitle: "✓ Ready to download",
    successBody: "We also sent it to your email so you have it handy.",
    download: "Download the template",
    name: "Your name",
    namePh: "Ana Pérez",
    email: "Work email",
    emailPh: "ana@company.com",
    honeypotLabel: "Do not fill this field",
    cta: "Download the free template",
    ctaSending: "Preparing…",
    legal1:
      "In accordance with the GDPR (EU) 2016/679, the data you provide will be processed by Atribuya.com to send you the template and to contact you about the product. The legal basis is your consent when submitting this form. We do not share your data with third parties except by legal obligation. You can access, rectify and erase your data, as explained in our ",
    legalPrivacy: "privacy policy",
    legal2: ". To exercise your rights, write to ",
    privacyHref: "/en/privacy",
  },
} as const;

export function LeadMagnetForm({ locale = "es" }: { locale?: LeadMagnetFormLocale }) {
  const t = DICTS[locale];
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res: SubmitLeadMagnetResult = await submitLeadMagnet(formData);
      if (res.ok) {
        // Conversión: descarga de lead magnet. No-op sin consentimiento de cookies.
        trackEvent("download_lead_magnet", {
          magnet: "plantilla-atribucion-resenas",
          locale,
        });
        setState({ kind: "success", downloadUrl: res.downloadUrl });
        return;
      }
      setState({ kind: "error", message: res.error, fieldErrors: res.fieldErrors });
    });
  }

  if (state.kind === "success") {
    return (
      <div className="rounded-lg border border-ok bg-ok-bg p-6">
        <p className="text-base font-semibold text-ok">{t.successTitle}</p>
        <p className="mt-2 text-sm text-ink-2">{t.successBody}</p>
        <a
          href={state.downloadUrl}
          download
          className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-strong"
        >
          {t.download}
        </a>
      </div>
    );
  }

  const fieldErrors = state.kind === "error" ? state.fieldErrors ?? {} : {};
  const generalError = state.kind === "error" ? state.message : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="locale" value={locale} />

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden"
      >
        <label htmlFor="lm-website">
          {t.honeypotLabel}
          <input id="lm-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="lm-name" className={labelClass}>
          {t.name}
        </label>
        <input
          id="lm-name"
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder={t.namePh}
          className={inputClass}
          disabled={pending}
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="lm-email" className={labelClass}>
          {t.email}
        </label>
        <input
          id="lm-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t.emailPh}
          className={inputClass}
          disabled={pending}
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
      </div>

      {generalError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-strong disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {pending ? t.ctaSending : t.cta}
      </button>

      <p className="text-xs leading-relaxed text-ink-3">
        {t.legal1}
        <a href={t.privacyHref} className="underline">
          {t.legalPrivacy}
        </a>
        {t.legal2}
        <a href="mailto:alejandro@atribuya.com" className="underline">
          alejandro@atribuya.com
        </a>
        .
      </p>
    </form>
  );
}
