"use client";

import { BrowserFrame } from "./ProductShot";

type Locale = "es" | "en";

const STRINGS = {
  es: {
    url: "atribuya.com",
    caption:
      "El producto en marcha: el enlace y el QR del comercial, la reseña que entra y se atribuye sola, y lo que ve el administrador. Datos de ejemplo.",
    fallback: "Tu navegador no puede reproducir el vídeo.",
  },
  en: {
    url: "atribuya.com",
    caption:
      "The product in motion: the rep's link and QR, the review coming in and getting attributed on its own, and what the admin sees. Sample data.",
    fallback: "Your browser cannot play the video.",
  },
} as const;

/**
 * Clip de demostración del producto, enmarcado en el mismo BrowserFrame que las
 * capturas estáticas. Autoplay silenciado en bucle (los navegadores exigen muted
 * para autoplay). Generado con scripts/capture-demo.py (modo demo, con rótulos).
 *
 *  - preload="metadata": no descarga el vídeo entero antes de tiempo (vive a
 *    media página, no afecta al LCP del hero).
 *  - poster: si el autoplay se bloquea o el vídeo aún no carga, queda el póster.
 *  - sin controles: es un clip ambiental en bucle, no un reproductor.
 */
export function ProductDemo({
  locale,
  className = "",
}: {
  locale: Locale;
  className?: string;
}) {
  const t = STRINGS[locale];
  return (
    <figure className={className}>
      <BrowserFrame url={t.url}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`/landing/demo-poster-${locale}.jpg`}
          aria-label={t.caption}
          className="block h-auto w-full bg-bg"
        >
          <source src={`/landing/demo-${locale}.webm`} type="video/webm" />
          <source src={`/landing/demo-${locale}.mp4`} type="video/mp4" />
          {t.fallback}
        </video>
      </BrowserFrame>
      <figcaption className="mt-3 text-[13.5px] leading-relaxed text-ink-3">
        {t.caption}
      </figcaption>
    </figure>
  );
}
