import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadMagnetForm } from "@/components/landing/LeadMagnetForm";
import { makeBreadcrumb } from "@/lib/marketing/seo";

// MVP: página de conversión, no de contenido. La dejamos noindex (hereda el
// noindex global) hasta que tenga copy suficiente para indexarla. Para hacerla
// indexable: añadir contenido, pasar a robots.index=true y darla de alta en los
// 3 puntos SEO (next.config lookahead + middleware PUBLIC_SEO_PATHS + sitemap).
export const metadata: Metadata = {
  title: "Plantilla de atribución de reseñas de Google",
  description:
    "Descarga gratis la plantilla para saber qué comercial ha conseguido cada reseña de Google y ver un ranking automático de tu equipo.",
  robots: { index: false, follow: true },
};

const bc = makeBreadcrumb({
  locale: "es",
  crumbs: [{ name: "Plantilla de atribución de reseñas", path: "/recursos/plantilla-atribucion-resenas" }],
});

const INCLUYE = [
  "Registro de visitas y reseñas por comercial.",
  "Ranking automático: quién trae más reseñas.",
  "Las reglas de Google que no debes saltarte.",
];

export default function PlantillaAtribucionPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <SiteHeader locale="es" />
      <main>
        <Breadcrumbs items={bc.items} className="mx-auto w-full max-w-6xl px-5 pt-6" />
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              Plantilla gratuita
            </p>
            <h1
              className="mt-3 font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Sabe qué comercial consigue cada reseña de Google
            </h1>
            <p
              className="mt-5 max-w-xl leading-relaxed text-ink-2"
              style={{ fontSize: "var(--text-lead)" }}
            >
              Una plantilla de Excel lista para usar. Registra las visitas de tu equipo, cruza las reseñas que entran y mira el ranking sin fórmulas que tocar. Sin pedirle el nombre del vendedor al cliente.
            </p>
            <ul className="mt-8 space-y-3">
              {INCLUYE.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] text-ink-2">
                  <span aria-hidden="true" className="mt-1 text-accent">
                    ●
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-4">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
              <p className="mb-5 text-[15px] font-semibold text-ink">
                Descárgala gratis
              </p>
              <LeadMagnetForm locale="es" />
            </div>
          </div>
        </div>
      </main>
      <Footer locale="es" />
    </div>
  );
}
