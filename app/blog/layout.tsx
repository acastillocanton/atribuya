import { BlogHeader } from "@/components/blog/BlogHeader";
import { Footer } from "@/components/landing/Footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <BlogHeader locale="es" />
      <main>{children}</main>
      <Footer locale="es" />
    </div>
  );
}
