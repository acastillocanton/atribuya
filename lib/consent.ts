// Consentimiento de cookies analíticas (Google Analytics 4).
// Estos valores los comparten el orquestador (components/analytics/Analytics.tsx)
// y el enlace de "Cookies" del footer (components/landing/CookiePrefs.tsx), por
// eso viven en un módulo plano sin "use client".

export const CONSENT_KEY = "atribuya.cookie-consent";

// Evento de window para reabrir el banner desde el footer (revocar/cambiar la
// elección). La ley exige que retirar el consentimiento sea tan fácil como darlo.
export const CONSENT_EVENT = "atribuya:open-cookie-consent";

export type CookieConsent = "granted" | "denied";
