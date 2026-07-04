import { ProductShot } from "@/components/landing/ProductShot";
import type { Locale } from "@/lib/marketing/nav";

const T = {
  es: {
    eyebrow: "El producto por dentro",
    heading: (
      <>
        Míralo por dentro.
        <br />
        <em className="font-light text-accent">Sin maquetar.</em>
      </>
    ),
    lead: "Pantallas reales del producto. El administrador ve a todo el equipo de un vistazo. Cada comercial ve solo lo suyo. Clic en cualquiera para ampliarla.",
    shots: [
      {
        src: "/landing/dashboard.png",
        url: "atribuya.com/dashboard",
        alt: "Panel del administrador de Atribuya con el resumen del equipo, la conversión y el leaderboard",
        caption:
          "El panel del administrador: reseñas, conversión, valoración media y el equipo entero en una pantalla.",
        wide: true,
      },
      {
        src: "/landing/ranking.png",
        url: "atribuya.com/ranking",
        alt: "Ranking del equipo comercial en Atribuya, ordenado por reseñas conseguidas",
        caption:
          "Ranking del equipo en tiempo real. Quién llega al objetivo y quién no, sin montar una hoja de cálculo.",
        wide: true,
      },
      {
        src: "/landing/enlace-qr.png",
        url: "atribuya.com/panel/enlace",
        alt: "Pantalla del comercial con su enlace personalizado y su código QR para compartir",
        caption:
          "Cada comercial genera su enlace y su QR para compartir con el cliente en un toque.",
        wide: false,
      },
      {
        src: "/landing/mis-resenas.png",
        url: "atribuya.com/panel/resenas",
        alt: "Pantalla del comercial con la lista de reseñas que ha conseguido",
        caption:
          "El comercial ve sus reseñas conseguidas y su progreso hacia el objetivo.",
        wide: false,
      },
    ],
  },
  en: {
    eyebrow: "Inside the product",
    heading: (
      <>
        See it from the inside.
        <br />
        <em className="font-light text-accent">No mockups.</em>
      </>
    ),
    lead: "Real screens from the product. The admin sees the whole team at a glance. Each rep sees only their own. Click any one to enlarge it.",
    shots: [
      {
        src: "/landing/dashboard.png",
        url: "atribuya.com/dashboard",
        alt: "Atribuya admin dashboard with the team overview, conversion and leaderboard",
        caption:
          "The admin dashboard: reviews, conversion, average rating and the whole team on one screen.",
        wide: true,
      },
      {
        src: "/landing/ranking.png",
        url: "atribuya.com/ranking",
        alt: "Sales team ranking in Atribuya, sorted by reviews earned",
        caption:
          "Live team ranking. Who hits their target and who doesn't, without building a spreadsheet.",
        wide: true,
      },
      {
        src: "/landing/enlace-qr.png",
        url: "atribuya.com/panel/enlace",
        alt: "Sales rep screen with their personalized link and QR code to share",
        caption:
          "Each rep generates their own link and QR code to share with the customer in one tap.",
        wide: false,
      },
      {
        src: "/landing/mis-resenas.png",
        url: "atribuya.com/panel/resenas",
        alt: "Sales rep screen with the list of reviews they have earned",
        caption:
          "The rep sees the reviews they've earned and their progress toward the target.",
        wide: false,
      },
    ],
  },
} as const;

export function ProductSection({
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
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
          {t.eyebrow}
        </p>
        <Heading
          className="mt-3 font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
          style={{ fontSize: "var(--text-h2)" }}
        >
          {t.heading}
        </Heading>
        <p className="mt-5 leading-relaxed text-ink-2">{t.lead}</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {t.shots.map((s) => (
          <ProductShot
            key={s.src}
            locale={locale}
            className={s.wide ? "md:col-span-2" : undefined}
            src={s.src}
            width={2880}
            height={1800}
            url={s.url}
            alt={s.alt}
            caption={s.caption}
          />
        ))}
      </div>
    </div>
  );
}
