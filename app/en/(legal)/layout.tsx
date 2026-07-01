import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/landing/Footer";

export default function EnLegalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main
        style={{
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
        </article>
      </main>

      <Footer locale="en" />
    </>
  );
}
