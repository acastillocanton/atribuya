import type { Locale } from "@/lib/marketing/nav";

const T = {
  es: {
    eyebrow: "Caso real",
    heading: (
      <>
        Una promotora con piso piloto en la
        <em className="font-light text-ink-2"> Costa de Castellón.</em>
      </>
    ),
    p1: (
      <>
        Cuatro comerciales, una ficha de Google Business Profile en el piso
        piloto. Antes de Atribuya, el administrador tardaba{" "}
        <strong className="font-semibold text-ink">dos tardes al mes</strong>{" "}
        atribuyendo reseñas en una hoja de Excel, y aun así había discusiones
        sobre a quién pertenecía cada una.
      </>
    ),
    p2: (
      <>
        En el primer mes con Atribuya, el sistema atribuyó{" "}
        <strong className="font-semibold text-ink">
          el 100% de las reseñas verificadas
        </strong>{" "}
        a su comercial responsable. La mayoría de forma automática; las dudosas,
        con un clic de validación. La hoja de Excel desapareció. Las discusiones
        también.
      </>
    ),
    p3: (
      <>
        Como referencia: <span className="tabular-nums">≈ 8 h/mes</span> que
        recuperaron frente a la atribución manual, y cero disputas internas
        sobre la propiedad de una reseña.
      </>
    ),
    note: "Sector, tamaño y métricas reales; nombre del cliente reservado hasta firma de permiso comercial.",
  },
  en: {
    eyebrow: "Case study",
    heading: (
      <>
        A real estate developer with a model home on the
        <em className="font-light text-ink-2"> Mediterranean coast.</em>
      </>
    ),
    p1: (
      <>
        Four sales reps, one Google Business Profile listing at the model home.
        Before Atribuya, the admin spent{" "}
        <strong className="font-semibold text-ink">
          two afternoons a month
        </strong>{" "}
        attributing reviews in an Excel sheet, and even so, there were arguments
        about which rep earned what.
      </>
    ),
    p2: (
      <>
        In the first month with Atribuya, the system attributed{" "}
        <strong className="font-semibold text-ink">
          100% of verified reviews
        </strong>{" "}
        to their responsible sales rep. Most of them automatically; the doubtful
        ones with a one-click check. The spreadsheet disappeared. So did the
        arguments.
      </>
    ),
    p3: (
      <>
        For reference: roughly{" "}
        <span className="tabular-nums">8 hours/month</span> they got back over
        manual attribution, and zero internal disputes about review ownership.
      </>
    ),
    note: "Industry, size and metrics are real; customer name kept confidential pending commercial release.",
  },
} as const;

export function CaseSection({
  locale,
  headingLevel = "h2",
}: {
  locale: Locale;
  headingLevel?: "h1" | "h2";
}) {
  const t = T[locale];
  const Heading = headingLevel;
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
        {t.eyebrow}
      </p>
      <Heading
        className="mt-3 font-display font-medium leading-[1.1] tracking-[-0.02em] text-ink"
        style={{ fontSize: "var(--text-h2)" }}
      >
        {t.heading}
      </Heading>
      <div
        className="mt-7 space-y-5 leading-relaxed text-ink-2"
        style={{ fontSize: "var(--text-lead)" }}
      >
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <p className="text-ink-3">{t.p3}</p>
      </div>
      <p className="mt-10 text-[12px] leading-relaxed text-ink-4">{t.note}</p>
    </div>
  );
}
