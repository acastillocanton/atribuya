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
        <section className="mx-auto max-w-6xl px-5 pt-8 sm:pt-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_440px]">
            <div className="max-w-2xl">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                Precios
              </p>
              <h1
                className="mt-3 font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
                style={{ fontSize: "var(--text-h2)" }}
              >
                Precios de Atribuya
              </h1>
              <p className="mt-5 leading-relaxed text-ink-2" style={{ fontSize: "var(--text-lead)" }}>
                El precio crece con tu equipo comercial, no con las reseñas. Sin
                permanencia y con todo incluido desde el primer plan.
              </p>
            </div>
            <img
              src="/illustrations/precios.webp"
              alt="Persona alcanzando una estrella"
              width={1100}
              height={1100}
              className="mx-auto w-full max-w-[300px] lg:max-w-none"
            />
          </div>
        </section>
        <PricingSection locale="es" headingLevel="h2" />
        <SectionCta locale="es" />
      </main>
      <Footer locale="es" />
    </div>
  );
}
