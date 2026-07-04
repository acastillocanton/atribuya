import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { ProductSection } from "@/components/sections/ProductSection";
import { SectionCta } from "@/components/sections/SectionCta";
import { breadcrumbJsonLd, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "en",
  title: "Product: see Atribuya from the inside",
  description:
    "Real screens of Atribuya: admin dashboard with per-rep metrics, live team ranking and each sales rep's own view.",
  esPath: "/producto",
  enPath: "/en/product",
});

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd({ locale: "en", name: "Product", path: "/en/product" }),
          ),
        }}
      />
      <SiteHeader locale="en" altLangHref="/producto" />
      <main>
        <ProductSection locale="en" headingLevel="h1" />
        <SectionCta locale="en" />
      </main>
      <Footer locale="en" />
    </div>
  );
}
