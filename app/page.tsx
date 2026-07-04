import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { ReviewProof } from "@/components/landing/ReviewProof";
import { AttributionAnimation } from "@/components/landing/AttributionAnimation";
import { HubTeasers } from "@/components/sections/HubTeasers";
import { SectionCta } from "@/components/sections/SectionCta";

// La home es indexable: sobrescribe el noindex global de app/layout.tsx.
export const metadata: Metadata = {
  title: "Atribuya: sabe qué comercial te trae cada reseña de Google",
  description:
    "Atribuye cada reseña de Google al comercial que la consiguió, en automático y sin pedirle el nombre al cliente. Ranking del equipo, avisos y export a Excel.",
  alternates: {
    canonical: "https://atribuya.com/",
    languages: {
      "es-ES": "https://atribuya.com/",
      "en-US": "https://atribuya.com/en",
      "x-default": "https://atribuya.com/",
    },
  },
  openGraph: {
    title: "Atribuya: sabe qué comercial te trae cada reseña de Google",
    description:
      "Deja de adivinar quién de tu equipo te genera negocio. Sin Excel, sin plantillas, sin pedirle el nombre al cliente. Atribuya lo hace solo.",
    url: "https://atribuya.com/",
    siteName: "Atribuya",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atribuya: sabe qué comercial te trae cada reseña de Google",
    description:
      "Deja de adivinar quién de tu equipo te genera negocio. Sin Excel, sin plantillas y sin discusiones.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const SECTORS = [
  "Promotoras inmobiliarias con piso piloto",
  "Apartamentos turísticos",
  "Clínicas y centros médicos",
  "Servicios B2B con visita comercial",
  "Cualquier negocio con red comercial",
];

const STEPS = [
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
];

const FEATURES = [
  "Funciona con cualquier ficha de Google Business Profile que ya tengas.",
  "Cada cliente ve solo sus datos: aislamiento total garantizado por RLS de Postgres.",
  "Tus comerciales se enteran solos: email automático en cuanto consiguen una reseña.",
  "Ves el ranking de tu equipo de un vistazo, sin montar ninguna hoja de Excel.",
  "Te lo llevas todo a Excel cuando quieras: filtrado por comercial, ficha y fechas.",
  "Cuenta las reseñas con texto y las de solo estrellas. No se te escapa ninguna.",
  "Te avisa si una reseña desaparece, la borre el cliente o la borre Google.",
  "¿Varias oficinas o fichas? Las gestionas todas desde la misma cuenta.",
];

type FaqItem = { q: string; a: string[] };

const FAQS: FaqItem[] = [
  {
    q: "¿Cómo sabe Atribuya qué comercial consiguió cada reseña?",
    a: [
      "Cuando un comercial atiende a un cliente, le envía un enlace personalizado por WhatsApp, email o SMS. Ese enlace lleva al cliente directamente a «Escribir reseña» en Google. Cuando la reseña entra, Atribuya la asocia automáticamente al comercial responsable.",
      "En nuestro cliente piloto el sistema atribuye correctamente la mayoría de reseñas de forma automática. El resto queda en una cola para que tu admin las verifique con un solo clic.",
    ],
  },
  {
    q: "¿Esto cumple con las políticas de Google?",
    a: [
      "Sí. Atribuya utiliza las APIs oficiales de Google con los permisos correctos. Nunca pedimos al cliente que mencione al comercial en la reseña, nunca filtramos opiniones, nunca ofrecemos incentivos.",
      "El cliente final escribe lo que quiere, donde quiere. Solo facilitamos que llegue al sitio correcto para dejar su opinión.",
    ],
  },
  {
    q: "¿Mis comerciales tienen que aprender una herramienta complicada?",
    a: [
      "No. La interfaz del comercial son 4 pantallas: sus clientes, generar enlace, compartir, ver su ranking. La formación inicial dura 30 minutos y la damos nosotros como parte de la implantación.",
    ],
  },
  {
    q: "¿En cuánto tiempo veré resultados?",
    a: [
      "La implantación completa se hace en pocos días laborables. Desde el día 1 ya estás atribuyendo reseñas nuevas. Para tener una visión clara del rendimiento por comercial necesitas 4-6 semanas de datos.",
      "La diferencia entre tu mejor vendedor y el resto se ve mucho antes de lo que imaginas.",
    ],
  },
  {
    q: "¿Cuánto cuesta?",
    a: [
      "La suscripción mensual va según el tamaño de tu equipo comercial: 45€/mes hasta 5 comerciales (con 1 ficha de Google), 99€/mes hasta 15 comerciales (hasta 3 fichas) y 199€/mes hasta 30 comerciales (hasta 10 fichas). Todas las funciones están incluidas en todos los planes. Si tu equipo es mayor o gestionas más fichas, lo vemos a medida.",
      "A eso se suma una implantación llave en mano de 129€ (pago único) que incluye conexión de tus fichas, alta de tu equipo, formación a comerciales y soporte las primeras semanas. Sin permanencia. Para el encaje exacto de tu caso reservamos una llamada de 20 minutos.",
    ],
  },
  {
    q: "¿Hay permanencia?",
    a: [
      "No. La suscripción es mensual sin compromiso. Puedes cancelar cuando quieras y te exportamos todos tus datos.",
    ],
  },
  {
    q: "¿Mis datos están seguros?",
    a: [
      "Sí. Los datos se almacenan en servidores europeos cifrados en tránsito y en reposo. Cada cliente está aislado a nivel de base de datos. Cumplimos RGPD y firmamos DPA con cada cliente.",
    ],
  },
  {
    q: "¿Por qué Atribuya y no una herramienta consolidada como Birdeye o Trustpilot?",
    a: [
      "Las herramientas grandes gestionan reseñas, pero ninguna atribuye reseñas a comerciales individuales. Esa es la categoría que abre Atribuya.",
      "Si lo que necesitas es saber quién de tu equipo te trae los 5★ y quién no, hoy en el mercado solo hay dos opciones: Excel a mano o Atribuya.",
    ],
  },
  {
    q: "¿Cómo empezamos?",
    a: [
      "Reservas una llamada de 20 minutos. Vemos tu caso, calculamos el encaje exacto para tu empresa y, si nos entendemos, te enviamos propuesta el mismo día. Sin compromiso, sin tarjeta de crédito.",
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a.join("\n\n") },
  })),
};

