"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import * as CookieConsent from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { cookieConsentConfig } from "@/lib/cookie-consent-config";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
    "/como-funciona",
    "/demo",
    "/recursos",
    "/gracias",
    "/terminos",
    "/privacidad",
    "/cookies",
  ].some((prefix) => p.startsWith(prefix));
}

function localeFor(p: string): "es" | "en" {
  return p === "/en" || p.startsWith("/en/") ? "en" : "es";
}

export function Analytics() {
  const pathname = usePathname();
  const [analyticsAccepted, setAnalyticsAccepted] = useState(false);
  const started = useRef(false);

  const onPublic = Boolean(GA_ID) && isPublicPath(pathname);
  const locale = localeFor(pathname);

  // Arranca vanilla-cookieconsent una sola vez, cuando estamos en una página
  // pública. La librería pinta el banner, persiste la elección en su cookie y
  // guarda el registro versionado del consentimiento (prueba RGPD). El callback
  // onConsent/onChange nos dice si la analítica está aceptada.
  useEffect(() => {
    if (!onPublic || started.current) return;
    started.current = true;
    void CookieConsent.run(
      cookieConsentConfig({
        defaultLang: locale,
        onAnalyticsConsent: setAnalyticsAccepted,
      }),
    );
  }, [onPublic, locale]);

  // Mantén el idioma del banner/modal sincronizado con la navegación ES↔EN.
  useEffect(() => {
    if (started.current) void CookieConsent.setLanguage(locale);
  }, [locale]);

  if (!onPublic) return null;

  // Cargamos gtag solo tras aceptar la analítica y solo en producción (en dev
  // probamos el banner sin contaminar los datos de GA).
  const loadGa = analyticsAccepted && process.env.NODE_ENV === "production";

  if (!loadGa) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
