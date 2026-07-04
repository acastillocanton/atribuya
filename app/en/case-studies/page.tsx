import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { CaseSection } from "@/components/sections/CaseSection";
import { SectionCta } from "@/components/sections/SectionCta";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "en",
  title: "Atribuya case studies",
  description:
    "How a real estate developer with a model home attributed 100% of its verified reviews and got back around 8 hours a month over a manual spreadsheet.",
  esPath: "/casos",
  enPath: "/en/case-studies",
});

const bc = makeBreadcrumb({
  locale: "en",
  crumbs: [{ name: "Case studies", path: "/en/case-studies" }],
});

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <SiteHeader locale="en" altLangHref="/casos" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <CaseSection locale="en" headingLevel="h1" />
        <SectionCta locale="en" />
      </main>
      <Footer locale="en" />
    </div>
  );
}
