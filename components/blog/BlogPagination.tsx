import Link from "next/link";
import type { BlogLocale } from "@/sanity/lib/queries";

const STRINGS = {
  es: { nav: "Paginación", prev: "Anterior", next: "Siguiente", page: "Página" },
  en: { nav: "Pagination", prev: "Previous", next: "Next", page: "Page" },
} as const;

// URL de una página: la 1 es la ruta limpia (canónica); el resto lleva ?page=N.
function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

// Lista de páginas a mostrar con ventana alrededor de la actual: 1 … (c-1) c
// (c+1) … N. Devuelve números y marcadores de elipsis ("…").
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function BlogPagination({
  current,
  totalPages,
  basePath,
  locale,
}: {
  current: number;
  totalPages: number;
  basePath: string;
  locale: BlogLocale;
}) {
  if (totalPages <= 1) return null;
  const t = STRINGS[locale];
  const hasPrev = current > 1;
  const hasNext = current < totalPages;

  const arrowLink =
    "inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:border-line-strong hover:text-ink";
  const arrowDisabled =
    "inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-5 opacity-60";

  return (
    <nav
      aria-label={t.nav}
      className="mt-14 flex items-center justify-between gap-4 border-t border-line pt-8"
    >
      {hasPrev ? (
        <Link href={pageHref(basePath, current - 1)} rel="prev" className={arrowLink}>
          <span aria-hidden="true">←</span>
          {t.prev}
        </Link>
      ) : (
        <span className={arrowDisabled} aria-hidden="true">
          <span>←</span>
          {t.prev}
        </span>
      )}

      <ol className="flex items-center gap-1.5">
        {pageWindow(current, totalPages).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} className="px-1 text-sm text-ink-3" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={pageHref(basePath, p)}
                aria-label={`${t.page} ${p}`}
                aria-current={p === current ? "page" : undefined}
                className={
                  p === current
                    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-accent px-3 text-sm font-semibold text-white"
                    : "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium text-ink-2 transition hover:bg-ink/[0.05] hover:text-ink"
                }
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ol>

      {hasNext ? (
        <Link href={pageHref(basePath, current + 1)} rel="next" className={arrowLink}>
          {t.next}
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className={arrowDisabled} aria-hidden="true">
          {t.next}
          <span>→</span>
        </span>
      )}
    </nav>
  );
}
