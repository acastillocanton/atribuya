import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import type { BlogLocale, PostListItem } from "@/sanity/lib/queries";

export function formatPostDate(iso: string, locale: BlogLocale): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  });
}

export function PostCard({
  post,
  locale,
}: {
  post: PostListItem;
  locale: BlogLocale;
}) {
  const base = locale === "es" ? "/blog" : "/en/blog";
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage)?.width(800).height(450).fit("crop").url()
    : null;

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-shadow hover:shadow-md">
      <Link href={`${base}/${post.slug}`} className="block">
        {imageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden border-b border-line">
            <Image
              src={imageUrl}
              alt={post.mainImage?.alt ?? post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
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
          <h2 className="mt-3 font-display text-xl font-medium leading-snug tracking-tight text-ink">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-3">
            {post.excerpt}
          </p>
          {post.author ? (
            <p className="mt-4 text-xs font-medium text-ink-3">
              {post.author.name}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
