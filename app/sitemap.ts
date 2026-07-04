import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/sanity/lib/queries";

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

  return [...staticEntries, ...postEntries];
}
