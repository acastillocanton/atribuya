import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { PricingSection, plans } from "@/components/sections/PricingSection";
import { SectionCta } from "@/components/sections/SectionCta";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "en",
  title: "Atribuya pricing: one plan for every team size",
  description:
    "Plans from €45/month by sales-team size, every feature included. One-time €129 turnkey setup, no minimum contract.",
  esPath: "/precios",
  enPath: "/en/pricing",
});

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://atribuya.com/#software",
  name: "Atribuya",
  url: "https://atribuya.com/en/pricing",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Attributes every Google Business Profile review to the sales rep who earned it, automatically and without asking the customer for a name.",
  publisher: { "@id": "https://atribuya.com/#organization" },
  offers: plans.en.map((p) => ({
    "@type": "Offer",
    name: `${p.name} plan`,
    price: p.price,
    priceCurrency: "EUR",
    url: "https://atribuya.com/en/pricing",
  })),
};

const bc = makeBreadcrumb({
  locale: "en",
  crumbs: [{ name: "Pricing", path: "/en/pricing" }],
});

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([bc.jsonLd, softwareJsonLd]),
        }}
      />
      <SiteHeader locale="en" altLangHref="/precios" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <PricingSection locale="en" headingLevel="h1" />
        <SectionCta locale="en" />
      </main>
      <Footer locale="en" />
    </div>
  );
}
