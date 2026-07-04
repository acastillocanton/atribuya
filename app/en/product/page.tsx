import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { ProductSection } from "@/components/sections/ProductSection";
import { SectionCta } from "@/components/sections/SectionCta";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "en",
  title: "Product: see Atribuya from the inside",
  description:
    "Real screens of Atribuya: admin dashboard with per-rep metrics, live team ranking and each sales rep's own view.",
  esPath: "/producto",
  enPath: "/en/product",
});

const bc = makeBreadcrumb({
  locale: "en",
  crumbs: [{ name: "Product", path: "/en/product" }],
});

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <SiteHeader locale="en" altLangHref="/producto" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <ProductSection locale="en" headingLevel="h1" />
        <SectionCta locale="en" />
      </main>
      <Footer locale="en" />
    </div>
  );
}
