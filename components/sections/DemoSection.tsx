import { LeadForm } from "@/components/landing/LeadForm";
import type { Locale } from "@/lib/marketing/nav";

const T = {
  es: {
    heading: (
      <>
        <em className="font-light text-accent">¿Quieres saber</em>
        <br />
        quién de tu equipo te genera negocio?
      </>
    ),
    lead: "Respondemos en menos de 24 h. La demo dura 20 minutos: te enseñamos la app en vivo con datos de ejemplo y vemos si encaja en tu equipo.",
  },
  en: {
    heading: (
      <>
        <em className="font-light text-accent">Want to know</em>
        <br />
        who on your team drives the business?
      </>
    ),
    lead: "We reply within 24 h. The demo lasts 20 minutes: we walk you through the live app with sample data and see if it fits your team.",
  },
} as const;

export function DemoSection({ locale }: { locale: Locale }) {
  const t = T[locale];
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <h2
        className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
        style={{ fontSize: "var(--text-h2)" }}
      >
        {t.heading}
      </h2>
      <p
        className="mt-5 max-w-xl leading-relaxed text-ink-2"
        style={{ fontSize: "var(--text-lead)" }}
      >
        {t.lead}
      </p>
      <div className="mt-10">
        <LeadForm locale={locale} />
      </div>
    </div>
  );
}
