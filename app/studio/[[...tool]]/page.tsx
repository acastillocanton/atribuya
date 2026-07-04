import type { Metadata, Viewport } from "next";
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from "next-sanity/studio";
import { isSanityConfigured } from "@/sanity/env";
import { StudioClient } from "./StudioClient";

// El Studio es una SPA cliente con auth propia de Sanity: nada que prerender.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...studioMetadata,
  title: "Sanity Studio | Atribuya",
  robots: { index: false, follow: false },
};

// next-sanity tipa viewportFit como string genérico; el valor real es "cover".
export const viewport: Viewport = {
  ...studioViewport,
} as Viewport;

export default function StudioPage() {
  if (!isSanityConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-5 font-text">
        <div className="max-w-md rounded-lg border border-line bg-surface p-8 shadow-card">
          <h1 className="font-display text-xl font-medium text-ink">
            El CMS no está configurado
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-3">
            Falta definir <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code>{" "}
            en las variables de entorno. Crea el proyecto en{" "}
            <a
              href="https://sanity.io/manage"
              className="underline decoration-line-strong underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              sanity.io/manage
            </a>{" "}
            y añade el Project ID en local y en Vercel.
          </p>
        </div>
      </div>
    );
  }
  return <StudioClient />;
}
