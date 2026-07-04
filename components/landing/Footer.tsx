import Image from "next/image";
import Link from "next/link";
import { CookiePrefs } from "./CookiePrefs";

type Locale = "es" | "en";

const STRINGS = {
  es: {
    statement:
      "Sabes qué comercial te trae cada reseña de Google.",
    altLangHref: "/en",
    altLangLabel: "English",
    product: { href: "/producto", label: "Producto" },
    pricing: { href: "/precios", label: "Precios" },
    cases: { href: "/casos", label: "Casos" },
    demo: { href: "/demo", label: "Demo" },
    blog: { href: "/blog", label: "Blog" },
    terms: { href: "/terminos", label: "Términos" },
    privacy: { href: "/privacidad", label: "Privacidad" },
    cookies: "Cookies",
    login: "Iniciar sesión",
  },
  en: {
    statement:
      "You know which rep brings in every Google review.",
    altLangHref: "/",
    altLangLabel: "Español",
    product: { href: "/en/product", label: "Product" },
    pricing: { href: "/en/pricing", label: "Pricing" },
    cases: { href: "/en/case-studies", label: "Case studies" },
    demo: { href: "/en/demo", label: "Demo" },
    blog: { href: "/en/blog", label: "Blog" },
    terms: { href: "/en/terms", label: "Terms" },
    privacy: { href: "/en/privacy", label: "Privacy" },
    cookies: "Cookies",
    login: "Sign in",
  },
} as const;

export function Footer({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        {/* Statement — la única cosa "grande" del footer */}
        <p
          className="font-display text-[1.5rem] leading-[1.15] tracking-tight text-ink sm:text-[2rem]"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          {t.statement}
        </p>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-line pt-6 text-[13px] text-ink-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-cuadrado.png"
              alt=""
              width={28}
              height={28}
              className="h-6 w-6 rounded-md"
            />
            <span>© {new Date().getFullYear()} Atribuya</span>
          </div>
          <nav
            aria-label={locale === "es" ? "Legal y secundario" : "Legal and secondary"}
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <Link
              href={t.altLangHref}
              hrefLang={locale === "es" ? "en" : "es"}
              className="transition hover:text-ink"
            >
              {t.altLangLabel}
            </Link>
            <Link href={t.product.href} className="transition hover:text-ink">
              {t.product.label}
            </Link>
            <Link href={t.pricing.href} className="transition hover:text-ink">
              {t.pricing.label}
            </Link>
            <Link href={t.cases.href} className="transition hover:text-ink">
              {t.cases.label}
            </Link>
            <Link href={t.demo.href} className="transition hover:text-ink">
              {t.demo.label}
            </Link>
            <Link href={t.blog.href} className="transition hover:text-ink">
              {t.blog.label}
            </Link>
            <Link href={t.terms.href} className="transition hover:text-ink">
              {t.terms.label}
            </Link>
            <Link href={t.privacy.href} className="transition hover:text-ink">
              {t.privacy.label}
            </Link>
            <CookiePrefs label={t.cookies} />
            <Link href="/login" className="transition hover:text-ink">
              {t.login}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
