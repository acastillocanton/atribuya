"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/marketing/nav";

/**
 * Resuelve la URL de la versión en el otro idioma de la PÁGINA ACTUAL.
 *
 * Fuente de verdad: las etiquetas `<link rel="alternate" hreflang="…">` que
 * cada página ya emite para Google (en los posts del blog salen de
 * `translationSlug`, en secciones/legales de su metadata). Si la página las
 * tiene, el selector de idioma acierta con la página equivalente exacta sin
 * cablear nada página a página; si no, cae al `fallback` que pasa el layout
 * (p. ej. el índice del blog o la home del otro idioma).
 *
 * Se relee al cambiar `pathname` (useEffect corre tras el commit, con el
 * `<head>` ya actualizado por el App Router en navegaciones cliente).
 */
export function useAltLangHref(locale: Locale, fallback: string): string {
  const pathname = usePathname();
  const [altHref, setAltHref] = useState(fallback);

  useEffect(() => {
    const target = locale === "es" ? "en" : "es";
    const link = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${target}"]`,
    );
    if (!link?.href) {
      setAltHref(fallback);
      return;
    }
    try {
      // hreflang lleva URL absoluta; Link necesita ruta relativa para navegar
      // en cliente (una URL absoluta fuerza recarga completa).
      const url = new URL(link.href);
      setAltHref(url.pathname + url.search);
    } catch {
      setAltHref(fallback);
    }
  }, [locale, fallback, pathname]);

  return altHref;
}
