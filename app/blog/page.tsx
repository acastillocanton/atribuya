import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/blog/BlogIndexPage";

// Página pública indexable: sobreescribe el noindex global de app/layout.tsx.
export const metadata: Metadata = {
  title: "Blog de Atribuya: reseñas de Google y equipos comerciales",
  description:
    "Ideas prácticas sobre reseñas de Google, atribución por comercial y reputación local para empresas con red de ventas.",
  alternates: {
    canonical: "https://atribuya.com/blog",
    languages: {
      "es-ES": "https://atribuya.com/blog",
      "en-US": "https://atribuya.com/en/blog",
      "x-default": "https://atribuya.com/blog",
    },
  },
  openGraph: {
    title: "Blog de Atribuya",
    description:
      "Ideas prácticas sobre reseñas de Google, atribución por comercial y reputación local.",
    url: "https://atribuya.com/blog",
    siteName: "Atribuya",
    locale: "es_ES",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const revalidate = 600;

export default function BlogPage() {
  return <BlogIndexPage locale="es" />;
}
