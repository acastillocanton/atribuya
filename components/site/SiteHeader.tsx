import Image from "next/image";
import Link from "next/link";
import { ES, GB } from "country-flag-icons/react/3x2";
import { MobileMenu } from "@/components/landing/MobileMenu";
import {
  ctaLabel,
  loginLabel,
  navItems,
  routes,
  type Locale,
} from "@/lib/marketing/nav";

const UI = {
  es: {
    home: "Atribuya — Inicio",
    altLangLabel: "English",
    currentLangLabel: "Español",
    menuOpen: "Abrir menú",
  },
  en: {
    home: "Atribuya — Home",
    altLangLabel: "Español",
    currentLangLabel: "English",
    menuOpen: "Open menu",
  },
} as const;

// Cabecera única de todo el sitio (home, páginas de sección y blog). La nav
// apunta a rutas reales (no anclas), salvo "Cómo funciona" y "FAQ" que viven en
// la home y se enlazan por ancla. `altLangHref` permite a cada página saltar a
// su equivalente en el otro idioma; por defecto va a la home del otro idioma.
export function SiteHeader({
  locale,
  altLangHref,
}: {
  locale: Locale;
  altLangHref?: string;
}) {
  const t = UI[locale];
  const nav = navItems[locale];
  const cta = { href: routes[locale].demo, label: ctaLabel[locale] };
  const altHref = altLangHref ?? routes[locale].altHome;
  const CurrentFlag = locale === "es" ? ES : GB;

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-5">
        {/* Logo */}
        <Link
          href={routes[locale].home}
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
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-1.5 transition hover:bg-bg hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop right cluster */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={altHref}
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
            href={routes[locale].login}
            className="rounded-full px-3 py-1.5 text-[13.5px] font-medium text-ink-2 transition hover:text-ink"
          >
            {loginLabel[locale]}
          </Link>
          <Link
            href={cta.href}
            className="rounded-full bg-ink px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-ink-2"
          >
            {cta.label}
          </Link>
        </div>

        {/* Mobile — toggle + CTA */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href={cta.href}
            className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-ink-2"
          >
            {cta.label}
          </Link>
          <MobileMenu
            locale={locale}
            nav={nav}
            altLangHref={altHref}
            altLangLabel={t.altLangLabel}
            login={loginLabel[locale]}
            menuOpenLabel={t.menuOpen}
          />
        </div>
      </div>
    </header>
  );
}
