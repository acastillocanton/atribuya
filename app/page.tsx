import type { Metadata } from "next";
import { LeadForm } from "@/components/landing/LeadForm";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

// La landing comercial es la ÚNICA página del producto que queremos indexada.
// Sobrescribimos los robots heredados de app/layout.tsx (que son noindex global
// para proteger las rutas autenticadas).
export const metadata: Metadata = {
  title: "Atribuya — Atribuye reseñas de Google a cada comercial, en automático",
  description:
    "SaaS de atribución de reseñas de Google Business Profile para empresas con red comercial. Cada vendedor recibe el crédito de las reseñas que ha conseguido — sin pedirle el nombre al cliente.",
  alternates: {
    canonical: "https://atribuya.com/",
    languages: {
      "es-ES": "https://atribuya.com/",
      "en-US": "https://atribuya.com/en",
      "x-default": "https://atribuya.com/",
    },
  },
  openGraph: {
    title: "Atribuya — Atribución automática de reseñas de Google a comerciales",
    description:
      "Atribuye cada reseña de Google al comercial que la ha conseguido. Sin Excel, sin disputas, sin pedirle el nombre al cliente.",
    url: "https://atribuya.com/",
    siteName: "Atribuya",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atribuya — Atribución automática de reseñas de Google a comerciales",
    description:
      "Atribuye cada reseña de Google al comercial que la ha conseguido. Sin Excel, sin disputas.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const SECTORS = [
  "Promotoras inmobiliarias",
  "Apartamentos turísticos",
  "Clínicas y centros médicos",
  "Servicios B2B con visita comercial",
  "Cualquier negocio con red comercial",
];

const STEPS = [
  {
    n: "01",
    title: "Cada comercial tiene su enlace",
    body: "Atribuya genera un enlace personalizado por comercial — y opcionalmente por cliente. El comercial lo guarda en su firma de email, lo pone en su tarjeta o lo manda por WhatsApp.",
  },
  {
    n: "02",
    title: "El cliente entra y deja la reseña",
    body: "El enlace lleva al cliente directo al formulario de reseña de Google de tu ficha — un solo clic. No tiene que buscar nada ni escribir el nombre del comercial.",
  },
  {
    n: "03",
    title: "Atribuimos la reseña en automático",
    body: "Atribuya cruza la reseña con quién compartió el enlace, la ventana temporal y el nombre del cliente. Si hay coincidencia, queda atribuida. Si no, queda en revisión manual con sugerencias.",
  },
];

const FEATURES = [
  "Compatible con cualquier ficha de Google Business Profile.",
  "Aislamiento multi-tenant: cada cliente ve solo sus datos, garantizado por RLS de Postgres.",
  "Email automático al comercial cuando llega una reseña atribuida.",
  "Dashboard agregado para el admin con ranking de comerciales.",
  "Export Excel filtrable por comercial, ficha y rango de fechas.",
  "Captura tanto reseñas con texto como sin texto (solo estrellas).",
  "Detección de reseñas eliminadas por el usuario o por Google.",
  "Soporte para multi-ficha: una org puede tener varias localizaciones.",
];

const PRICING_INCLUDED = [
  "Conexión de hasta 8 fichas de Google Business Profile",
  "Hasta 20 comerciales activos",
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
      "Implantación llave en mano de 990€ y suscripción mensual de 397€. La implantación incluye conexión de tus fichas de Google, alta de tu equipo, formación a comerciales y soporte intensivo las primeras semanas.",
      "Para una valoración exacta de tu caso reservamos una llamada de 20 minutos.",
    ],
  },
  {
    q: "¿Hay permanencia?",
    a: [
      "No. La suscripción es mensual sin compromiso. Puedes cancelar cuando quieras y te exportamos todos tus datos.",
      "Si en 90 días no atribuimos correctamente al menos el 70% de las reseñas pasadas por tus comerciales, te devolvemos la implantación íntegra.",
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <Header locale="es" />

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
                de las reseñas verificadas atribuidas a su comercial en
                el primer mes del piloto, sin intervención manual.
              </p>
            </div>

            {/* Stats secundarias */}
            <dl className="grid grid-cols-2 gap-y-6 gap-x-6 md:col-span-5 md:grid-cols-1 md:gap-y-7">
              <div>
                <dt
                  className="font-display font-light italic leading-none tracking-tight text-ink"
                  style={{ fontSize: "var(--text-stat-sm)" }}
                >
                  ≈8h<span className="not-italic">/mes</span>
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  ahorradas vs. atribución manual en Excel.
                </dd>
              </div>
              <div>
                <dt
                  className="font-display font-light italic leading-none tracking-tight text-ink"
                  style={{ fontSize: "var(--text-stat-sm)" }}
                >
                  cero
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  disputas internas sobre la propiedad de una reseña.
                </dd>
              </div>
            </dl>
          </div>

          <hr className="my-12 border-line sm:my-14" />

          {/* H1 + subhead + CTA — asimétrico, no centrado */}
          <div className="grid items-start gap-y-8 gap-x-12 md:grid-cols-12">
            <div className="md:col-span-8">
              <h1
                className="text-balance font-display font-medium leading-[1.04] tracking-[-0.02em] text-ink"
                style={{ fontSize: "var(--text-display)" }}
              >
                Atribuye cada reseña de Google al comercial que la
                ha conseguido.
              </h1>
              <p
                className="mt-6 max-w-xl text-pretty leading-relaxed text-ink-2"
                style={{ fontSize: "var(--text-lead)" }}
              >
                Sin pedirle al cliente que escriba el nombre del vendedor.
                Sin Excel. Sin disputas internas. Atribuya cruza cada reseña
                nueva con quién la consiguió y la asigna en automático.
              </p>
            </div>
            <div className="md:col-span-4 md:pt-2">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-ink-2"
              >
                Solicitar demo
                <svg
                  className="h-3.5 w-3.5"
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
                Llamada de 20 minutos. Sin compromiso.
              </p>
            </div>
          </div>

          {/* Atribución del dato + sectores */}
          <p className="mt-12 text-[12px] leading-relaxed text-ink-4 sm:mt-14">
            Datos del despliegue piloto de Atribuya en una promotora
            inmobiliaria real — 4 comerciales, 1 ficha de Google Business
            Profile, primer mes. Sector, tamaño y métricas reales; nombre del
            cliente reservado hasta firma de permiso comercial.
          </p>

          <div className="mt-10">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
              Hecho para
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2 sm:text-[16px]">
              {SECTORS.map((s, i) => (
                <span key={s}>
                  {s}
                  {i < SECTORS.length - 1 && (
                    <span className="mx-2 text-ink-4" aria-hidden="true">
                      ·
                    </span>
                  )}
                </span>
              ))}
              .
            </p>
          </div>
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
                  las sigue. Y al final, la pregunta que ningún admin sabe
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
        </section>

        {/* ============================= Caso real ============================= */}
        <section
          id="caso"
          aria-label="Caso real"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
              Caso real
            </p>
            <h2
              className="mt-3 font-display font-medium leading-[1.1] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Una promotora con piso piloto en la
              <em className="font-light text-ink-2"> Costa de Castellón.</em>
            </h2>
            <div
              className="mt-7 space-y-5 leading-relaxed text-ink-2"
              style={{ fontSize: "var(--text-lead)" }}
            >
              <p>
                Cuatro comerciales, una ficha de Google Business Profile en el
                piso piloto. Antes de Atribuya, el administrador tardaba{" "}
                <strong className="font-semibold text-ink">
                  dos tardes al mes
                </strong>{" "}
                atribuyendo reseñas en una hoja de Excel — y aun así había
                discusiones sobre a quién pertenecía cada una.
              </p>
              <p>
                En el primer mes con Atribuya, el sistema atribuyó{" "}
                <strong className="font-semibold text-ink">
                  el 100% de las reseñas verificadas
                </strong>{" "}
                a su comercial responsable, sin intervención manual. La hoja de
                Excel desapareció. Las discusiones también.
              </p>
              <p className="text-ink-3">
                Como referencia: <span className="tabular-nums">≈ 8 h/mes</span>{" "}
                ahorradas frente a la atribución manual, y cero disputas
                internas sobre la propiedad de una reseña.
              </p>
            </div>
            <p className="mt-10 text-[12px] leading-relaxed text-ink-4">
              Sector, tamaño y métricas reales; nombre del cliente reservado
              hasta firma de permiso comercial.
            </p>
          </div>
        </section>

        {/* =========================== Características =========================== */}
        <section
          aria-label="Qué incluye"
          className="mx-auto max-w-6xl px-5 py-16 sm:py-24"
        >
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
        </section>

        {/* ============================== Precios ============================== */}
        <section
          id="precios"
          aria-label="Precios"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <div className="max-w-2xl">
              <h2
                className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
                style={{ fontSize: "var(--text-h2)" }}
              >
                Un plan, <em className="font-light">sin sorpresas.</em>
              </h2>
              <p
                className="mt-5 leading-relaxed text-ink-2"
                style={{ fontSize: "var(--text-lead)" }}
              >
                Implantación llave en mano y suscripción mensual. Cancelas
                cuando quieras.
              </p>
            </div>

            <div className="mt-12 grid items-start gap-10 md:grid-cols-12">
              {/* Card destacada — único nivel "elevado" del page */}
              <article className="md:col-span-7 md:col-start-1">
                <div className="overflow-hidden rounded-2xl border border-ink/15 bg-bg shadow-card">
                  <div className="border-b border-line bg-white px-7 py-7 sm:px-9 sm:py-8">
                    <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                      Plan Professional
                    </p>
                    <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-[2.75rem] font-medium leading-none tracking-tight text-ink sm:text-[3.5rem]">
                        990&nbsp;€
                      </span>
                      <span className="text-[14px] text-ink-3">
                        implantación llave en mano
                      </span>
                    </p>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-[1.625rem] font-medium leading-none tracking-tight text-ink sm:text-[2rem]">
                        + 397&nbsp;€
                      </span>
                      <span className="text-[14px] text-ink-3">/ mes</span>
                    </p>
                    <a
                      href="#contacto"
                      className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-ink-2"
                    >
                      Solicitar demo
                      <svg
                        className="h-3.5 w-3.5"
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
                    <p className="mt-3 text-center text-[13px] text-ink-3">
                      Sin permanencia.
                    </p>
                  </div>
                  <div className="px-7 py-7 sm:px-9 sm:py-8">
                    <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                      Incluye
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {PRICING_INCLUDED.map((it) => (
                        <li key={it} className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-ok"
                          />
                          <span className="text-[14.5px] leading-relaxed text-ink-2">
                            {it}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 border-t border-line pt-6">
                      <p className="font-display text-[16px] font-medium text-ink sm:text-[17px]">
                        <em className="font-light">Garantía:</em> si no
                        funciona, te devolvemos la implantación íntegra.
                      </p>
                      <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                        Si en los primeros 90 días Atribuya no atribuye
                        correctamente al menos el 70&nbsp;% de las reseñas
                        pasadas por enlaces de tus comerciales, te devolvemos
                        los 990&nbsp;€ íntegros. Sin preguntas.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Bloque Insignia — separado, calmado, sin badge ni border-gold */}
              <aside
                aria-label="Programa Cliente Insignia"
                className="md:col-span-5 md:pt-6"
              >
                <p className="font-display text-[13px] font-medium uppercase tracking-[0.16em] text-gold">
                  Cliente Insignia · 5 plazas
                </p>
                <p
                  className="mt-4 font-display font-medium leading-[1.15] tracking-tight text-ink"
                  style={{ fontSize: "var(--text-h3)" }}
                >
                  <em className="font-light">Para las primeras cinco</em>{" "}
                  empresas que entren ahora, condiciones especiales.
                </p>
                <dl className="mt-6 space-y-4 text-[14.5px] leading-relaxed text-ink-2">
                  <div className="flex justify-between gap-4 border-b border-line pb-3">
                    <dt>Implantación</dt>
                    <dd className="text-right">
                      <span className="font-semibold text-ink">490 €</span>{" "}
                      <span className="text-ink-4">en lugar de 990 €</span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-3">
                    <dt>
                      Suscripción
                      <br />
                      <span className="text-[13px] text-ink-3">
                        primer año
                      </span>
                    </dt>
                    <dd className="text-right">
                      <span className="font-semibold text-ink">197&nbsp;€/mes</span>{" "}
                      <span className="text-ink-4">en lugar de 397&nbsp;€</span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>A partir del mes&nbsp;13</dt>
                    <dd className="text-right text-ink-3">
                      tarifa estándar de 397&nbsp;€/mes
                    </dd>
                  </div>
                </dl>
                <p className="mt-7 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                  Lo que pedimos a cambio
                </p>
                <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-2">
                  <li>Compromiso de permanencia mínima de 12 meses.</li>
                  <li>Permiso para usar tu nombre como referencia.</li>
                  <li>Una entrevista breve cuando hayan pasado 6 meses.</li>
                </ul>
                <p className="mt-5 text-[13px] italic leading-relaxed text-ink-3">
                  Si quieres entrar como Cliente Insignia, dilo expresamente en
                  la llamada.
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* ================================ FAQ ================================ */}
        <section
          id="faq"
          aria-label="Preguntas frecuentes"
          className="mx-auto max-w-3xl px-5 py-16 sm:py-24"
        >
          <h2
            className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h2)" }}
          >
            <em className="font-light">Lo que nos suelen</em> preguntar.
          </h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                name="faq"
                className="group open:bg-white"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
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
                <div className="space-y-3 pb-6 text-[15px] leading-relaxed text-ink-2">
                  {a.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
          {/* JSON-LD FAQPage para rich snippets en Google. Renderiza inline
              en el SSR para que Googlebot lo lea en el primer fetch. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </section>

        {/* ============================= Contacto ============================= */}
        <section
          id="contacto"
          aria-label="Solicitar demo"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <h2
              className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              <em className="font-light">¿Te interesa?</em>
              <br />
              Cuéntanos brevemente.
            </h2>
            <p
              className="mt-5 max-w-xl leading-relaxed text-ink-2"
              style={{ fontSize: "var(--text-lead)" }}
            >
              Respondemos en menos de 24&nbsp;h. La demo dura 20 minutos: te
              enseñamos la app en vivo con datos de ejemplo y vemos si encaja
              en tu equipo.
            </p>
            <div className="mt-10">
              <LeadForm locale="es" />
            </div>
          </div>
        </section>
      </main>

      <Footer locale="es" />
    </div>
  );
}
