import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SectionCta } from "@/components/sections/SectionCta";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "en",
  title: "How Atribuya works: attributed reviews in three steps",
  description:
    "How Atribuya assigns each Google review to the sales rep who earned it: a personal link per rep, the customer reviews as always, and attribution resolves on its own.",
  esPath: "/como-funciona",
  enPath: "/en/how-it-works",
});

const bc = makeBreadcrumb({
  locale: "en",
  crumbs: [{ name: "How it works", path: "/en/how-it-works" }],
});

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <SiteHeader locale="en" altLangHref="/como-funciona" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <section className="mx-auto max-w-6xl px-5 pt-8 sm:pt-12">
          <div className="max-w-2xl">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
              How it works
            </p>
            <h1
              className="mt-3 font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              How Atribuya works
            </h1>
            <p className="mt-5 leading-relaxed text-ink-2" style={{ fontSize: "var(--text-lead)" }}>
              Attribute every Google review to the sales rep who earned it,
              without asking the customer for anything. It's that simple, in
              three steps.
            </p>
          </div>
        </section>
        <HowItWorks locale="en" />
        <SectionCta locale="en" />
      </main>
      <Footer locale="en" />
    </div>
  );
}
