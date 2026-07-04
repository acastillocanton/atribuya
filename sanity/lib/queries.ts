import { groq } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";
import { getClient } from "./client";

export type BlogLocale = "es" | "en";

export type PostListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  mainImage: (SanityImageSource & { alt?: string }) | null;
  publishedAt: string;
  author: { name: string; role?: string; image?: SanityImageSource | null } | null;
  categories: string[] | null;
};

export type Post = PostListItem & {
  body: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
  _updatedAt: string;
};

export type PostSlug = {
  slug: string;
  language: BlogLocale;
  _updatedAt: string;
};

const POST_FIELDS = groq`
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  publishedAt,
  "author": author->{ name, role, image },
  "categories": categories[]->title
`;

const POSTS_QUERY = groq`
  *[_type == "post" && language == $language && defined(slug.current) && publishedAt <= now()]
    | order(publishedAt desc) { ${POST_FIELDS} }
`;

const POST_QUERY = groq`
  *[_type == "post" && language == $language && slug.current == $slug && publishedAt <= now()][0] {
    ${POST_FIELDS},
    body,
    seoTitle,
    seoDescription,
    _updatedAt
  }
`;

const SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current) && publishedAt <= now()] {
    "slug": slug.current,
    language,
    _updatedAt
  }
`;

// Los fetchers absorben el modo degradado (sin env vars) y los fallos de red:
// devuelven vacío para que /blog, el sitemap y el build nunca revienten.

export async function getAllPosts(language: BlogLocale): Promise<PostListItem[]> {
  const client = getClient();
  if (!client) return [];
  try {
    return await client.fetch<PostListItem[]>(POSTS_QUERY, { language });
  } catch (err) {
    console.error("[sanity] getAllPosts falló:", err);
    return [];
  }
}

export async function getPost(
  slug: string,
  language: BlogLocale,
): Promise<Post | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.fetch<Post | null>(POST_QUERY, { slug, language });
  } catch (err) {
    console.error("[sanity] getPost falló:", err);
    return null;
  }
}

export async function getAllPostSlugs(): Promise<PostSlug[]> {
  const client = getClient();
  if (!client) return [];
  try {
    return await client.fetch<PostSlug[]>(SLUGS_QUERY);
  } catch (err) {
    console.error("[sanity] getAllPostSlugs falló:", err);
    return [];
  }
}
