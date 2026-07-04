// Mapa único de rutas públicas por idioma. Centraliza los enlaces para que la
// cabecera, el footer, las secciones y los teasers no repitan hrefs y no se
// desincronicen. Las secciones que siguen viviendo en la home (cómo funciona,
// FAQ) se enlazan por ancla a la home del idioma.
export type Locale = "es" | "en";

type RouteMap = {
  home: string;
  how: string;
  product: string;
  pricing: string;
  cases: string;
  faq: string;
  demo: string;
  blog: string;
  login: string;
  terms: string;
  privacy: string;
  altHome: string;
};

export const routes: Record<Locale, RouteMap> = {
  es: {
    home: "/",
    how: "/como-funciona",
    product: "/producto",
    pricing: "/precios",
    cases: "/casos",
    faq: "/#faq",
    demo: "/demo",
    blog: "/blog",
    login: "/login",
    terms: "/terminos",
    privacy: "/privacidad",
    altHome: "/en",
  },
  en: {
    home: "/en",
    how: "/en/how-it-works",
    product: "/en/product",
    pricing: "/en/pricing",
    cases: "/en/case-studies",
    faq: "/en#faq",
    demo: "/en/demo",
    blog: "/en/blog",
    login: "/login",
    terms: "/en/terms",
    privacy: "/en/privacy",
    altHome: "/",
  },
};

// Etiquetas de navegación principal por idioma (orden de aparición en la nav).
export const navItems: Record<Locale, ReadonlyArray<{ href: string; label: string }>> = {
  es: [
    { href: routes.es.how, label: "Cómo funciona" },
    { href: routes.es.product, label: "Producto" },
    { href: routes.es.pricing, label: "Precios" },
    { href: routes.es.cases, label: "Casos" },
    { href: routes.es.blog, label: "Blog" },
  ],
  en: [
    { href: routes.en.how, label: "How it works" },
    { href: routes.en.product, label: "Product" },
    { href: routes.en.pricing, label: "Pricing" },
    { href: routes.en.cases, label: "Case studies" },
    { href: routes.en.blog, label: "Blog" },
  ],
};

export const ctaLabel: Record<Locale, string> = {
  es: "Pedir demo",
  en: "Request demo",
};

export const loginLabel: Record<Locale, string> = {
  es: "Iniciar sesión",
  en: "Sign in",
};
