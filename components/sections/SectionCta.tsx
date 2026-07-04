import Link from "next/link";
import { ctaLabel, routes, type Locale } from "@/lib/marketing/nav";

const T = {
  es: {
    heading: "¿Quieres verlo con tus datos?",
    lead: "La demo dura 20 minutos. Te enseñamos la app en vivo y vemos si encaja en tu equipo.",
  },
  en: {
    heading: "Want to see it with your data?",
    lead: "The demo lasts 20 minutes. We walk you through the live app and see if it fits your team.",
  },
} as const;

export function SectionCta({ locale }: { locale: Locale }) {
  const t = T[locale];
  return (
    <section
      aria-label={t.heading}
      className="border-t border-line bg-white"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
        <div>
          <h2
            className="font-display font-medium leading-tight tracking-tight text-ink"
            style={{ fontSize: "var(--text-h3)" }}
          >
            {t.heading}
          </h2>
          <p className="mt-2 max-w-md leading-relaxed text-ink-2">{t.lead}</p>
        </div>
        <Link
          href={routes[locale].demo}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-accent-strong"
        >
          {ctaLabel[locale]}
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
