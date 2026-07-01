import Link from "next/link";
import type { ReactNode } from "react";

export default function EnLegalLayout({ children }: { children: ReactNode }) {
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
            href="/en"
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
            <Link href="/en/privacy" style={{ color: "var(--ink-3)", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <Link href="/en/terms" style={{ color: "var(--ink-3)", textDecoration: "none" }}>
              Terms of Service
            </Link>
            <Link href="/login" style={{ color: "var(--ink-3)", textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="/terminos" style={{ color: "var(--ink-3)", textDecoration: "none" }}>
              Español
            </Link>
          </span>
        </footer>
      </article>
    </main>
  );
}
