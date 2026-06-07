"use client";

import Link from "next/link";

type Locale = "es" | "en";

const STRINGS = {
  es: {
    title: "Cookies analíticas",
    body: "Usamos Google Analytics para entender cómo se usa esta web y mejorarla. No se carga nada hasta que lo aceptes. Puedes cambiar de opinión cuando quieras desde el enlace «Cookies» del pie de página.",
    privacy: "Más información",
    accept: "Aceptar",
    reject: "Rechazar",
  },
  en: {
    title: "Analytics cookies",
    body: "We use Google Analytics to understand how this site is used and improve it. Nothing loads until you accept. You can change your mind anytime from the “Cookies” link in the footer.",
    privacy: "Learn more",
    accept: "Accept",
    reject: "Decline",
  },
} as const;

export function CookieBanner({
  locale,
  onAccept,
  onReject,
}: {
  locale: Locale;
  onAccept: () => void;
  onReject: () => void;
}) {
  const t = STRINGS[locale];

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t.title}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-ink">{t.title}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-3">
            {t.body}{" "}
            <Link
              href="/privacidad"
              className="font-medium text-ink-2 underline underline-offset-2 transition hover:text-ink"
            >
              {t.privacy}
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={onReject}
            className="rounded-full border border-line bg-white px-5 py-2.5 text-[14px] font-semibold text-ink-2 transition hover:border-line-strong hover:text-ink"
          >
            {t.reject}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-ink-2"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
