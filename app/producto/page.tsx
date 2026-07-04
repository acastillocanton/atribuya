import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { ProductSection } from "@/components/sections/ProductSection";
import { SectionCta } from "@/components/sections/SectionCta";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "es",
  title: "Producto: mira Atribuya por dentro",
  description:
    "Pantallas reales de Atribuya: panel del admin con métricas por comercial, ranking del equipo y la vista personal de cada vendedor.",
  esPath: "/producto",
  enPath: "/en/product",
});

const bc = makeBreadcrumb({
  locale: "es",
  crumbs: [{ name: "Producto", path: "/producto" }],
});

export default function ProductoPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <SiteHeader locale="es" altLangHref="/en/product" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <ProductSection locale="es" headingLevel="h1" />
        <SectionCta locale="es" />
      </main>
      <Footer locale="es" />
    </div>
  );
}
