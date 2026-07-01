import type { MetadataRoute } from "next";

const BASE = "https://atribuya.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
}
