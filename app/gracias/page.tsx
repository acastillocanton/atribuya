import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Gracias · Atribuya",
  description:
    "Hemos recibido tu solicitud. Te contactamos en menos de 24 horas para ver el encaje de Atribuya en tu empresa.",
  // Página de confirmación: no debe aparecer en buscadores.
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <Header locale="es" />

      <main
        id="contenido"
        className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center sm:py-32"
      >
        <span
          aria-hidden="true"
          className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-full bg-ok-bg text-ok"
        >
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        </span>

        <h1
          className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
          style={{ fontSize: "var(--text-h2)" }}
        >
          Gracias. <em className="font-light">Te escribimos en menos de 24 h.</em>
        </h1>

        <p
          className="mt-6 leading-relaxed text-ink-2"
          style={{ fontSize: "var(--text-lead)" }}
        >
          Hemos recibido tu solicitud. Te contactaremos para coordinar una
          llamada de 20 minutos, ver tu caso y calcular el encaje exacto de
          Atribuya en tu empresa. Sin compromiso.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-ink-2"
        >
          Volver al inicio
        </Link>
      </main>

      <Footer locale="es" />
    </div>
  );
}
