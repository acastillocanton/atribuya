import type { ReactNode } from "react";
import type { Locale } from "@/lib/marketing/nav";

type Stat = { value: string; label: string };

const T: Record<
  Locale,
  {
    eyebrow: string;
    heading: ReactNode;
    p1: ReactNode;
    p2: ReactNode;
    p3: ReactNode;
    note: string;
    resultsLabel: string;
    stats: Stat[];
  }
> = {
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
    resultsLabel: "Resultados",
    stats: [
      { value: "100%", label: "reseñas verificadas atribuidas" },
      { value: "≈8 h/mes", label: "recuperadas frente al Excel" },
      { value: "0", label: "disputas internas sobre reseñas" },
    ],
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
    resultsLabel: "Results",
    stats: [
      { value: "100%", label: "verified reviews attributed" },
      { value: "≈8 h/mo", label: "saved vs the spreadsheet" },
      { value: "0", label: "internal disputes over reviews" },
    ],
  },
};

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
    <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_320px] md:gap-14">
        {/* Narrativa */}
        <div>
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
          <p className="mt-10 text-[12px] leading-relaxed text-ink-4">
            {t.note}
          </p>
        </div>

        {/* Panel de resultados */}
        <aside className="md:pt-1">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card md:sticky md:top-28">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-4">
              {t.resultsLabel}
            </p>
            <ul className="mt-5 space-y-6">
              {t.stats.map((s) => (
                <li key={s.label}>
                  <p
                    className="font-display font-medium leading-none tracking-[-0.02em] text-ink tabular-nums"
                    style={{ fontSize: "var(--text-h3)" }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-ink-3">
                    {s.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
