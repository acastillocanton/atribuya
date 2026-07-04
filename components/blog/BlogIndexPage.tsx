import { getAllPosts, type BlogLocale } from "@/sanity/lib/queries";
import { PostCard } from "./PostCard";

const STRINGS = {
  es: {
    kicker: "Blog de Atribuya",
    title: "Reseñas que se convierten en negocio",
    lead: "Ideas prácticas sobre reseñas de Google, equipos comerciales y reputación local, escritas desde lo que vemos funcionar con nuestros clientes.",
    empty:
      "Estamos preparando los primeros artículos. Vuelve pronto o síguenos en LinkedIn para no perderte el lanzamiento.",
    url: "https://atribuya.com/blog",
    name: "Blog de Atribuya",
    inLanguage: "es-ES",
  },
  en: {
    kicker: "Atribuya Blog",
    title: "Reviews that turn into business",
    lead: "Practical ideas on Google reviews, sales teams and local reputation, written from what we see working with our customers.",
    empty:
      "The first articles are on their way. Check back soon or follow us on LinkedIn so you don't miss the launch.",
    url: "https://atribuya.com/en/blog",
    name: "Atribuya Blog",
    inLanguage: "en-US",
  },
} as const;

export async function BlogIndexPage({ locale }: { locale: BlogLocale }) {
  const t = STRINGS[locale];
  const posts = await getAllPosts(locale);

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t.name,
    url: t.url,
    inLanguage: t.inLanguage,
    publisher: { "@id": "https://atribuya.com/#organization" },
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <p className="text-sm font-medium uppercase tracking-wide text-ink-4">
        {t.kicker}
      </p>
      <h1
        className="mt-3 max-w-3xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
        style={{ fontSize: "var(--text-h2)" }}
      >
        <em className="font-light">{t.title}</em>
      </h1>
      <p
        className="mt-5 max-w-2xl leading-relaxed text-ink-2"
        style={{ fontSize: "var(--text-lead)" }}
      >
        {t.lead}
      </p>

      {posts.length === 0 ? (
        <div className="mt-14 rounded-lg border border-line bg-surface p-10 text-center shadow-card">
          <p className="mx-auto max-w-md leading-relaxed text-ink-3">
            {t.empty}
          </p>
        </div>
      ) : (
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
