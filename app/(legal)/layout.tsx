import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font-text)",
        padding: "56px 24px 80px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <article
        style={{
          width: "100%",
          maxWidth: 720,
        }}
      >
        <header style={{ marginBottom: 36, paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            <img
              src="/brand/logo-horizontal.png"
              alt="Atribuya"
              width={132}
              height={42}
              style={{ display: "block", height: "auto" }}
            />
            <span style={{ fontSize: 12.5, color: "var(--ink-4)" }}>
              · Atribuya
            </span>
          </Link>
        </header>

        {children}

        <footer
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12.5,
            color: "var(--ink-4)",
          }}
        >
          <span>
            © {new Date().getFullYear()} Atribuya
          </span>
          <span style={{ display: "flex", gap: 16 }}>
            <Link href="/privacidad" style={{ color: "var(--ink-3)", textDecoration: "none" }}>
              Política de Privacidad
            </Link>
            <Link href="/terminos" style={{ color: "var(--ink-3)", textDecoration: "none" }}>
              Términos del Servicio
            </Link>
            <Link href="/login" style={{ color: "var(--ink-3)", textDecoration: "none" }}>
              Iniciar sesión
            </Link>
          </span>
        </footer>
      </article>
    </main>
  );
}
