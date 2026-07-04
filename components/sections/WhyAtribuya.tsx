import type { Locale } from "@/lib/marketing/nav";

// Sección "por qué" que cubre las cuatro voces de decisión: el puente
// reseña→negocio (CEO), el ranking que reconoce sin enfrentar (dir. comercial),
// el control de la operativa sobre las dudosas (operaciones) y el ángulo de
// reputación con contexto (marketing/CX).
const T = {
  es: {
    heading: (
      <>
        Más que un ranking. <em className="font-light text-ink-2">Una forma de dirigir.</em>
      </>
    ),
    cards: [
      {
        title: "De reseñas a negocio",
        body: "Más reseñas 5★ mejoran tu visibilidad en Google Maps y te traen más clientes. Sabes a quién premiar para que se repita, y a quién ayudar antes de perder ventas.",
      },
      {
        title: "Reconocimiento, no rivalidad",
        body: "El ranking mide para reconocer, no para enfrentar. Cada comercial ve su progreso hacia un objetivo, no una lista de perdedores. Tú decides qué se hace público.",
      },
      {
        title: "Tú tienes la última palabra",
        body: "La mayoría de reseñas se atribuyen solas. Las dudosas esperan en una cola con sugerencias hasta que das el visto bueno con un clic. Automatizas sin perder criterio.",
      },
      {
        title: "Reputación con contexto",
        body: "No solo cuántas reseñas, sino qué experiencias las generan. Aviso inmediato cuando entra una de 1 o 2 estrellas, para responder a tiempo. Todo con las APIs oficiales de Google.",
      },
    ],
  },
  en: {
    heading: (
      <>
        More than a ranking. <em className="font-light text-ink-2">A way to lead.</em>
      </>
    ),
    cards: [
      {
        title: "From reviews to revenue",
        body: "More 5★ reviews lift your visibility on Google Maps and bring you more customers. You know who to reward so it repeats, and who to help before you lose sales.",
      },
      {
        title: "Recognition, not rivalry",
        body: "The ranking measures to recognize, not to pit people against each other. Each rep sees their progress toward a target, not a list of losers. You decide what goes public.",
      },
      {
        title: "You have the final say",
        body: "Most reviews are attributed on their own. The doubtful ones wait in a queue with suggestions until you approve them with one click. You automate without losing judgment.",
      },
      {
        title: "Reputation with context",
        body: "Not just how many reviews, but which experiences drive them. Instant alert when a 1 or 2 star review comes in, so you reply in time. All through Google's official APIs.",
      },
    ],
  },
} as const;

export function WhyAtribuya({ locale }: { locale: Locale }) {
  const t = T[locale];
  return (
    <section
      aria-label={locale === "es" ? "Por qué Atribuya" : "Why Atribuya"}
      className="mx-auto max-w-6xl px-5 py-16 sm:py-24"
    >
      <h2
        className="max-w-2xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
        style={{ fontSize: "var(--text-h2)" }}
      >
        {t.heading}
      </h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {t.cards.map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border border-line bg-white p-7"
          >
            <h3
              className="font-display font-medium leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-h3)" }}
            >
              {c.title}
            </h3>
            <p className="mt-3 leading-relaxed text-ink-2">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
