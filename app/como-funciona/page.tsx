import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SectionCta } from "@/components/sections/SectionCta";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb, sectionMetadata } from "@/lib/marketing/seo";

export const metadata: Metadata = sectionMetadata({
  locale: "es",
  title: "Cómo funciona Atribuya: reseñas atribuidas en tres pasos",
  description:
    "Cómo Atribuya asigna cada reseña de Google al comercial que la consiguió: enlace personalizado por comercial, el cliente reseña como siempre, y la atribución se resuelve sola.",
  esPath: "/como-funciona",
  enPath: "/en/how-it-works",
});

const bc = makeBreadcrumb({
  locale: "es",
  crumbs: [{ name: "Cómo funciona", path: "/como-funciona" }],
});

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <SiteHeader locale="es" altLangHref="/en/how-it-works" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <section className="mx-auto max-w-6xl px-5 pt-8 sm:pt-12">
          <div className="max-w-2xl">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
              Cómo funciona
            </p>
            <h1
              className="mt-3 font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Cómo funciona Atribuya
            </h1>
            <p className="mt-5 leading-relaxed text-ink-2" style={{ fontSize: "var(--text-lead)" }}>
              Atribuir cada reseña de Google al comercial que la consiguió, sin
              pedirle nada al cliente. Así de simple, en tres pasos.
            </p>
          </div>
        </section>
        <HowItWorks locale="es" />
        <SectionCta locale="es" />
      </main>
      <Footer locale="es" />
    </div>
  );
}
