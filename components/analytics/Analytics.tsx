"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const IUB_WIDGET_ID = process.env.NEXT_PUBLIC_IUBENDA_WIDGET_ID;

// Solo medimos las páginas públicas de marketing y legales. La app interna
// autenticada (/dashboard, /panel, etc.) NO se rastrea: ni banner ni GA.
function isPublicPath(p: string): boolean {
  if (p === "/" || p === "/en" || p === "/blog") return true;
  return [
    "/en/",
    "/blog/",
    "/producto",
    "/precios",
    "/casos",
    "/demo",
    "/gracias",
    "/terminos",
    "/privacidad",
  ].some((prefix) => p.startsWith(prefix));
}

// Consentimiento gestionado por la Cookie Solution de Iubenda (banner + registro
// de consentimiento + autobloqueo de terceros). El widget trae toda la config
// del dashboard (idioma, textos, políticas). El autobloqueo de Iubenda detecta
// GA por su src (googletagmanager) y no lo activa hasta que el usuario acepta,
// así que cargamos gtag con normalidad y Iubenda lo gobierna. Sin widget no se
// carga nada (degradado). GA solo en producción (en dev no se ensucian datos).
export function Analytics() {
  const pathname = usePathname();
  if (!IUB_WIDGET_ID || !isPublicPath(pathname)) return null;

  const isProd = process.env.NODE_ENV === "production";

  return (
    <>
      {/* Cookie Solution de Iubenda: se carga primero para que el autobloqueo
          intercepte los trackers. */}
      <Script
        src={`https://embeds.iubenda.com/widgets/${IUB_WIDGET_ID}.js`}
        strategy="afterInteractive"
      />

      {/* GA4: el autobloqueo de Iubenda lo bloquea hasta el consentimiento. */}
      {isProd && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
