// Disparo seguro de eventos a Google Analytics 4. Es un no-op si gtag no está
// cargado: sin consentimiento del usuario, en desarrollo, o si un bloqueador
// lo impide. Así el código de producto no necesita saber nada del consentimiento.
type GtagFn = (...args: unknown[]) => void;

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag === "function") {
    gtag("event", name, params ?? {});
  }
}
