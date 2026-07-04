import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/landing/MobileMenu";
import { MainNav } from "@/components/site/MainNav";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { HeaderShell } from "@/components/site/HeaderShell";
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

  return (
    <HeaderShell>
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
            sizes="128px"
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        {/* Desktop floating pill — sólo md+ */}
        <MainNav items={nav} locale={locale} />

        {/* Desktop right cluster */}
        <div className="hidden items-center gap-2 md:flex">
          <LangSwitcher locale={locale} altLangHref={altHref} />
          <Link
            href={routes[locale].login}
            className="rounded-full px-3 py-1.5 text-[13.5px] font-medium text-ink-2 transition hover:text-ink"
          >
            {loginLabel[locale]}
          </Link>
          <Link
            href={cta.href}
            className="rounded-full bg-accent px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-accent-strong"
          >
            {cta.label}
          </Link>
        </div>

        {/* Mobile — toggle + CTA */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href={cta.href}
            className="rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-accent-strong"
          >
            {cta.label}
          </Link>
          <MobileMenu
            locale={locale}
            nav={nav}
            altLangHref={altHref}
            login={loginLabel[locale]}
            menuOpenLabel={t.menuOpen}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
