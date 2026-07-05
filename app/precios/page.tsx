import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { PricingSection, plans } from "@/components/sections/PricingSection";
import { SectionCta } from "@/components/sections/SectionCta";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "es",
  title: "Precios de Atribuya: un plan para cada tamaño de equipo",
  description:
    "Planes desde 45 €/mes por tamaño de equipo comercial, con todas las funciones incluidas. Implantación llave en mano de 129 €, sin permanencia.",
  esPath: "/precios",
  enPath: "/en/pricing",
});

// SoftwareApplication con ofertas desde `plans` (misma fuente que las tarjetas).
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://atribuya.com/#software",
  name: "Atribuya",
  url: "https://atribuya.com/precios",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Atribuye cada reseña de Google Business Profile al comercial que la consiguió, en automático y sin pedirle el nombre al cliente.",
  publisher: { "@id": "https://atribuya.com/#organization" },
  offers: plans.es.map((p) => ({
    "@type": "Offer",
    name: `Plan ${p.name}`,
    price: p.price,
    priceCurrency: "EUR",
    url: "https://atribuya.com/precios",
  })),
};

const bc = makeBreadcrumb({
  locale: "es",
  crumbs: [{ name: "Precios", path: "/precios" }],
});

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([bc.jsonLd, softwareJsonLd]),
        }}
      />
      <SiteHeader locale="es" altLangHref="/en/pricing" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <PricingSection locale="es" headingLevel="h1" />
        <div className="mx-auto flex max-w-6xl justify-center px-5 pt-8">
          <img
            src="/illustrations/precios.webp"
            alt="Persona alcanzando una estrella"
            width={1100}
            height={1100}
            loading="lazy"
            className="w-full max-w-[340px]"
          />
        </div>
        <SectionCta locale="es" />
      </main>
      <Footer locale="es" />
    </div>
  );
}
