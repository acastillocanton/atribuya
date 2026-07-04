import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { DemoSection } from "@/components/sections/DemoSection";
import { breadcrumbJsonLd, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "en",
  title: "Book an Atribuya demo",
  description:
    "Book a 20-minute demo. We walk you through the live app with sample data and see if Atribuya fits your sales team.",
  esPath: "/demo",
  enPath: "/en/demo",
});

export default function DemoPageEn() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd({ locale: "en", name: "Demo", path: "/en/demo" }),
          ),
        }}
      />
      <SiteHeader locale="en" altLangHref="/demo" />
      <main>
        <DemoSection locale="en" />
      </main>
      <Footer locale="en" />
    </div>
  );
}
