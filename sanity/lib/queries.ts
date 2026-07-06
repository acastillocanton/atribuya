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
  author: {
    name: string;
    role?: string;
    image?: SanityImageSource | null;
    slug?: string | null;
  } | null;
  categories: string[] | null;
};

export type Author = {
  name: string;
  role?: string;
  slug: string;
  bio?: string;
  image?: SanityImageSource | null;
  sameAs?: string[] | null;
  posts: PostListItem[];
};

export type Post = PostListItem & {
  body: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
  translationSlug?: string | null;
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
  "author": author->{ name, role, image, "slug": slug.current },
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
    translationSlug,
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

// Autor + sus artículos publicados (en el idioma dado). `references(^._id)`
// trae los posts que apuntan a este autor.
const AUTHOR_QUERY = groq`
  *[_type == "author" && slug.current == $slug][0] {
    name,
    role,
    bio,
    image,
    "slug": slug.current,
    "sameAs": sameAs,
    "posts": *[_type == "post" && references(^._id) && language == $language
      && defined(slug.current) && publishedAt <= now()]
      | order(publishedAt desc) { ${POST_FIELDS} }
  }
`;

const AUTHOR_SLUGS_QUERY = groq`
  *[_type == "author" && defined(slug.current)] { "slug": slug.current }
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

export async function getAuthor(
  slug: string,
  language: BlogLocale,
): Promise<Author | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.fetch<Author | null>(AUTHOR_QUERY, { slug, language });
  } catch (err) {
    console.error("[sanity] getAuthor falló:", err);
    return null;
  }
}

export async function getAllAuthorSlugs(): Promise<string[]> {
  const client = getClient();
  if (!client) return [];
  try {
    const rows = await client.fetch<{ slug: string }[]>(AUTHOR_SLUGS_QUERY);
    return rows.map((r) => r.slug);
  } catch (err) {
    console.error("[sanity] getAllAuthorSlugs falló:", err);
    return [];
  }
}
