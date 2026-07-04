import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/blog/BlogIndexPage";

// Página pública indexable: sobreescribe el noindex global de app/layout.tsx.
export const metadata: Metadata = {
  title: "Atribuya Blog: Google reviews and sales teams",
  description:
    "Practical ideas on Google reviews, per-rep attribution and local reputation for companies with sales teams.",
  alternates: {
    canonical: "https://atribuya.com/en/blog",
    languages: {
      "es-ES": "https://atribuya.com/blog",
      "en-US": "https://atribuya.com/en/blog",
      "x-default": "https://atribuya.com/blog",
    },
  },
  openGraph: {
    title: "Atribuya Blog",
    description:
      "Practical ideas on Google reviews, per-rep attribution and local reputation.",
    url: "https://atribuya.com/en/blog",
    siteName: "Atribuya",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const revalidate = 600;

export default function BlogPageEn() {
  return <BlogIndexPage locale="en" />;
}
