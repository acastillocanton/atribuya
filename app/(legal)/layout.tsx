import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <SiteHeader locale="es" />
      <main className="pb-20">{children}</main>
      <Footer locale="es" />
    </div>
  );
}
