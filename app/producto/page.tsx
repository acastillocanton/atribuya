import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { ProductSection } from "@/components/sections/ProductSection";
import { SectionCta } from "@/components/sections/SectionCta";
import { breadcrumbJsonLd, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "es",
  title: "Producto: mira Atribuya por dentro",
  description:
    "Pantallas reales de Atribuya: panel del admin con métricas por comercial, ranking del equipo y la vista personal de cada vendedor.",
  esPath: "/producto",
  enPath: "/en/product",
});

export default function ProductoPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd({ locale: "es", name: "Producto", path: "/producto" }),
          ),
        }}
      />
      <SiteHeader locale="es" altLangHref="/en/product" />
      <main>
        <ProductSection locale="es" headingLevel="h1" />
        <SectionCta locale="es" />
      </main>
      <Footer locale="es" />
    </div>
  );
}