// WebSite + Organization: nombre del sitio en la SERP y logo de marca.
// El SoftwareApplication con las ofertas vive ahora en /precios.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://atribuya.com/#website",
      url: "https://atribuya.com/",
      name: "Atribuya",
      alternateName: "atribuya.com",
      inLanguage: "es-ES",
      publisher: { "@id": "https://atribuya.com/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://atribuya.com/#organization",
      name: "Atribuya",
      url: "https://atribuya.com/",
      logo: "https://atribuya.com/icon.png",
      sameAs: ["https://www.linkedin.com/company/atribuya"],
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <SiteHeader locale="es" />

      <main id="contenido">
        {/* ========================== Hero — Stat-Led ========================== */}
        <section
          aria-label="Resultado del piloto"
          className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:pb-20 sm:pt-16"
        >
          <div className="grid items-end gap-y-10 gap-x-12 md:grid-cols-12">
            {/* Stat dominante */}
            <div className="md:col-span-7">
              <p
                className="font-display font-light italic leading-[0.85] tracking-[-0.04em] text-ink"
                style={{ fontSize: "var(--text-stat)" }}
              >
                100<span className="not-italic font-normal">%</span>
              </p>
              <p className="mt-4 max-w-md text-[15px] leading-snug text-ink-2 sm:text-[16px]">
                de las reseñas verificadas, atribuidas solas el primer
                mes del piloto. Sin tocar nada.
              </p>
            </div>

            {/* Stats secundarias */}
            <dl className="grid grid-cols-2 gap-y-6 gap-x-6 md:col-span-5 md:grid-cols-1 md:gap-y-7">
              <div>
                <dt
                  className="font-display font-light italic leading-none tracking-tight text-ink"
                  style={{ fontSize: "var(--text-stat-sm)" }}
                >
                  Día 1
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  ves qué comercial trae cada reseña, y quién no llega.
                </dd>
              </div>
              <div>
                <dt
                  className="font-display font-light italic leading-none tracking-tight text-ink"
                  style={{ fontSize: "var(--text-stat-sm)" }}
                >
                  0
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  discusiones de «¿de quién era esta reseña?».
                </dd>
              </div>
            </dl>
          </div>

          <hr className="my-12 border-line sm:my-14" />

          {/* H1 + subhead + CTA (izq) · tarjeta de prueba (der) — asimétrico */}
          <div className="grid items-center gap-y-10 gap-x-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <h1
                className="text-balance font-display font-medium leading-[1.04] tracking-[-0.02em] text-ink"
                style={{ fontSize: "var(--text-display)" }}
              >
                Deja de adivinar qué comercial te trae las
                reseñas de Google.
              </h1>
              <p
                className="mt-6 max-w-xl text-pretty leading-relaxed text-ink-2"
                style={{ fontSize: "var(--text-lead)" }}
              >
                Tus comerciales dejan de discutir. Tú ves quién te hace ganar
                negocio. Sin Excel, sin plantillas y sin pedirle el nombre del
                vendedor al cliente. Atribuya lo hace solo.
              </p>
              <div className="mt-8">
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-ink-2"
                >
                  Quiero saber quién me genera negocio
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
                  </svg>
                </a>
                <p className="mt-3 text-[13px] text-ink-3">
                  Sin compromiso. Te enseñamos quién te genera negocio.
                </p>
              </div>
            </div>
            <div className="md:col-span-5">
              <ReviewProof locale="es" />
            </div>
          </div>

          {/* Sectores — señalar al cliente con el dedo, no esconderlo */}
          <div className="mt-12 border-t border-line pt-10 sm:mt-14">
            <p
              className="max-w-2xl font-display font-medium leading-snug tracking-tight text-ink"
              style={{ fontSize: "var(--text-h3)" }}
            >
              ¿Tienes red comercial y reseñas de Google?{" "}
              <em className="font-light text-ink-2">Esto es para ti.</em>
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {SECTORS.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] font-medium text-ink-2"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Atribución del dato del piloto */}
          <p className="mt-10 text-[12px] leading-relaxed text-ink-4">
            Datos del despliegue piloto de Atribuya en una promotora
            inmobiliaria real: 4 comerciales, 1 ficha de Google Business
            Profile, primer mes. Sector, tamaño y métricas reales; nombre del
            cliente reservado hasta firma de permiso comercial.
          </p>
        </section>

        {/* ============================= Problema ============================= */}
        <section aria-label="El problema" className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <div className="grid items-start gap-y-10 gap-x-12 md:grid-cols-12">
              <h2
                className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-white md:col-span-7"
                style={{ fontSize: "var(--text-h2)" }}
              >
                <em className="font-light">«¿De quién era</em>
                <br />
                <em className="font-light">esta reseña?»</em>
              </h2>
              <div className="md:col-span-5">
                <p
                  className="text-pretty leading-relaxed text-white/85"
                  style={{ fontSize: "var(--text-lead)" }}
                >
                  El cliente escribe «estupenda visita, el comercial fue muy
                  amable». No menciona nombres. El administrador se pasa horas
                  a la semana cruzando fechas de visitas con reseñas en Google,
                  a ojo, intentando adivinar quién atendió a quién.
                </p>
                <p className="mt-5 leading-relaxed text-white/70">
                  Bonos mal calculados. Comerciales descontentos. Tiempo perdido
                  en discutir atribuciones. Reseñas que se pierden porque nadie
                  las sigue. Al final, la pregunta que ningún admin sabe
                  responder a ojo: ¿de quién era esta?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================== Cómo funciona =========================== */}
        <section
          id="como-funciona"
          aria-label="Cómo funciona"
          className="mx-auto max-w-6xl px-5 py-16 sm:py-24"
        >
          <div className="max-w-2xl">
            <h2
              className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Tres pasos.
              <br />
              <em className="font-light text-ink-2">
                Cero fricción para el cliente.
              </em>
            </h2>
            <p className="mt-5 leading-relaxed text-ink-2">
              El cliente no instala nada, no rellena formularios y no escribe el
              nombre del comercial. Solo deja la reseña en Google como siempre.
            </p>
          </div>

          <ol className="mt-14 grid gap-y-12 gap-x-10 md:grid-cols-3 md:gap-y-0">
            {STEPS.map((s) => (
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

          {/* El "money shot" del paso 03, en movimiento. */}
          <div className="mt-14">
            <AttributionAnimation locale="es" />
          </div>
        </section>

        {/* =========================== Características =========================== */}
        <section
          aria-label="Qué incluye"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2
              className="max-w-2xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              <em className="font-light">Lo que está</em> en la caja.
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-4 md:grid-cols-2">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 border-b border-line py-3 text-ink-2"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-ok"
                  />
                  <span className="text-[15px] leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===================== Explora (hub de secciones) ===================== */}
        <HubTeasers locale="es" />

        {/* ================================ FAQ ================================ */}
        <section
          id="faq"
          aria-label="Preguntas frecuentes"
          className="border-t border-line"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <h2
              className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              <em className="font-light">Lo que nos suelen</em> preguntar.
            </h2>
            <div className="mt-10 divide-y divide-line border-y border-line">
              {FAQS.map(({ q, a }) => (
                <details key={q} name="faq" className="group open:bg-white">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-5 py-5 [&::-webkit-details-marker]:hidden sm:px-6">
                    <span className="font-display text-[17px] font-medium leading-snug tracking-tight text-ink sm:text-[18px]">
                      {q}
                    </span>
                    <svg
                      className="mt-1.5 h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <div className="space-y-3 px-5 pb-6 text-[15px] leading-relaxed text-ink-2 sm:px-6">
                    {a.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
          </div>
        </section>

        {/* ============================ CTA final ============================ */}
        <SectionCta locale="es" />
      </main>

      <Footer locale="es" />
    </div>
  );
}
