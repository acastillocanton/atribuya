import type { TocItem } from "@/lib/blog/toc";
import type { BlogLocale } from "@/sanity/lib/queries";

const LABEL: Record<BlogLocale, string> = {
  es: "En este artículo",
  en: "In this article",
};

// Tabla de contenidos del artículo (caja sobre el cuerpo). Se muestra solo si
// hay al menos 3 encabezados ("en el caso que corresponda"). Enlaces ancla
// nativos a los id que ponen los renderers h2/h3.
export function ArticleToc({
  items,
  locale,
}: {
  items: TocItem[];
  locale: BlogLocale;
}) {
  if (items.length < 3) return null;
  return (
    <nav
      aria-label={LABEL[locale]}
      className="my-10 rounded-xl border border-line bg-surface p-5"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-4">
        {LABEL[locale]}
      </p>
      <ol className="mt-3 space-y-1.5 text-sm leading-snug">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              className="text-ink-2 underline-offset-2 transition-colors hover:text-ink hover:underline"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
