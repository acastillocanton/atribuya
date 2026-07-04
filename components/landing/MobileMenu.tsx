"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ES, GB } from "country-flag-icons/react/3x2";

type NavItem = { href: string; label: string };

type Props = {
  locale: "es" | "en";
  nav: ReadonlyArray<NavItem>;
  altLangHref: string;
  login: string;
  menuOpenLabel: string;
};

const LANGS = [
  { code: "es" as const, label: "Español", Flag: ES },
  { code: "en" as const, label: "English", Flag: GB },
];

export function MobileMenu({
  locale,
  nav,
  altLangHref,
  login,
  menuOpenLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Bloquea el scroll del body cuando el panel está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Cierra con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={menuOpenLabel}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-line-strong"
      >
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" />
          ) : (
            <>
              <path d="M3 6h14" />
              <path d="M3 10h14" />
              <path d="M3 14h14" />
            </>
          )}
        </svg>
      </button>

      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label={locale === "es" ? "Menú principal" : "Main menu"}
        className={`fixed inset-x-3 top-[72px] z-50 origin-top rounded-2xl border border-line bg-white shadow-card transition duration-200 md:hidden ${
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <nav
          aria-label={locale === "es" ? "Secciones" : "Sections"}
          className="px-2 py-2"
        >
          <ul>
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-3 font-display text-[17px] font-semibold transition ${
                      active ? "text-ink" : "text-ink-3 hover:bg-bg hover:text-ink"
                    }`}
                  >
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="h-4 w-0.5 shrink-0 rounded-full bg-ink"
                      />
                    ) : null}
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-line px-2 py-2">
          <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-ink-4">
            {locale === "es" ? "Idioma" : "Language"}
          </p>
          {LANGS.map(({ code, label, Flag }) => {
            const isCurrent = code === locale;
            const href = isCurrent ? pathname : altLangHref;
            return (
              <Link
                key={code}
                href={href}
                hrefLang={code}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] transition ${
                  isCurrent
                    ? "font-semibold text-ink"
                    : "text-ink-2 hover:bg-bg hover:text-ink"
                }`}
              >
                <Flag className="h-3.5 w-auto overflow-hidden rounded-[2px] ring-1 ring-line-strong/40" />
                <span>{label}</span>
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg border-t border-line px-3 py-2.5 text-[14px] text-ink-2 transition hover:bg-bg hover:text-ink"
          >
            {login}
          </Link>
        </div>
      </div>
    </>
  );
}
