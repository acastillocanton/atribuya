import type { Metadata } from "next";
import { AuthorPage } from "@/components/blog/AuthorPage";
import { urlFor } from "@/sanity/lib/image";
import { getAllAuthorSlugs, getAuthor } from "@/sanity/lib/queries";

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug, "en");
  if (!author) return {};

  const url = `https://atribuya.com/en/blog/author/${author.slug}`;
  const title = `${author.name}${author.role ? ` — ${author.role}` : ""}`;
  const description =
    author.bio ?? `Articles by ${author.name} on the Atribuya blog.`;
  const image = author.image
    ? urlFor(author.image)?.width(1200).height(630).fit("crop").url()
    : null;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Atribuya",
      locale: "en_US",
      type: "profile",
      ...(image
        ? { images: [{ url: image, width: 1200, height: 630, alt: author.name }] }
        : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function AuthorRouteEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AuthorPage slug={slug} locale="en" />;
}
