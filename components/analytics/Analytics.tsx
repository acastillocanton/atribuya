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

// Consentimiento gestionado por la Cookie Solution de Iubenda con Google Consent
// Mode v2. El orden de los scripts importa: primero el estado por defecto
// (denegado), luego Iubenda (emite el `consent update`), y por último gtag. No
// se carga nada si faltan GA_ID o los IDs de Iubenda (degradado, sin CMP no hay
// GA). Config del CMP (banner, idioma) dirigida por el dashboard de Iubenda.
export function Analytics() {
  const pathname = usePathname();
  if (!GA_ID || !IUB_SITE_ID || !IUB_POLICY_ID || !isPublicPath(pathname)) {
    return null;
  }

  const lang = localeFor(pathname);
  const isProd = process.env.NODE_ENV === "production";

  const iubConfig = {
    siteId: Number(IUB_SITE_ID),
    cookiePolicyId: Number(IUB_POLICY_ID),
    lang,
    countryDetection: true,
    perPurposeConsent: true,
    // Consentimiento explícito (RGPD/LSSI): nada de "seguir navegando = aceptar".
    consentOnContinuedBrowsing: false,
    // Iubenda emite las señales de Google Consent Mode (default denied + update).
    googleConsentMode: "template",
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
      {/* 1. Consent Mode: todo denegado por defecto, ANTES que nada. El
          wait_for_update retiene los tags hasta que Iubenda emite el update. */}
      <Script id="consent-default" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`}
      </Script>

      {/* 2. Configuración de la Cookie Solution de Iubenda. */}
      <Script id="iub-config" strategy="afterInteractive">
        {`var _iub=_iub||[];_iub.csConfiguration=${JSON.stringify(iubConfig)};`}
      </Script>

      {/* 3. Iubenda: autobloqueo + loader del CMP, ANTES del tag de Google. */}
      <Script
        src={`https://cs.iubenda.com/autoblocking/${IUB_SITE_ID}.js`}
        strategy="afterInteractive"
      />
      <Script src="https://cdn.iubenda.com/cs/iubenda_cs.js" strategy="afterInteractive" />

      {/* 4. gtag: ahora siempre en páginas públicas; Consent Mode gobierna los
          datos. En dev no se cargan hits reales para no ensuciar GA. */}
      {isProd && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
