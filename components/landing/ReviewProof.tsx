import { Stars } from "@/components/ui/Stars";
import { Avatar } from "@/components/ui/Avatar";

type Locale = "es" | "en";

const STRINGS = {
  es: {
    author: "Carlos Méndez",
    date: "hace 3 días",
    onGoogle: "Publicado en Google",
    text: "«Fuimos a ver el piso piloto y la atención fue inmejorable. Mateo nos lo explicó todo con calma, sin prisa. Muy recomendable.»",
    attributedTo: "Atribuida a",
    rep: "Mateo Salgado",
    badge: "+1 reseña",
  },
  en: {
    author: "Carlos Méndez",
    date: "3 days ago",
    onGoogle: "Posted on Google",
    text: "“We went to see the model home and the service was outstanding. Mateo walked us through everything, no rush. Highly recommended.”",
    attributedTo: "Attributed to",
    rep: "Mateo Salgado",
    badge: "+1 review",
  },
} as const;

/** "G" de Google a pequeño tamaño — guiño de categoría, no clon de la UI. */
function GoogleG({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18A13.6 13.6 0 0 1 10.96 24c0-1.45.25-2.86.7-4.18v-5.7H4.34A21.97 21.97 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export function ReviewProof({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];

  return (
    <figure className="rounded-[14px] border border-line bg-white p-5 shadow-card sm:p-6">
      {/* Cabecera: autor + estrellas, con la G de Google a la derecha */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar name={t.author} size={40} />
          <div>
            <p className="text-[15px] font-semibold leading-tight text-ink">
              {t.author}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Stars value={5} size={14} />
              <span className="text-[12px] text-ink-4">{t.date}</span>
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 text-[11px] font-medium text-ink-4"
          title={t.onGoogle}
        >
          <GoogleG size={16} />
          <span className="hidden sm:inline">Google</span>
        </div>
      </div>

      {/* Cuerpo de la reseña */}
      <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">{t.text}</p>

      {/* Fila de atribución — el "money shot": el producto trabajando */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[13px] text-ink-4">
            ↳ {t.attributedTo}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar name={t.rep} size={22} />
            <span className="truncate text-[13.5px] font-semibold text-ink">
              {t.rep}
            </span>
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ok-bg px-2.5 py-1 text-[12px] font-medium text-ok">
          <span
            aria-hidden="true"
            className="inline-flex h-1.5 w-1.5 rounded-full bg-ok"
          />
          {t.badge}
        </span>
      </div>
    </figure>
  );
}
