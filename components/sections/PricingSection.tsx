import Link from "next/link";
import { routes, type Locale } from "@/lib/marketing/nav";

type Plan = {
  name: string;
  equipo: string;
  fichas: string;
  price: string;
  tagline: string;
  featured: boolean;
};

// Datos de planes por idioma. Exportados para que la página /precios genere el
// JSON-LD SoftwareApplication desde la misma fuente que pinta las tarjetas.
export const plans: Record<Locale, Plan[]> = {
  es: [
    {
      name: "Básico",
      equipo: "Hasta 5 comerciales",
      fichas: "1 ficha de Google",
      price: "45",
      tagline: "La clínica o el local con un equipo pequeño.",
      featured: false,
    },
    {
      name: "Estándar",
      equipo: "Hasta 15 comerciales",
      fichas: "Hasta 3 fichas de Google",
      price: "99",
      tagline: "El concesionario o la promotora con red comercial.",
      featured: true,
    },
    {
      name: "Plus",
      equipo: "Hasta 30 comerciales",
      fichas: "Hasta 10 fichas de Google",
      price: "199",
      tagline: "La promotora grande o el grupo con varias sedes.",
      featured: false,
    },
  ],
  en: [
    {
      name: "Basic",
      equipo: "Up to 5 sales reps",
      fichas: "1 Google listing",
      price: "45",
      tagline: "A clinic or a single location with a small team.",
      featured: false,
    },
    {
      name: "Standard",
      equipo: "Up to 15 sales reps",
      fichas: "Up to 3 Google listings",
      price: "99",
      tagline: "The dealership or developer with a sales network.",
      featured: true,
    },
    {
      name: "Plus",
      equipo: "Up to 30 sales reps",
      fichas: "Up to 10 Google listings",
      price: "199",
      tagline: "The large developer or group with several sites.",
      featured: false,
    },
  ],
};

const included: Record<Locale, string[]> = {
  es: [
    "Reseñas ilimitadas, sin coste por reseña atribuida",
    "Atribución automática de reseñas por ventana temporal y similitud de nombre",
    "Dashboard de admin con métricas por comercial, ficha y ranking",
    "Panel personal de cada comercial con su objetivo y reseñas conseguidas",
    "Roles (admin, comercial, manager de reseñas) con permisos diferenciados",
    "Aislamiento total de datos con cifrado y backups diarios",
    "Conformidad RGPD y DPA firmado",
    "Implantación completa en pocos días laborables",
    "Formación de 30 minutos a tu equipo comercial",
    "Soporte por email con respuesta en menos de 24 horas",
    "Exportación completa de tus datos cuando quieras",
  ],
  en: [
    "Unlimited reviews, no cost per attributed review",
    "Automatic review attribution by time window and name similarity",
    "Admin dashboard with per-rep, per-listing metrics and ranking",
    "Personal panel for each rep with their target and earned reviews",
    "Roles (admin, sales rep, reviews manager) with separate permissions",
    "Full data isolation with encryption and daily backups",
    "GDPR compliant, signed DPA",
    "Full implementation in just a few business days",
    "30-minute training session for your sales team",
    "Email support with response within 24 hours",
    "Full data export whenever you want",
  ],
};

const T = {
  es: {
    heading: <>Un plan <em className="font-light">para cada tamaño.</em></>,
    lead: "Pagas según el tamaño de tu equipo comercial. Todas las funciones en todos los planes. Implantación llave en mano, suscripción mensual, cancelas cuando quieras.",
    popular: "Más elegido",
    planLabel: (n: string) => `Plan ${n}`,
    price: (p: string) => (
      <>
        <span className="font-display text-[2.5rem] font-medium leading-none tracking-tight text-ink sm:text-[3rem]">
          {p}&nbsp;€
        </span>
        <span className="text-[14px] text-ink-3">/ mes</span>
      </>
    ),
    setup: (
      <>
        + 129&nbsp;€ de implantación
        <span className="font-normal text-ink-3"> (pago único)</span>
      </>
    ),
    start: "Empezar",
    customLabel: "Plan a medida",
    custom: "A medida",
    customTeam: "Más de 30 comerciales",
    customTagline: "Cadenas y redes con varias sedes.",
    customFichas: "Más de 10 fichas de Google",
    talk: "Hablemos",
    setupNote:
      "La implantación llave en mano (129 €, pago único) incluye conexión de tus fichas, alta de tu equipo, formación a comerciales y soporte las primeras semanas. Sin permanencia.",
    includedLabel: "Todos los planes incluyen",
  },
  en: {
    heading: <>One plan <em className="font-light">for every size.</em></>,
    lead: "You pay by the size of your sales team. Every feature on every plan. Turnkey setup, monthly subscription, cancel anytime.",
    popular: "Most popular",
    planLabel: (n: string) => `${n} plan`,
    price: (p: string) => (
      <>
        <span className="font-display text-[2.5rem] font-medium leading-none tracking-tight text-ink sm:text-[3rem]">
          €{p}
        </span>
        <span className="text-[14px] text-ink-3">/ month</span>
      </>
    ),
    setup: (
      <>
        + €129 setup
        <span className="font-normal text-ink-3"> (one-time)</span>
      </>
    ),
    start: "Get started",
    customLabel: "Custom plan",
    custom: "Custom",
    customTeam: "More than 30 sales reps",
    customTagline: "Chains and networks with several sites.",
    customFichas: "More than 10 Google listings",
    talk: "Let's talk",
    setupNote:
      "The turnkey setup (€129, one-time) includes connecting your listings, onboarding your team, training your sales reps and support during the first weeks. No minimum contract.",
    includedLabel: "Every plan includes",
  },
} as const;

