import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <SiteHeader locale="es" />
      <main
        style={{
          padding: "40px 24px 80px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <article style={{ width: "100%", maxWidth: 720 }}>{children}</article>
      </main>
      <Footer locale="es" />
    </div>
  );
}
