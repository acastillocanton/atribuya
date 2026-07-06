import type { Metadata } from "next";
import { BlogPostPage } from "@/components/blog/BlogPostPage";
import { urlFor } from "@/sanity/lib/image";
import { getAllPostSlugs, getPost } from "@/sanity/lib/queries";

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs
    .filter((s) => s.language === "es")
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug, "es");
  if (!post) return {};

  const url = `https://atribuya.com/blog/${post.slug}`;
  const enUrl = post.translationSlug
    ? `https://atribuya.com/en/blog/${post.translationSlug}`
    : null;
  const ogImage = post.mainImage
    ? urlFor(post.mainImage)?.width(1200).height(630).fit("crop").url()
    : null;

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: {
      canonical: url,
      ...(enUrl ? { languages: { es: url, en: enUrl, "x-default": url } } : {}),
    },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      url,
      siteName: "Atribuya",
      locale: "es_ES",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: post.mainImage?.alt ?? post.title,
              },
            ],
          }
        : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function BlogPostRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostPage slug={slug} locale="es" />;
}
