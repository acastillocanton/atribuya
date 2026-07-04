import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { DemoSection } from "@/components/sections/DemoSection";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "es",
  title: "Pide una demo de Atribuya",
  description:
    "Reserva una demo de 20 minutos. Te enseñamos la app en vivo con datos de ejemplo y vemos si Atribuya encaja en tu equipo comercial.",
  esPath: "/demo",
  enPath: "/en/demo",
});

const bc = makeBreadcrumb({
  locale: "es",
  crumbs: [{ name: "Demo", path: "/demo" }],
});

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <SiteHeader locale="es" altLangHref="/en/demo" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <DemoSection locale="es" />
      </main>
      <Footer locale="es" />
    </div>
  );
}
