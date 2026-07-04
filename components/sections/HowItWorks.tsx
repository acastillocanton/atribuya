import type { ReactNode } from "react";
import { AttributionAnimation } from "@/components/landing/AttributionAnimation";
import type { Locale } from "@/lib/marketing/nav";

type Step = { n: string; title: string; body: string };

const T: Record<
  Locale,
  { heading: ReactNode; lead: string; steps: Step[] }
> = {
  es: {
    heading: (
      <>
        Tres pasos.
        <br />
        <em className="font-light text-ink-2">Cero fricción para el cliente.</em>
      </>
    ),
    lead: "El cliente no instala nada, no rellena formularios y no escribe el nombre del comercial. Solo deja la reseña en Google como siempre.",
    steps: [
      {
        n: "01",
        title: "Cada comercial tiene su enlace",
        body: "Atribuya genera un enlace personalizado por comercial, y opcionalmente por cliente. El comercial lo guarda en su firma de email, lo pone en su tarjeta o lo manda por WhatsApp.",
      },
      {
        n: "02",
        title: "El cliente entra y deja la reseña",
        body: "El enlace lleva al cliente directo al formulario de reseña de Google de tu ficha. Un solo clic. No tiene que buscar nada ni escribir el nombre del comercial.",
      },
      {
        n: "03",
        title: "Sabes al instante quién la trajo",
        body: "Atribuya cruza la reseña con quién compartió el enlace, la ventana temporal y el nombre del cliente, y la asigna sola. Si algo no encaja, queda en revisión manual con sugerencias: un clic y resuelto. Nunca más adivinar a ojo.",
      },
    ],
  },
  en: {
    heading: (
      <>
        Three steps.
        <br />
        <em className="font-light text-ink-2">
          Zero friction for the customer.
        </em>
      </>
    ),
    lead: "Customers don't install anything, don't fill out forms and don't need to mention the rep's name. They just leave the Google review as they always do.",
    steps: [
      {
        n: "01",
        title: "Each rep gets a personal link",
        body: "Atribuya generates a personalized link per sales rep, and optionally per customer. The rep adds it to their email signature, business card or sends it via WhatsApp.",
      },
      {
        n: "02",
        title: "The customer leaves the review",
        body: "The link takes the customer straight to the Google review form for your listing. One click. They don't have to search for anything or mention the rep's name.",
      },
      {
        n: "03",
        title: "You instantly know who brought it in",
        body: "Atribuya cross-references the review with whoever shared the link, the time window and the customer's name, and assigns it on its own. If something doesn't fit, it sits in manual review with suggestions: one click and done. No more guessing by eye.",
      },
    ],
  },
};

// Sección "Cómo funciona" (los tres pasos + la animación de atribución).
// Reutilizable: se embebe en la home (h2) y en la página propia /como-funciona.
export function HowItWorks({
  locale,
  headingLevel = "h2",
}: {
  locale: Locale;
  headingLevel?: "h1" | "h2";
}) {
  const t = T[locale];
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
        <p className="mt-5 leading-relaxed text-ink-2">{t.lead}</p>
      </div>

      <ol className="mt-14 grid gap-y-12 gap-x-10 md:grid-cols-3 md:gap-y-0">
        {t.steps.map((s) => (
          <li key={s.n} className="relative">
            <span
              aria-hidden="true"
              className="font-display font-light italic leading-none tracking-[-0.04em] text-ink-4"
              style={{ fontSize: "clamp(3.5rem, 2rem + 6vw, 5.5rem)" }}
            >
              {s.n}
            </span>
            <h3
              className="mt-4 font-display font-medium leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-h3)" }}
            >
              {s.title}
            </h3>
            <p className="mt-3 leading-relaxed text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14">
        <AttributionAnimation locale={locale} />
      </div>
    </div>
  );
}