export function PricingSection({
  locale,
  headingLevel = "h2",
}: {
  locale: Locale;
  headingLevel?: "h1" | "h2";
}) {
  const t = T[locale];
  const demo = routes[locale].demo;
  const Heading = headingLevel;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div className="max-w-2xl">
        <Heading
          className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
          style={{ fontSize: "var(--text-h2)" }}
        >
          {t.heading}
        </Heading>
        <p
          className="mt-5 leading-relaxed text-ink-2"
          style={{ fontSize: "var(--text-lead)" }}
        >
          {t.lead}
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans[locale].map((plan) => (
          <article
            key={plan.name}
            className={
              plan.featured
                ? "relative flex flex-col rounded-2xl border border-ink/15 bg-bg p-7 shadow-card sm:p-8"
                : "relative flex flex-col rounded-2xl border border-line bg-white p-7 sm:p-8"
            }
          >
            {plan.featured && (
              <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                {t.popular}
              </span>
            )}
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
              {t.planLabel(plan.name)}
            </p>
            <p className="mt-4 flex min-h-[2.5rem] items-baseline gap-x-1.5 sm:min-h-[3rem]">
              {t.price(plan.price)}
            </p>
            <p className="mt-2 text-[13px] font-medium text-ink-2">{t.setup}</p>
            <p className="mt-3 text-[14.5px] font-medium text-ink">{plan.equipo}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-3">
              {plan.tagline}
            </p>
            <p className="mb-6 mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-2">
              <span
                aria-hidden="true"
                className="inline-flex h-1.5 w-1.5 rounded-full bg-accent"
              />
              {plan.fichas}
            </p>
            <Link
              href={demo}
              aria-label={`${t.start} — ${t.planLabel(plan.name)}`}
              className={
                plan.featured
                  ? "mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-strong"
                  : "mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-[15px] font-semibold text-ink transition hover:bg-ink/[0.04]"
              }
            >
              {t.start}
            </Link>
          </article>
        ))}

        {/* Tarjeta a medida */}
        <article className="relative flex flex-col rounded-2xl border border-line bg-white p-7 sm:p-8">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
            {t.customLabel}
          </p>
          <p className="mt-4 flex min-h-[2.5rem] items-end sm:min-h-[3rem]">
            <span className="font-display text-[1.75rem] font-medium leading-none tracking-tight text-ink sm:text-[2rem]">
              {t.custom}
            </span>
          </p>
          <p className="mt-2 text-[13px] font-medium text-ink-2">{t.setup}</p>
          <p className="mt-3 text-[14.5px] font-medium text-ink">{t.customTeam}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-3">
            {t.customTagline}
          </p>
          <p className="mb-6 mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-2">
            <span
              aria-hidden="true"
              className="inline-flex h-1.5 w-1.5 rounded-full bg-accent"
            />
            {t.customFichas}
          </p>
          <Link
            href={demo}
            aria-label={`${t.talk} — ${t.customLabel}`}
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-[15px] font-semibold text-ink transition hover:bg-ink/[0.04]"
          >
            {t.talk}
          </Link>
        </article>
      </div>

      <p className="mt-6 text-[14px] leading-relaxed text-ink-2">{t.setupNote}</p>

      <div className="mt-12">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
          {t.includedLabel}
        </p>
        <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {included[locale].map((it) => (
            <li key={it} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              />
              <span className="text-[14.5px] leading-relaxed text-ink-2">
                {it}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
