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
        <section className="mx-auto max-w-6xl px-5 pt-8 sm:pt-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_440px]">
            <div className="max-w-2xl">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                Pricing
              </p>
              <h1
                className="mt-3 font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
                style={{ fontSize: "var(--text-h2)" }}
              >
                Atribuya pricing
              </h1>
              <p className="mt-5 leading-relaxed text-ink-2" style={{ fontSize: "var(--text-lead)" }}>
                The price grows with your sales team, not with your reviews. No
                lock-in, and everything included from the very first plan.
              </p>
            </div>
            <img
              src="/illustrations/precios.webp"
              alt="A person reaching for a star"
              width={1100}
              height={1100}
              className="mx-auto w-full max-w-[300px] lg:max-w-none"
            />
          </div>
        </section>
        <PricingSection locale="en" headingLevel="h2" />
        <SectionCta locale="en" />
      </main>
      <Footer locale="en" />
    </div>
  );
}
