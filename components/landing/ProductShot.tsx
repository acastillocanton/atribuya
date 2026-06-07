"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Locale = "es" | "en";

const STRINGS = {
  es: { zoom: "Clic para ampliar", close: "Cerrar", hint: "Pulsa Esc o haz clic fuera para cerrar", pending: "Captura pendiente" },
  en: { zoom: "Click to enlarge", close: "Close", hint: "Press Esc or click outside to close", pending: "Screenshot pending" },
} as const;

/**
 * Marco de "navegador" sutil que enmarca capturas del producto en la landing.
 * Barra superior con tres puntos y una pseudo-URL. Encaja con el tono editorial
 * de la landing (border-line, rounded, shadow-card).
 */
export function BrowserFrame({
  url = "atribuya.com",
  children,
  className = "",
}: {
  url?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-white shadow-card ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-line bg-ink/[0.03] px-3.5 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
        </span>
        <span className="ml-2 truncate rounded-md bg-white px-2.5 py-1 text-[11.5px] text-ink-4">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * Captura del producto enmarcada, con lightbox al hacer clic.
 *
 *  - next/image optimizado, lazy por defecto (no daña el LCP del hero).
 *  - Lightbox: overlay fullscreen, cierre con Escape o clic fuera, bloqueo de
 *    scroll del body. Adaptado del patrón de components/help/HelpFigure.tsx.
 *  - Degradación: si el fichero no existe, onError pinta un placeholder con la
 *    ruta esperada en lugar de una imagen rota. La página nunca se ve incompleta.
 */
export function ProductShot({
  src,
  alt,
  caption,
  width,
  height,
  url,
  locale,
  interactive = true,
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  url?: string;
  locale: Locale;
  /** Si false, no abre lightbox (usado como fallback estático del clip). */
  interactive?: boolean;
  className?: string;
}) {
  const t = STRINGS[locale];
  const [hasError, setHasError] = useState(false);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const aspect = `${width} / ${height}`;

  const media = hasError ? (
    <div
      className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center"
      style={{
        aspectRatio: aspect,
        background:
          "repeating-linear-gradient(45deg, var(--surface-2, #f4f4f5), var(--surface-2, #f4f4f5) 8px, var(--bg, #fafafa) 8px, var(--bg, #fafafa) 16px)",
      }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-4">
        {t.pending}
      </span>
      <code className="rounded-md border border-line bg-white px-2 py-1 text-[12px] text-ink-2">
        public{src}
      </code>
    </div>
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="(min-width: 768px) 60vw, 100vw"
      onError={() => setHasError(true)}
      className="block h-auto w-full bg-bg"
    />
  );

  const canZoom = interactive && !hasError;

  return (
    <figure className={className}>
      {canZoom ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`${t.zoom}: ${alt}`}
          className="block w-full cursor-zoom-in rounded-xl transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <BrowserFrame url={url}>{media}</BrowserFrame>
        </button>
      ) : (
        <BrowserFrame url={url}>{media}</BrowserFrame>
      )}

      {caption && (
        <figcaption className="mt-3 text-[13.5px] leading-relaxed text-ink-3">
          {caption}
        </figcaption>
      )}

      {open && canZoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={close}
          className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-black/85 p-6 sm:p-10"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label={t.close}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-2xl leading-none text-white"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[95vw] cursor-default rounded-lg object-contain shadow-2xl"
          />
          <p className="absolute inset-x-0 bottom-5 mx-auto max-w-2xl px-10 text-center text-[13px] text-white/85">
            {caption ?? alt}
            <span className="mt-1 block text-[11px] text-white/50">{t.hint}</span>
          </p>
        </div>
      )}
    </figure>
  );
}
