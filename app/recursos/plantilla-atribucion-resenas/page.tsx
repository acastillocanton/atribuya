import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadMagnetForm } from "@/components/landing/LeadMagnetForm";
import { makeBreadcrumb } from "@/lib/marketing/seo";

const ORIGIN = "https://atribuya.com";
const PATH = "/recursos/plantilla-atribucion-resenas";
const OG_IMAGE = `${ORIGIN}/recursos/plantilla-atribucion-resenas-google-ranking.png`;

// Página-recurso indexable (lead magnet). Solo ES por ahora (mercado España);
// el hreflang queda self/x-default sin en-US hasta que exista versión inglesa.
export const metadata: Metadata = {
  title: "Plantilla de atribución de reseñas de Google (Excel gratis)",
  description:
    "Descarga gratis la plantilla de Excel para saber qué comercial ha conseguido cada reseña de Google y ver un ranking automático de tu equipo.",
  alternates: { canonical: `${ORIGIN}${PATH}` },
  openGraph: {
    title: "Plantilla de atribución de reseñas de Google",
    description:
      "Descarga gratis la plantilla para saber qué comercial ha conseguido cada reseña de Google y ver un ranking automático de tu equipo.",
    url: `${ORIGIN}${PATH}`,
    siteName: "Atribuya",
    locale: "es_ES",
    type: "website",
    images: [{ url: OG_IMAGE, width: 2240, height: 1244 }],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const bc = makeBreadcrumb({
  locale: "es",
  crumbs: [{ name: "Plantilla de atribución de reseñas", path: PATH }],
});

const INCLUYE = [
  "Registro de visitas y reseñas por comercial.",
  "Ranking automático: quién trae más reseñas.",
  "Resumen de reseñas atribuidas y sin atribuir.",
  "Las reglas de Google que no debes saltarte.",
];

const PASOS = [
  {
    n: "01",
    t: "Da de alta tu equipo",
    d: "Escribe el nombre de cada comercial. Aparecerán como opciones en el resto de la plantilla.",
  },
  {
    n: "02",
    t: "Registra cada visita y reseña",
    d: "Anota la visita y, cuando entre una reseña, crúzala con el cliente y márcala como atribuida.",
  },
  {
    n: "03",
    t: "Mira el ranking",
    d: "La plantilla calcula sola cuántas reseñas ha conseguido cada comercial. Sin fórmulas que tocar.",
  },
];

const FAQ = [
  {
    q: "¿Qué es esta plantilla?",
    a: "Una hoja de Excel gratuita para registrar las reseñas de Google que consigue tu equipo comercial y ver, en un ranking automático, qué comercial ha traído cada una.",
  },
  {
    q: "¿Cómo sé qué comercial ha conseguido cada reseña?",
    a: "Registras la visita de cada comercial y, cuando entra una reseña nueva, la cruzas con el cliente que atendió. La plantilla suma las reseñas atribuidas por comercial de forma automática.",
  },
  {
    q: "¿Puedo ofrecer un descuento a cambio de una reseña?",
    a: "No. Las políticas de Google prohíben ofrecer incentivos a cambio de reseñas y lo consideran interacción falsa, con riesgo de que se eliminen o penalicen.",
  },
  {
    q: "¿Y cuando tenga demasiadas reseñas para llevarlo a mano?",
    a: "Ahí entra Atribuya: cada comercial comparte su enlace personal y cada reseña queda atribuida sola, sin Excel y sin pedirle el nombre del vendedor al cliente.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function PlantillaAtribucionPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader locale="es" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />

        {/* Hero: copy + formulario */}
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              Plantilla gratuita
            </p>
            <h1
              className="mt-3 font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Plantilla de atribución de reseñas de Google
            </h1>
            <p
              className="mt-5 max-w-xl leading-relaxed text-ink-2"
              style={{ fontSize: "var(--text-lead)" }}
            >
              Un Excel listo para usar. Registra las visitas de tu equipo, cruza las reseñas que entran y mira el ranking sin fórmulas que tocar. Sabes qué comercial ha conseguido cada reseña, sin pedirle el nombre del vendedor al cliente.
            </p>
            <ul className="mt-8 space-y-3">
              {INCLUYE.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] text-ink-2">
                  <span aria-hidden="true" className="mt-1 text-accent">
                    ●
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-4">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
              <p className="mb-5 text-[15px] font-semibold text-ink">Descárgala gratis</p>
              <LeadMagnetForm locale="es" />
            </div>
          </div>
        </div>

        {/* Imagen del ranking */}
        <div className="mx-auto max-w-5xl px-5 pb-4">
          <figure>
            <img
              src="/recursos/plantilla-atribucion-resenas-google-ranking.png"
              alt="Ranking automático de reseñas de Google por comercial en la plantilla de Excel de Atribuya"
              width={2240}
              height={1244}
              loading="lazy"
              className="h-auto w-full rounded-xl border border-line shadow-sm"
            />
            <figcaption className="mt-3 text-center text-[13px] text-ink-3">
              El ranking se calcula solo a partir del registro de reseñas.
            </figcaption>
          </figure>
        </div>

        {/* Cómo funciona */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2
            className="font-display font-medium tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h2)" }}
          >
            Cómo funciona la plantilla
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {PASOS.map((p) => (
              <div key={p.n}>
                <div className="font-display text-accent" style={{ fontSize: "var(--text-h2)" }}>
                  {p.n}
                </div>
                <h3 className="mt-2 text-[17px] font-semibold text-ink">{p.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
          <h2
            className="font-display font-medium tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h2)" }}
          >
            Preguntas frecuentes
          </h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="text-[16px] font-semibold text-ink">{f.q}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[15px] text-ink-2">
            ¿Demasiadas reseñas para llevarlo a mano?{" "}
            <a href="/demo" className="font-semibold text-accent underline">
              Pide una demo de Atribuya
            </a>{" "}
            y lo hacemos solo.
          </p>
        </section>
      </main>
      <Footer locale="es" />
    </div>
  );
}
