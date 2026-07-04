import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { CaseSection } from "@/components/sections/CaseSection";
import { SectionCta } from "@/components/sections/SectionCta";
import { breadcrumbJsonLd, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "es",
  title: "Casos reales de Atribuya",
  description:
    "Cómo una promotora con piso piloto atribuyó el 100% de sus reseñas verificadas y recuperó unas 8 horas al mes frente al Excel manual.",
  esPath: "/casos",
  enPath: "/en/case-studies",
});

export default function CasosPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd({ locale: "es", name: "Casos", path: "/casos" }),
          ),
        }}
      />
      <SiteHeader locale="es" altLangHref="/en/case-studies" />
      <main>
        <CaseSection locale="es" headingLevel="h1" />
        <SectionCta locale="es" />
      </main>
      <Footer locale="es" />
    </div>
  );
}
