"use client";

import * as CookieConsent from "vanilla-cookieconsent";

// Abre el modal de preferencias de cookies para revocar o cambiar el
// consentimiento. Solo tiene efecto si GA está configurado (si no, el banner
// nunca arranca, ver components/analytics/Analytics.tsx).
export function CookiePrefs({ label }: { label: string }) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return null;

  return (
    <button
      type="button"
      onClick={() => CookieConsent.showPreferences()}
      className="transition hover:text-ink"
    >
      {label}
    </button>
  );
}
