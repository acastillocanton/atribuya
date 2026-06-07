"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  CONSENT_EVENT,
  CONSENT_KEY,
  type CookieConsent,
} from "@/lib/consent";
import { CookieBanner } from "./CookieBanner";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Solo medimos las páginas públicas de marketing y legales. La app interna
// autenticada (/dashboard, /panel, etc.) NO se rastrea: ni banner ni GA.
function isPublicPath(p: string): boolean {
  if (p === "/" || p === "/en") return true;
  return ["/en/", "/gracias", "/terminos", "/privacidad"].some((prefix) =>
    p.startsWith(prefix),
  );
}

function localeFor(p: string): "es" | "en" {
  return p === "/en" || p.startsWith("/en/") ? "en" : "es";
}

export function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [reopened, setReopened] = useState(false);

  // Leemos la elección guardada después de montar, para no romper la hidratación.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (stored === "granted" || stored === "denied") setConsent(stored);
    } catch {
      // localStorage puede no estar disponible (modo privado, etc.)
    }
    setHydrated(true);
  }, []);

  // El footer puede reabrir el banner para revocar/cambiar la decisión.
  useEffect(() => {
    const handler = () => setReopened(true);
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  const choose = useCallback((value: CookieConsent) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // sin persistencia: la decisión vale solo para esta sesión
    }
    setConsent(value);
    setReopened(false);
  }, []);

  if (!GA_ID || !isPublicPath(pathname)) return null;

  const showBanner = hydrated && (consent === null || reopened);
  // Cargamos gtag solo tras el opt-in y solo en producción (en dev probamos el
  // banner sin contaminar los datos de GA).
  const loadGa = consent === "granted" && process.env.NODE_ENV === "production";

  return (
    <>
      {loadGa && (
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
      {showBanner && (
        <CookieBanner
          locale={localeFor(pathname)}
          onAccept={() => choose("granted")}
          onReject={() => choose("denied")}
        />
      )}
    </>
  );
}
