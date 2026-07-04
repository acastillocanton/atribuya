import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";

export default function EnLegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <SiteHeader locale="en" />
      <main className="pb-20">{children}</main>
      <Footer locale="en" />
    </div>
  );
}
