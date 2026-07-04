"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const IUB_SITE_ID = process.env.NEXT_PUBLIC_IUBENDA_SITE_ID;
const IUB_POLICY_ID = process.env.NEXT_PUBLIC_IUBENDA_COOKIE_POLICY_ID;

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

function localeFor(p: string): "es" | "en" {
  return p === "/en" || p.startsWith("/en/") ? "en" : "es";
}

// Consentimiento gestionado por la Cookie Solution de Iubenda (embed clásico:
// config inline + loader). Se usa el embed clásico y NO el widget
// (embeds.iubenda.com/widgets/…) porque el widget depende de
// document.currentScript, que es null al cargarlo con next/script async → el
// banner no llega a pintarse. El loader clásico lee la config de
// window._iub.csConfiguration, así que funciona con carga asíncrona.
//
// Plan Gratis: autobloqueo (sin Google Consent Mode). GA se carga con
// normalidad y el autobloqueo de Iubenda lo detecta por su src y no lo activa
// hasta que el usuario acepta. Sin los IDs de Iubenda no se carga nada
// (degradado). GA solo en producción (en dev no se ensucian datos).
export function Analytics() {
  const pathname = usePathname();
  if (!IUB_SITE_ID || !IUB_POLICY_ID || !isPublicPath(pathname)) return null;

  const isProd = process.env.NODE_ENV === "production";
  const iubConfig = {
    siteId: Number(IUB_SITE_ID),
    cookiePolicyId: Number(IUB_POLICY_ID),
    lang: localeFor(pathname),
    banner: {
      position: "float-bottom-center",
      acceptButtonDisplay: true,
      customizeButtonDisplay: true,
      rejectButtonDisplay: true,
      // Sin botón "X" que pueda interpretarse como consentimiento.
      closeButtonDisplay: false,
      explicitWithdrawal: true,
      listPurposes: true,
    },
  };

  return (
    <>
      {/* 1. Config de Iubenda en el global, ANTES de los loaders. */}
      <Script id="iub-config" strategy="afterInteractive">
        {`window._iub=window._iub||[];window._iub.csConfiguration=${JSON.stringify(iubConfig)};`}
      </Script>

      {/* 2. Autobloqueo + loader del CMP (Cookie Solution). */}
      <Script
        src={`https://cs.iubenda.com/autoblocking/${IUB_SITE_ID}.js`}
        strategy="afterInteractive"
      />
      <Script src="https://cdn.iubenda.com/cs/iubenda_cs.js" strategy="afterInteractive" />

      {/* 3. GA4: el autobloqueo de Iubenda lo bloquea hasta el consentimiento. */}
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
