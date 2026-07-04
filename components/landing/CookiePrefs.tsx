"use client";

type IubApi = { cs?: { api?: { openPreferences?: () => void } } };

// Reabre el centro de preferencias de la Cookie Solution de Iubenda para
// revocar o cambiar el consentimiento. Solo se muestra si Iubenda está
// configurado; el optional chaining protege el caso en que aún no ha cargado.
export function CookiePrefs({ label }: { label: string }) {
  if (!process.env.NEXT_PUBLIC_IUBENDA_WIDGET_ID) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const iub = (window as unknown as { _iub?: IubApi })._iub;
        iub?.cs?.api?.openPreferences?.();
      }}
      className="transition hover:text-ink"
    >
      {label}
    </button>
  );
}
