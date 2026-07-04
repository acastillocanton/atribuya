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

export type Crumb = { name: string; path: string };

// Fuente ÚNICA del breadcrumb: devuelve a la vez los `items` para el
// componente visible (hrefs relativos, para navegación con next/link) y el
// `jsonLd` BreadcrumbList (URLs absolutas, para Google). Así el dato
// estructurado y la miga de pan visible nunca se desincronizan. `crumbs` son
// los niveles DESPUÉS de Inicio (que se antepone automáticamente).
export function makeBreadcrumb({
  locale,
  crumbs,
}: {
  locale: Locale;
  crumbs: Crumb[];
}) {
  const home: Crumb = {
    name: locale === "es" ? "Inicio" : "Home",
    path: locale === "es" ? "/" : "/en",
  };
  const all = [home, ...crumbs];
  return {
    items: all.map((c) => ({ name: c.name, href: c.path })),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: all.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: `${ORIGIN}${c.path}`,
      })),
    },
  };
}
