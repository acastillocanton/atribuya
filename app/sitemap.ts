import type { MetadataRoute } from "next";
import { getAllAuthorSlugs, getAllPostSlugs } from "@/sanity/lib/queries";

const BASE = "https://atribuya.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/en`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/como-funciona`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/en/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE}/producto`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/en/product`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/precios`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/en/pricing`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/casos`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/en/case-studies`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE}/demo`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/en/demo`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/blog`,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE}/en/blog`,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${BASE}/terminos`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE}/privacidad`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE}/en/terms`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE}/en/privacy`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Posts del blog desde Sanity. Devuelve [] sin env vars o si Sanity falla,
  // así el sitemap nunca revienta.
  const slugs = await getAllPostSlugs();
  const postEntries: MetadataRoute.Sitemap = slugs.map((s) => ({
    url:
      s.language === "en"
        ? `${BASE}/en/blog/${s.slug}`
        : `${BASE}/blog/${s.slug}`,
    lastModified: s._updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Páginas de autor (ES + EN). Refuerzan el E-E-A-T; [] sin env vars o si
  // Sanity falla. El mismo autor se sirve en ambos idiomas (rutas /autor y
  // /author); su listado de artículos se filtra por idioma en cada página.
  const authorSlugs = await getAllAuthorSlugs();
  const authorEntries: MetadataRoute.Sitemap = authorSlugs.flatMap((slug) => [
    {
      url: `${BASE}/blog/autor/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${BASE}/en/blog/author/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]);

  return [...staticEntries, ...postEntries, ...authorEntries];
}
