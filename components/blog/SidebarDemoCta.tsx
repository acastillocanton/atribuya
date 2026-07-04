import Link from "next/link";
import type { BlogLocale } from "@/sanity/lib/queries";

const T: Record<
  BlogLocale,
  { title: string; body: string; cta: string; href: string }
> = {
  es: {
    title: "¿Lo quieres ver con tu equipo?",
    body: "Te enseñamos Atribuya en una demo de 20 minutos, con tu caso concreto. Sin compromiso.",
    cta: "Pedir demo",
    href: "/demo",
  },
  en: {
    title: "Want to see it with your team?",
    body: "We'll walk you through Atribuya in a 20-minute demo, tailored to your case. No commitment.",
    cta: "Request a demo",
    href: "/en/demo",
  },
};

// Tarjeta de captación fija (sticky) del sidebar de los artículos. Ligera:
// gancho + botón que lleva al formulario completo de /demo.
export function SidebarDemoCta({ locale }: { locale: BlogLocale }) {
  const t = T[locale];
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <p className="font-display text-lg font-medium leading-snug tracking-tight text-ink">
        {t.title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-3">{t.body}</p>
      <Link
        href={t.href}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-2"
      >
        {t.cta}
      </Link>
    </div>
  );
}
