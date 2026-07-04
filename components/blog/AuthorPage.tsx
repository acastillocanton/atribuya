import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";
import { getAuthor, type BlogLocale } from "@/sanity/lib/queries";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb } from "@/lib/marketing/seo";
import { PostCard } from "./PostCard";

const STRINGS = {
  es: {
    back: "Volver al blog",
    base: "https://atribuya.com/blog",
    articlesBy: (n: string) => `Artículos de ${n}`,
    noArticles: "Todavía no hay artículos publicados.",
    profiles: "Perfiles",
    inLanguage: "es-ES",
  },
  en: {
    back: "Back to the blog",
    base: "https://atribuya.com/en/blog",
    articlesBy: (n: string) => `Articles by ${n}`,
    noArticles: "No published articles yet.",
    profiles: "Profiles",
    inLanguage: "en-US",
  },
} as const;

export async function AuthorPage({
  slug,
  locale,
}: {
  slug: string;
  locale: BlogLocale;
}) {
  const t = STRINGS[locale];
  const author = await getAuthor(slug, locale);
  if (!author) notFound();

  const url = `${t.base}/${locale === "es" ? "autor" : "author"}/${author.slug}`;
  const avatarUrl = author.image
    ? urlFor(author.image)?.width(320).height(320).fit("crop").url()
    : null;
  const sameAs = (author.sameAs ?? []).filter(Boolean);

  const personJsonLd = {
    "@type": "Person",
    "@id": `${url}#person`,
    name: author.name,
    ...(author.role ? { jobTitle: author.role } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(avatarUrl ? { image: avatarUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    url,
    worksFor: { "@id": "https://atribuya.com/#organization" },
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": url,
    inLanguage: t.inLanguage,
    mainEntity: personJsonLd,
  };

  const blogPath = locale === "es" ? "/blog" : "/en/blog";
  const authorPath = `${locale === "es" ? "/blog/autor" : "/en/blog/author"}/${author.slug}`;
  const bc = makeBreadcrumb({
    locale,
    crumbs: [
      { name: "Blog", path: blogPath },
      { name: author.name, path: authorPath },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, bc.jsonLd]),
        }}
      />
      <Breadcrumbs
        items={bc.items}
        className="mx-auto w-full max-w-6xl px-5 pt-6"
      />
      <div className="mx-auto max-w-3xl px-5 pb-14 pt-8 sm:pb-20">
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={author.name}
            width={112}
            height={112}
            priority
            className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
          />
        ) : null}
        <div>
          <h1
            className="font-display font-medium leading-[1.1] tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h2)" }}
          >
            {author.name}
          </h1>
          {author.role ? (
            <p className="mt-1 text-sm text-ink-3">{author.role}</p>
          ) : null}
        </div>
      </header>

      {author.bio ? (
        <p className="mt-8 text-lg leading-relaxed text-ink-2">{author.bio}</p>
      ) : null}

      {sameAs.length ? (
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-4">
            {t.profiles}
          </span>
          {sameAs.map((href) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="me noopener noreferrer"
              className="text-sm font-medium text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              {profileLabel(href)}
            </a>
          ))}
        </div>
      ) : null}

      <h2 className="mt-14 font-display text-xl font-medium tracking-tight text-ink">
        {t.articlesBy(author.name)}
      </h2>
      {author.posts.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {author.posts.map((post) => (
            <PostCard key={post._id} post={post} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-3">{t.noArticles}</p>
      )}

      <div className="mt-14 border-t border-line pt-8">
        <Link
          href={locale === "es" ? "/blog" : "/en/blog"}
          className="text-sm font-medium text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          {t.back}
        </Link>
      </div>
      </div>
    </>
  );
}

// Etiqueta legible para un enlace de perfil a partir de su dominio.
function profileLabel(href: string): string {
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    if (host.includes("linkedin")) return "LinkedIn";
    if (host === "x.com" || host.includes("twitter")) return "X";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("github")) return "GitHub";
    return host;
  } catch {
    return href;
  }
}
