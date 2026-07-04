import type { Metadata } from "next";
import type { Locale } from "./nav";

const ORIGIN = "https://atribuya.com";

// Metadata de una página de sección: canonical propio, hreflang ES↔EN,
// openGraph y robots index:true (revierte el noindex global de app/layout.tsx).
export function sectionMetadata({
  locale,
  title,
  description,
  esPath,
  enPath,
}: {
  locale: Locale;
  title: string;
  description: string;
  esPath: string; // p. ej. "/precios"
  enPath: string; // p. ej. "/en/pricing"
}): Metadata {
  const path = locale === "es" ? esPath : enPath;
  return {
    title,
    description,
    alternates: {
      canonical: `${ORIGIN}${path}`,
      languages: {
        "es-ES": `${ORIGIN}${esPath}`,
        "en-US": `${ORIGIN}${enPath}`,
        "x-default": `${ORIGIN}${esPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${ORIGIN}${path}`,
      siteName: "Atribuya",
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

// Breadcrumb JSON-LD (Inicio → sección) para las páginas de sección.
export function breadcrumbJsonLd({
  locale,
  name,
  path,
}: {
  locale: Locale;
  name: string;
  path: string;
}) {
  const home = locale === "es" ? `${ORIGIN}/` : `${ORIGIN}/en`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "es" ? "Inicio" : "Home",
        item: home,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: `${ORIGIN}${path}`,
      },
    ],
  };
}
