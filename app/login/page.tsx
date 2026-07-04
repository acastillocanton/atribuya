import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "./LoginForm";

// Página interna: se queda fuera del índice (hereda el noindex global). La
// descripción evita el warning de meta-description sin exponerla en buscadores.
export const metadata: Metadata = {
  title: "Acceso · Atribuya",
  description:
    "Acceso a la gestión interna de Atribuya. Solo para usuarios invitados por su administrador.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string; error?: string; sent?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h1 style={{ margin: 0 }}>
            <img
              src="/brand/logo-horizontal.png"
              alt="Atribuya"
              width={220}
              height={70}
              style={{ display: "inline-block", height: "auto" }}
            />
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              color: "var(--ink-3)",
              fontSize: 13,
            }}
          >
            Gestión interna de reseñas
          </p>
        </div>
        <Card padding={22}>
          <LoginForm
            next={params.next}
            error={params.error}
            sent={params.sent === "1"}
          />
        </Card>
        <p
          style={{
            marginTop: 14,
            textAlign: "center",
            color: "var(--ink-3)",
            fontSize: 12,
          }}
        >
          Acceso solo para usuarios invitados por su administrador.
        </p>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "center",
            gap: 14,
            fontSize: 11.5,
            color: "var(--ink-3)",
          }}
        >
          <Link
            href="/privacidad"
            style={{ color: "var(--ink-3)", textDecoration: "none" }}
          >
            Privacidad
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/terminos"
            style={{ color: "var(--ink-3)", textDecoration: "none" }}
          >
            Términos
          </Link>
        </div>
      </div>
    </main>
  );
}
