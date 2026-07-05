import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb } from "@/lib/marketing/seo";
import { CookiePrefs } from "@/components/landing/CookiePrefs";

export const metadata: Metadata = {
  title: "Política de Cookies · Atribuya",
  description:
    "Política de Cookies de Atribuya: qué cookies usamos, con qué finalidad, cuánto duran y cómo aceptar, rechazar o retirar tu consentimiento.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://atribuya.com/cookies",
    languages: {
      "es-ES": "https://atribuya.com/cookies",
      "en-US": "https://atribuya.com/en/cookies",
    },
  },
};

const bc = makeBreadcrumb({
  locale: "es",
  crumbs: [{ name: "Política de Cookies", path: "/cookies" }],
});

export default function CookiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <Breadcrumbs
        items={bc.items}
        className="mx-auto w-full max-w-6xl px-5 pt-6"
      />
      <article className="mx-auto w-full max-w-[720px] px-6 pt-8">
        <h1 style={h1}>Política de Cookies</h1>
        <p style={lede}>Última actualización: 5 de julio de 2026.</p>

        <p style={p}>
          Esta Política de Cookies explica qué son las cookies, cuáles utiliza{" "}
          <strong>Atribuya</strong> en el sitio web atribuya.com, con qué
          finalidad, cuánto duran y cómo puedes aceptarlas, rechazarlas o
          retirar tu consentimiento en cualquier momento. Complementa a nuestra{" "}
          <Link href="/privacidad" style={a}>
            Política de Privacidad
          </Link>
          .
        </p>

        <h2 style={h2}>1. Qué son las cookies</h2>
        <p style={p}>
          Una cookie es un pequeño fichero de texto que un sitio web guarda en
          tu navegador cuando lo visitas. Sirve, entre otras cosas, para
          recordar tus preferencias o para medir de forma agregada cómo se usa
          el sitio. Junto a las cookies existen tecnologías similares
          (almacenamiento local, identificadores) que tratamos con el mismo
          criterio.
        </p>

        <h2 style={h2}>2. Cookies que utilizamos</h2>
        <p style={p}>
          En las páginas públicas de atribuya.com solo usamos cookies técnicas
          y, previo consentimiento, cookies analíticas de Google Analytics. No
          usamos cookies publicitarias ni de perfilado comercial.
        </p>

        <div style={{ overflowX: "auto", margin: "0 0 18px" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Cookie</th>
                <th style={th}>Titular</th>
                <th style={th}>Finalidad</th>
                <th style={th}>Tipo</th>
                <th style={th}>Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>
                  <code style={code}>atribuya_consent</code>
                </td>
                <td style={td}>Atribuya (propia)</td>
                <td style={td}>
                  Recuerda tu decisión sobre las cookies (aceptadas o
                  rechazadas, por categoría) y sirve como prueba de tu
                  consentimiento.
                </td>
                <td style={td}>Técnica (necesaria)</td>
                <td style={td}>6 meses</td>
              </tr>
              <tr>
                <td style={td}>Cookies de sesión</td>
                <td style={td}>Atribuya (propia)</td>
                <td style={td}>
                  Mantienen tu sesión iniciada y el funcionamiento del área
                  privada. Solo se usan si accedes a la aplicación.
                </td>
                <td style={td}>Técnica (necesaria)</td>
                <td style={td}>Sesión</td>
              </tr>
              <tr>
                <td style={td}>
                  <code style={code}>_ga</code>,{" "}
                  <code style={code}>_ga_*</code>
                </td>
                <td style={td}>Google Ireland Limited</td>
                <td style={td}>
                  Miden de forma agregada el uso de las páginas públicas
                  (visitas, páginas vistas) para ayudarnos a mejorarlas.
                </td>
                <td style={td}>Analítica (terceros)</td>
                <td style={td}>Hasta 2 años</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={p}>
          Las cookies técnicas están exentas de consentimiento conforme al art.
          22.2 LSSI, porque son imprescindibles para prestar el servicio. Las
          cookies analíticas de Google <strong>solo se cargan si prestas tu
          consentimiento previo</strong>: hasta que pulsas «Aceptar» no se
          ejecuta ningún script de Google ni se instala ninguna cookie
          analítica.
        </p>

        <h2 style={h2}>3. Base jurídica y consentimiento</h2>
        <p style={p}>
          La base para el uso de cookies técnicas es el interés legítimo en
          prestar un servicio que el usuario ha solicitado. La base para las
          cookies analíticas es tu <strong>consentimiento</strong> (art. 6.1.a
          RGPD), que recogemos mediante un banner que se muestra en tu primera
          visita. Puedes rechazarlas con la misma facilidad con la que las
          aceptas, sin que ello afecte a la navegación. Guardamos tu elección
          con marca de tiempo y versión, de modo que podamos respetarla y
          acreditar tu consentimiento; si actualizamos esta política, te
          volveremos a preguntar.
        </p>

        <h2 style={h2}>4. Cómo gestionar o retirar tu consentimiento</h2>
        <p style={p}>
          Puedes cambiar o retirar tu decisión en cualquier momento desde el
          panel de preferencias de cookies:
        </p>
        <p style={p}>
          <CookiePrefs label="Abrir preferencias de cookies" />
        </p>
        <p style={p}>
          También encontrarás el enlace «Cookies» en el pie de cada página.
          Además, puedes bloquear o eliminar las cookies desde la configuración
          de tu navegador (Chrome, Firefox, Safari, Edge y demás permiten
          gestionarlas y borrarlas). Ten en cuenta que bloquear las cookies
          técnicas puede afectar al funcionamiento del área privada.
        </p>

        <h2 style={h2}>5. Transferencias internacionales</h2>
        <p style={p}>
          Google Analytics es un servicio de Google Ireland Limited. Al usarlo,
          Google puede tratar datos y transferirlos a Google LLC (EE. UU.),
          amparándose en las cláusulas contractuales tipo de la Comisión Europea
          y en el marco de privacidad de datos UE-EE. UU. Puedes consultar cómo
          trata Google los datos en{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={a}
          >
            policies.google.com/privacy
          </a>
          , e instalar el{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            style={a}
          >
            complemento de inhabilitación de Google Analytics
          </a>{" "}
          para tu navegador.
        </p>

        <h2 style={h2}>6. Cambios en esta política</h2>
        <p style={p}>
          Podemos actualizar esta Política de Cookies para reflejar cambios en
          el sitio, en las herramientas que utilizamos o en la normativa
          aplicable. La fecha de la última actualización aparece al principio del
          documento. Cuando el cambio afecte a las cookies sujetas a
          consentimiento, te volveremos a pedir tu elección.
        </p>

        <h2 style={h2}>7. Contacto</h2>
        <p style={p}>
          Responsable: <strong>Alejandro Castillo Cantón</strong>. Para
          cualquier duda sobre esta política puedes escribir a{" "}
          <a href="mailto:alejandro@atribuya.com" style={a}>
            alejandro@atribuya.com
          </a>
          .
        </p>
      </article>
    </>
  );
}

const h1: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 32,
  fontWeight: 700,
  letterSpacing: "-0.025em",
  margin: "0 0 12px",
};
const lede: React.CSSProperties = {
  margin: "0 0 28px",
  fontSize: 13.5,
  color: "var(--ink-3)",
};
const h2: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 19,
  fontWeight: 600,
  letterSpacing: "-0.015em",
  margin: "32px 0 12px",
};
const p: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 14.5,
  lineHeight: 1.65,
  color: "var(--ink-2)",
};
const a: React.CSSProperties = {
  color: "var(--ink)",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};
const table: React.CSSProperties = {
  width: "100%",
  minWidth: 560,
  borderCollapse: "collapse",
  fontSize: 13.5,
  color: "var(--ink-2)",
};
const th: React.CSSProperties = {
  textAlign: "left",
  fontWeight: 600,
  color: "var(--ink)",
  borderBottom: "1px solid var(--line-strong)",
  padding: "8px 10px",
  verticalAlign: "top",
};
const td: React.CSSProperties = {
  borderBottom: "1px solid var(--line)",
  padding: "8px 10px",
  verticalAlign: "top",
  lineHeight: 1.5,
};
const code: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  background: "var(--surface-2)",
  padding: "1px 5px",
  borderRadius: 5,
};
