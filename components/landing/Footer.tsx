import Image from "next/image";
import Link from "next/link";
import { CookiePrefs } from "./CookiePrefs";

type Locale = "es" | "en";

const STRINGS = {
  es: {
    statement:
      "Descubre qué comercial hay detrás de cada reseña de Google.",
    how: { href: "/como-funciona", label: "Cómo funciona" },
    product: { href: "/producto", label: "Producto" },
    pricing: { href: "/precios", label: "Precios" },
    cases: { href: "/casos", label: "Casos" },
    demo: { href: "/demo", label: "Demo" },
    blog: { href: "/blog", label: "Blog" },
    terms: { href: "/terminos", label: "Términos" },
    privacy: { href: "/privacidad", label: "Privacidad" },
    cookies: { href: "/cookies", label: "Cookies" },
    prefs: "Preferencias",
    login: "Iniciar sesión",
    by: "Un producto de Castillo Cantón",
  },
  en: {
    statement:
      "Discover which sales rep is behind every Google review.",
    how: { href: "/en/how-it-works", label: "How it works" },
    product: { href: "/en/product", label: "Product" },
    pricing: { href: "/en/pricing", label: "Pricing" },
    cases: { href: "/en/case-studies", label: "Case studies" },
    demo: { href: "/en/demo", label: "Demo" },
    blog: { href: "/en/blog", label: "Blog" },
    terms: { href: "/en/terms", label: "Terms" },
    privacy: { href: "/en/privacy", label: "Privacy" },
    cookies: { href: "/en/cookies", label: "Cookies" },
    prefs: "Preferences",
    login: "Sign in",
    by: "A Castillo Cantón product",
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

        <div className="mt-10 flex flex-col items-start justify-between gap-8 border-t border-line pt-6 text-[13px] text-ink-3 sm:flex-row sm:items-start sm:gap-6">
          {/* Identidad — dos líneas */}
          <div className="flex items-start gap-3">
            <Image
              src="/brand/logo-cuadrado.png"
              alt=""
              width={28}
              height={28}
              className="h-6 w-6 rounded-md"
            />
            <div className="flex flex-col gap-0.5">
              <span>© {new Date().getFullYear()} Atribuya</span>
              <a
                href="https://castillocanton.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-ink"
              >
                {t.by}
              </a>
            </div>
          </div>

          {/* Menús — operativo y legal, en dos filas separadas por 1px */}
          <div className="flex flex-col gap-3 sm:items-end">
            <nav
              aria-label={locale === "es" ? "Secciones" : "Sections"}
              className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end"
            >
              <Link href={t.how.href} className="transition hover:text-ink">
                {t.how.label}
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
              <Link href="/login" className="transition hover:text-ink">
                {t.login}
              </Link>
            </nav>
            <nav
              aria-label={locale === "es" ? "Legal" : "Legal"}
              className="flex w-full flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 sm:justify-end"
            >
              <Link href={t.terms.href} className="transition hover:text-ink">
                {t.terms.label}
              </Link>
              <Link href={t.privacy.href} className="transition hover:text-ink">
                {t.privacy.label}
              </Link>
              <Link href={t.cookies.href} className="transition hover:text-ink">
                {t.cookies.label}
              </Link>
              <CookiePrefs label={t.prefs} />
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
