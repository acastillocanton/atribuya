import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <SiteHeader locale="es" altLangHref="/en/blog" />
      <main>{children}</main>
      <Footer locale="es" />
    </div>
  );
}
