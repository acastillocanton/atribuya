import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";

export default function BlogLayoutEn({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <SiteHeader locale="en" altLangHref="/blog" />
      <main>{children}</main>
      <Footer locale="en" />
    </div>
  );
}
