import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Thank you · Atribuya",
  description:
    "We received your request. We'll get back to you within 24 hours to find the right fit of Atribuya for your company.",
  // Confirmation page: keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <Header locale="en" />

      <main
        id="contenido"
        className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center sm:py-32"
      >
        <span
          aria-hidden="true"
          className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-full bg-ok-bg text-ok"
        >
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        </span>

        <h1
          className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
          style={{ fontSize: "var(--text-h2)" }}
        >
          Thanks. <em className="font-light">We'll be in touch within 24h.</em>
        </h1>

        <p
          className="mt-6 leading-relaxed text-ink-2"
          style={{ fontSize: "var(--text-lead)" }}
        >
          We received your request. We'll reach out to schedule a 20-minute
          call, look at your case and work out the exact fit of Atribuya for
          your company. No commitment.
        </p>

        <Link
          href="/en"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-ink-2"
        >
          Back to home
        </Link>
      </main>

      <Footer locale="en" />
    </div>
  );
}
