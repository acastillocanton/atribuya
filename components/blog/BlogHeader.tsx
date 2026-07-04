import Link from "next/link";

type Locale = "es" | "en";

const STRINGS = {
  es: {
    homeHref: "/",
    homeLabel: "Inicio",
    blogHref: "/blog",
    altLangHref: "/en/blog",
    altLangLabel: "English",
    login: "Iniciar sesión",
  },
  en: {
    homeHref: "/en",
    homeLabel: "Home",
    blogHref: "/en/blog",
    altLangHref: "/blog",
    altLangLabel: "Español",
    login: "Sign in",
  },
} as const;

export function BlogHeader({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <div className="flex items-baseline gap-5">
          <Link
            href={t.homeHref}
            className="font-display text-lg font-medium italic tracking-tight text-ink"
          >
            Atribuya
          </Link>
          <Link
            href={t.blogHref}
            className="text-sm font-medium text-ink-2 hover:text-ink"
          >
            Blog
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href={t.altLangHref}
            hrefLang={locale === "es" ? "en" : "es"}
            className="text-ink-3 hover:text-ink"
          >
            {t.altLangLabel}
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-line-strong px-4 py-1.5 font-medium text-ink hover:bg-surface"
          >
            {t.login}
          </Link>
        </nav>
      </div>
    </header>
  );
}
