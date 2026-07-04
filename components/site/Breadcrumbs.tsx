import Link from "next/link";

export type BreadcrumbItem = { name: string; href: string };

// Breadcrumb VISIBLE (navegación) que refleja el dato estructurado
// BreadcrumbList. El último nivel es la página actual (sin enlace). El
// contenedor/anchura lo controla el `className` del que lo usa, para alinear
// con el ancho de cada página.
export function Breadcrumbs({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-4">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-x-1.5">
              {i > 0 ? (
                <span aria-hidden className="select-none text-ink-4">
                  ›
                </span>
              ) : null}
              {isLast ? (
                <span aria-current="page" className="text-ink-3">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="underline-offset-2 transition-colors hover:text-ink-2 hover:underline"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
