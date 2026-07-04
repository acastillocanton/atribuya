import Image from "next/image";
import Link from "next/link";
import { ES, GB } from "country-flag-icons/react/3x2";
import { MobileMenu } from "./MobileMenu";

type Locale = "es" | "en";

const STRINGS = {
  es: {
    home: "Atribuya — Inicio",
    nav: [
      { href: "#como-funciona", label: "Cómo funciona" },
      { href: "#caso", label: "Caso real" },
      { href: "#precios", label: "Precios" },
      { href: "#faq", label: "FAQ" },
      { href: "/blog", label: "Blog" },
    ],
    cta: { href: "#contacto", label: "Quiero esto" },
    altLangHref: "/en",
    altLangLabel: "English",
    currentLangLabel: "Español",
    login: "Iniciar sesión",
    menuOpen: "Abrir menú",
  },
  en: {
    home: "Atribuya — Home",
    nav: [
      { href: "#how", label: "How it works" },
      { href: "#case", label: "Case study" },
      { href: "#pricing", label: "Pricing" },
      { href: "#faq", label: "FAQ" },
      { href: "/en/blog", label: "Blog" },
    ],
    cta: { href: "#contact", label: "I want this" },
    altLangHref: "/",
    altLangLabel: "Español",
    currentLangLabel: "English",
    login: "Sign in",
    menuOpen: "Open menu",
  },
} as const;

export function Header({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  const CurrentFlag = locale === "es" ? ES : GB;

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-5">
        {/* Logo */}
        <Link
          href={locale === "es" ? "/" : "/en"}
          aria-label={t.home}
          className="flex shrink-0 items-center"
        >
          <Image
            src="/brand/logo-horizontal.png"
            alt="Atribuya"
            width={220}
            height={88}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        {/* Desktop floating pill — sólo md+ */}
        <nav
          aria-label={locale === "es" ? "Secciones" : "Sections"}
          className="hidden md:block"
        >
          <ul className="flex items-center gap-1 rounded-full border border-line bg-white/85 px-2 py-1 text-[13.5px] font-medium text-ink-2 shadow-card backdrop-blur">
            {t.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3 py-1.5 transition hover:bg-bg hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop right cluster */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={t.altLangHref}
            hrefLang={locale === "es" ? "en" : "es"}
            aria-label={t.altLangLabel}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium text-ink-3 transition hover:text-ink"
          >
            <CurrentFlag
              className="h-3.5 w-auto overflow-hidden rounded-[2px] ring-1 ring-line-strong/40"
              title={t.currentLangLabel}
            />
            <span aria-hidden="true">{locale.toUpperCase()}</span>
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-1.5 text-[13.5px] font-medium text-ink-2 transition hover:text-ink"
          >
            {t.login}
          </Link>
          <a
            href={t.cta.href}
            className="rounded-full bg-ink px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-ink-2"
          >
            {t.cta.label}
          </a>
        </div>

        {/* Mobile — toggle + CTA */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={t.cta.href}
            className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-ink-2"
          >
            {t.cta.label}
          </a>
          <MobileMenu
            locale={locale}
            nav={t.nav}
            altLangHref={t.altLangHref}
            altLangLabel={t.altLangLabel}
            login={t.login}
            menuOpenLabel={t.menuOpen}
          />
        </div>
      </div>
    </header>
  );
}
