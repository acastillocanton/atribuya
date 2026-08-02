import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadMagnetForm } from "@/components/landing/LeadMagnetForm";
import { makeBreadcrumb } from "@/lib/marketing/seo";

const ORIGIN = "https://atribuya.com";
const PATH = "/recursos/plantillas-respuesta-resenas";
const OG_IMAGE = `${ORIGIN}/recursos/plantillas-respuesta-resenas-google-portada.png`;

// Página-recurso indexable (lead magnet). Solo ES por ahora (mercado España);
// el hreflang queda self/x-default sin en-US hasta que exista versión inglesa.
export const metadata: Metadata = {
  title: "Plantillas de respuesta a reseñas de Google (pack gratis)",
  description:
    "Descarga gratis 20 plantillas para responder reseñas de Google: positivas, negativas, casos delicados y sectores con confidencialidad, listas para adaptar.",
  alternates: { canonical: `${ORIGIN}${PATH}` },
  openGraph: {
    title: "Pack de plantillas de respuesta a reseñas de Google",
    description:
      "20 plantillas para responder reseñas de Google: positivas, negativas, casos delicados y sectores con confidencialidad, listas para adaptar.",
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
  crumbs: [{ name: "Plantillas de respuesta a reseñas", path: PATH }],
});

const INCLUYE = [
  "5 plantillas para reseñas positivas, también para el clásico «todo bien».",
  "7 plantillas para negativas: con razón, malentendidos, precio, trato, espera.",
  "5 casos delicados: no consta como cliente, sospecha de falsa, exempleados.",
  "3 sectores con confidencialidad: salud, asesorías, promotoras.",
];

const PASOS = [
  {
    n: "01",
    t: "Elige la situación",
    d: "El pack está organizado por casos: busca el que se parece al tuyo y parte de esa plantilla.",
  },
  {
    n: "02",
    t: "Cambia los corchetes",
    d: "Nombre del cliente, detalle concreto, contacto. Añade siempre un detalle real de tu negocio: es lo que separa una respuesta creíble de una enlatada.",
  },
  {
    n: "03",
    t: "Responde pronto",
    d: "Las reseñas de una o dos estrellas, en el día; el resto, dentro de la semana. Una respuesta tardía pierde casi todo su efecto.",
  },
];

const FAQ = [
  {
    q: "¿Qué incluye el pack?",
    a: "Un documento Word con 20 plantillas de respuesta organizadas por situación: positivas, negativas, casos delicados (reseñas falsas, exempleados, amenazas de reclamación) y sectores con confidencialidad como clínicas o asesorías. Cada una indica cuándo usarla y qué adaptar.",
  },
  {
    q: "¿Por qué en Word y no en PDF?",
    a: "Porque el valor está en editarlas. La plantilla es el punto de partida: cambias los corchetes, añades un detalle real de tu negocio y la guardas como tu propia biblioteca de respuestas.",
  },
  {
    q: "¿Puedo pedirle al cliente que cambie su reseña negativa?",
    a: "No a cambio de nada: ofrecer compensación por retirar o mejorar una reseña infringe las políticas de Google. Resuelve el problema por el canal privado; si el cliente decide actualizarla por su cuenta, es legítimo.",
  },
  {
    q: "¿Y cuando el problema sea enterarme a tiempo de cada reseña?",
    a: "Ahí entra Atribuya: avisa por email de las reseñas de una y dos estrellas en cuanto se detectan y te dice qué cliente es y qué comercial le atendió, para responder con contexto real.",
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

export default function PlantillasRespuestaPage() {
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
              Pack gratuito
            </p>
            <h1
              className="mt-3 font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Plantillas de respuesta a reseñas de Google
            </h1>
            <p
              className="mt-5 max-w-xl leading-relaxed text-ink-2"
              style={{ fontSize: "var(--text-lead)" }}
            >
              20 respuestas listas para adaptar, en Word. Escritas para que las lea tu próximo cliente, no solo el que opina: de la reseña positiva escueta a la negativa injusta, sin cruzar ninguna línea de las políticas de Google.
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
              <p className="mb-5 text-[15px] font-semibold text-ink">Descárgalo gratis</p>
              <LeadMagnetForm locale="es" magnet="plantillas-respuesta-resenas" />
            </div>
          </div>
        </div>

        {/* Vista previa del pack */}
        <div className="mx-auto max-w-5xl px-5 pb-4">
          <figure>
            <img
              src="/recursos/plantillas-respuesta-resenas-google-portada.png"
              alt="Portada y página de plantillas del pack de respuestas a reseñas de Google de Atribuya"
              width={2240}
              height={1244}
              loading="lazy"
              className="h-auto w-full rounded-xl border border-line shadow-sm"
            />
            <figcaption className="mt-3 text-center text-[13px] text-ink-3">
              Cada plantilla indica cuándo usarla y qué adaptar antes de publicar.
            </figcaption>
          </figure>
        </div>

        {/* Cómo usarlo */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2
            className="font-display font-medium tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h2)" }}
          >
            Cómo usar el pack
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
          <p className="mt-10 text-[15px] text-ink-2">
            El método completo, con los cuatro principios y los errores prohibidos, está en la guía{" "}
            <a href="/blog/responder-resenas-google" className="font-semibold text-accent underline">
              cómo responder reseñas de Google
            </a>
            .
          </p>
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
            ¿Quieres enterarte de cada reseña negativa en horas y con contexto?{" "}
            <a href="/demo" className="font-semibold text-accent underline">
              Pide una demo de Atribuya
            </a>{" "}
            y lo ves con tu propia ficha.
          </p>
        </section>
      </main>
      <Footer locale="es" />
    </div>
  );
}
