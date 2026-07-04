"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/marketing/nav";

type NavItem = { href: string; label: string };

// Navegación principal (desktop). Client component para marcar el enlace
// activo según la ruta actual: un item está activo si la ruta coincide o
// cuelga de él (p. ej. /blog cubre /blog/[slug] y /blog/autor/...).
export function MainNav({
  items,
  locale,
}: {
  items: ReadonlyArray<NavItem>;
  locale: Locale;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      aria-label={locale === "es" ? "Secciones" : "Sections"}
      className="hidden md:block"
    >
      <ul className="flex items-center gap-1 rounded-full border border-line bg-white/85 px-2 py-1 text-[13.5px] font-medium text-ink-2 shadow-card backdrop-blur">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 transition ${
                  active
                    ? "font-semibold text-ink"
                    : "text-ink-2 hover:bg-bg hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
