"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ES, GB } from "country-flag-icons/react/3x2";
import type { Locale } from "@/lib/marketing/nav";

const LANGS = [
  { code: "es" as const, label: "Español", Flag: ES },
  { code: "en" as const, label: "English", Flag: GB },
];

const UI = {
  es: { aria: "Cambiar idioma", current: "Idioma actual" },
  en: { aria: "Change language", current: "Current language" },
} as const;

// Selector de idioma desplegable: muestra el idioma actual y, al abrir, lista
// TODOS los idiomas disponibles (con bandera), marcando el activo. El idioma
// alterno enlaza a `altLangHref` (equivalente de la página en el otro idioma);
// el actual, a la propia URL.
export function LangSwitcher({
  locale,
  altLangHref,
}: {
  locale: Locale;
  altLangHref: string;
}) {
  const t = UI[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Current = locale === "es" ? ES : GB;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t.aria}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium text-ink-3 transition hover:text-ink"
      >
        <Current
          className="h-3.5 w-auto overflow-hidden rounded-[2px] ring-1 ring-line-strong/40"
          title={t.current}
        />
        <span aria-hidden="true">{locale.toUpperCase()}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full z-50 mt-1.5 min-w-[9rem] origin-top-right rounded-xl border border-line bg-white p-1 shadow-card transition ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {LANGS.map(({ code, label, Flag }) => {
          const isCurrent = code === locale;
          const href = isCurrent ? pathname : altLangHref;
          return (
            <Link
              key={code}
              href={href}
              hrefLang={code}
              role="menuitem"
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13.5px] transition ${
                isCurrent
                  ? "font-semibold text-ink"
                  : "text-ink-2 hover:bg-bg hover:text-ink"
              }`}
            >
              <Flag className="h-3.5 w-auto overflow-hidden rounded-[2px] ring-1 ring-line-strong/40" />
              <span>{label}</span>
              {isCurrent ? (
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="ml-auto h-3.5 w-3.5 text-ink-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10.5 8 14.5 16 6" />
                </svg>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
