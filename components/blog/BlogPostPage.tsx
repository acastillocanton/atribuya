import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { getPost, type BlogLocale } from "@/sanity/lib/queries";
import { formatPostDate } from "./PostCard";
import { ptComponents } from "./PortableTextComponents";

const STRINGS = {
  es: { back: "Volver al blog", base: "https://atribuya.com/blog", inLanguage: "es-ES" },
  en: { back: "Back to the blog", base: "https://atribuya.com/en/blog", inLanguage: "en-US" },
} as const;

export async function BlogPostPage({
  slug,
  locale,
}: {
  slug: string;
  locale: BlogLocale;
}) {
  const t = STRINGS[locale];
  const post = await getPost(slug, locale);
  if (!post) notFound();

  const url = `${t.base}/${post.slug}`;
  const heroUrl = post.mainImage
    ? urlFor(post.mainImage)?.width(1600).height(900).fit("crop").url()
    : null;
  const ogUrl = post.mainImage
    ? urlFor(post.mainImage)?.width(1200).height(630).fit("crop").url()
    : null;
  const authorAvatarUrl = post.author?.image
    ? urlFor(post.author.image)?.width(80).height(80).fit("crop").url()
    : null;
  const authorBase = locale === "es" ? "/blog/autor" : "/en/blog/author";
  const authorHref = post.author?.slug ? `${authorBase}/${post.author.slug}` : null;

  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    ...(ogUrl ? { image: ogUrl } : {}),
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    ...(post.author
      ? { author: { "@type": "Person", name: post.author.name } }
      : {}),
    publisher: { "@id": "https://atribuya.com/#organization" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: t.inLanguage,
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-4">
        <time dateTime={post.publishedAt}>
          {formatPostDate(post.publishedAt, locale)}
        </time>
        {post.categories?.map((c) => (
          <span
            key={c}
            className="rounded-full border border-line px-2 py-0.5 text-ink-3"
          >
            {c}
          </span>
        ))}
      </div>
      <h1
        className="mt-4 font-display font-medium leading-[1.1] tracking-[-0.02em] text-ink"
        style={{ fontSize: "var(--text-h2)" }}
      >
        {post.title}
      </h1>
      {post.author ? (
        (() => {
          const byline = (
            <>
              {authorAvatarUrl ? (
                <Image
                  src={authorAvatarUrl}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : null}
              <span className="text-sm text-ink-3">
                {post.author.name}
                {post.author.role ? (
                  <span className="text-ink-4"> · {post.author.role}</span>
                ) : null}
              </span>
            </>
          );
          return authorHref ? (
            <Link
              href={authorHref}
              className="mt-4 inline-flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              {byline}
            </Link>
          ) : (
            <div className="mt-4 flex items-center gap-3">{byline}</div>
          );
        })()
      ) : null}

      {heroUrl ? (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg border border-line shadow-card">
          <Image
            src={heroUrl}
            alt={post.mainImage?.alt ?? post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10">
        <PortableText value={post.body} components={ptComponents} />
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <Link
          href={locale === "es" ? "/blog" : "/en/blog"}
          className="text-sm font-medium text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          {t.back}
        </Link>
      </div>
    </article>
  );
}
