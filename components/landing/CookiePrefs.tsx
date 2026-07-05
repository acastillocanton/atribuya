"use client";

import { CONSENT_EVENT } from "@/lib/consent";

// Reabre el banner de cookies para revocar o cambiar el consentimiento.
// Solo tiene efecto si GA está configurado (si no, no hay banner que abrir).
export function CookiePrefs({ label }: { label: string }) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_EVENT))}
      className="transition hover:text-ink"
    >
      {label}
    </button>
  );
}
