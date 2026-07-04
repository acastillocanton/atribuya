import Link from "next/link";
import { routes, type Locale } from "@/lib/marketing/nav";

const T = {
  es: {
    heading: (
      <>
        <em className="font-light text-accent">Explora</em> Atribuya.
      </>
    ),
    more: "Ver más",
    cards: [
      {
        href: routes.es.product,
        title: "El producto por dentro",
        body: "Pantallas reales del panel del admin, el ranking del equipo y la vista de cada comercial.",
      },
      {
        href: routes.es.pricing,
        title: "Precios",
        body: "Un plan por tamaño de equipo desde 45 €/mes. Todas las funciones en todos los planes.",
      },
      {
        href: routes.es.cases,
        title: "Casos reales",
        body: "Cómo una promotora recuperó 8 horas al mes y acabó con las discusiones de atribución.",
      },
    ],
  },
  en: {
    heading: (
      <>
        <em className="font-light text-accent">Explore</em> Atribuya.
      </>
    ),
    more: "Learn more",
    cards: [
      {
        href: routes.en.product,
        title: "Inside the product",
        body: "Real screens of the admin dashboard, the team ranking and each rep's own view.",
      },
      {
        href: routes.en.pricing,
        title: "Pricing",
        body: "One plan per team size from €45/month. Every feature on every plan.",
      },
      {
        href: routes.en.cases,
        title: "Case studies",
        body: "How a developer got back 8 hours a month and ended attribution arguments.",
      },
    ],
  },
} as const;

export function HubTeasers({ locale }: { locale: Locale }) {
  const t = T[locale];
  return (
    <section
      aria-label={locale === "es" ? "Explora Atribuya" : "Explore Atribuya"}
      className="mx-auto max-w-6xl px-5 py-16 sm:py-24"
    >
      <h2
        className="max-w-2xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
        style={{ fontSize: "var(--text-h2)" }}
      >
        {t.heading}
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {t.cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col rounded-2xl border border-line bg-white p-7 transition hover:border-line-strong hover:shadow-card"
          >
            <h3
              className="font-display font-medium leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-h3)" }}
            >
              {c.title}
            </h3>
            <p className="mt-3 flex-1 leading-relaxed text-ink-2">{c.body}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
              {t.more}
              <svg
                className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
