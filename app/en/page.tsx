import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { ReviewProof } from "@/components/landing/ReviewProof";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ProductShot } from "@/components/landing/ProductShot";
import { HubTeasers } from "@/components/sections/HubTeasers";
import { WhyAtribuya } from "@/components/sections/WhyAtribuya";
import { SectionCta } from "@/components/sections/SectionCta";

export const metadata: Metadata = {
  title: "Atribuya: know which rep brings in every Google review",
  description:
    "Attributes every Google review to the sales rep who earned it, automatically and without asking the customer for a name. Team ranking, alerts, Excel export.",
  alternates: {
    canonical: "https://atribuya.com/en",
    languages: {
      "es-ES": "https://atribuya.com/",
      "en-US": "https://atribuya.com/en",
      "x-default": "https://atribuya.com/",
    },
  },
  openGraph: {
    title: "Atribuya: know which rep brings in every Google review",
    description:
      "Stop guessing who on your team drives the business. No spreadsheets, no templates, no asking the customer for the rep's name. Atribuya does it on its own.",
    url: "https://atribuya.com/en",
    siteName: "Atribuya",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atribuya: know which rep brings in every Google review",
    description:
      "Stop guessing who on your team drives the business. No spreadsheets, no templates, no arguments.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const SECTORS = [
  "Real estate developers with a model home",
  "Vacation rentals",
  "Clinics and medical practices",
  "B2B services with field sales",
  "Any business with a sales team",
];

const FEATURES = [
  "Works with any Google Business Profile listing you already have.",
  "Each customer only sees their own data: full isolation enforced by Postgres RLS.",
  "Your reps find out on their own: automatic email the moment they earn a review.",
  "See your team's ranking at a glance, without building any spreadsheet.",
  "Take it all to Excel whenever you want: filtered by rep, listing and dates.",
  "Counts both text reviews and star-only ratings. None slip through.",
  "Warns you if a review disappears, whether the customer or Google removes it.",
  "Instant alert when a 1 or 2 star review comes in, so you can reply in time.",
  "Several offices or listings? Manage them all from the same account.",
];

type FaqItem = { q: string; a: string[] };

const FAQS: FaqItem[] = [
  {
    q: "How does Atribuya know which sales rep earned each review?",
    a: [
      "When a sales rep meets a customer, they send them a personalized link by WhatsApp, email or SMS. That link takes the customer straight to \"Write a review\" on Google. When the review comes in, Atribuya automatically links it to the rep responsible for that customer.",
      "In our pilot deployment, the system correctly attributes the majority of reviews automatically. The rest sit in a queue for your admin to verify with a single click.",
    ],
  },
  {
    q: "Does this comply with Google's policies?",
    a: [
      "Yes. Atribuya uses Google's official APIs with the proper permissions. We never ask the customer to mention the sales rep in the review, we never filter opinions, we never offer incentives.",
      "The customer writes whatever they want, wherever they want. We just make sure they reach the right place to leave their opinion.",
    ],
  },
  {
    q: "Do my sales reps have to learn a complicated tool?",
    a: [
      "No. The rep interface is 4 screens: their customers, generate a link, share, view their ranking. Initial training takes 30 minutes and we deliver it as part of the setup.",
    ],
  },
  {
    q: "How long until I see results?",
    a: [
      "Full setup is done in just a few business days. From day 1 you're already attributing new reviews. To get a clear picture of per-rep performance you need 4-6 weeks of data.",
      "The gap between your top performer and the rest shows up much sooner than you'd expect.",
    ],
  },
  {
    q: "How much does it cost?",
    a: [
      "The monthly subscription scales with the size of your sales team: €45/month for up to 5 sales reps (with 1 Google listing), €99/month for up to 15 reps (up to 3 listings) and €199/month for up to 30 reps (up to 10 listings). Every feature is included on every plan. Bigger team or more listings? We tailor a plan with you.",
      "On top of that there's a one-time €129 turnkey setup that includes connecting your listings, onboarding your team, training your sales reps and support during the first weeks. No minimum contract. For an exact assessment of your case we book a 20-minute call.",
    ],
  },
  {
    q: "Is there a minimum contract?",
    a: [
      "No. The subscription is monthly with no commitment. You can cancel anytime and we export all your data.",
    ],
  },
  {
    q: "Is my data secure?",
    a: [
      "Yes. Data is stored on European servers, encrypted in transit and at rest. Each customer is isolated at the database level. We comply with GDPR and sign a DPA with each customer.",
    ],
  },
  {
    q: "Why Atribuya instead of an established tool like Birdeye or Trustpilot?",
    a: [
      "The big tools manage reviews, but none of them attribute reviews to individual sales reps. That's the category Atribuya opens up.",
      "Atribuya doesn't replace your review manager: it adds the layer none of the big tools have, knowing which person generated each experience. You can use it alongside whatever you already have.",
      "If what you need is to know who on your team brings you the 5★ reviews and who doesn't, today the market gives you only two options: a manual spreadsheet, or Atribuya.",
    ],
  },
  {
    q: "Do I have to migrate my spreadsheet or history?",
    a: [
      "No. You start fresh with new reviews from day 1. There's nothing to import and nothing you can lose along the way.",
    ],
  },
  {
    q: "Does Atribuya reply to reviews for me?",
    a: [
      "Today Atribuya alerts you to every new review, including 1 and 2 star ones, so you reply in time on Google without missing any.",
      "Replying directly from Atribuya, with the context of which rep generated the experience, is on the way.",
    ],
  },
  {
    q: "How do we get started?",
    a: [
      "You book a 20-minute call. We look at your case, work out the exact fit for your company, and if we're on the same page we send you a proposal the same day. No commitment, no credit card.",
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a.join("\n\n") },
  })),
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://atribuya.com/#website",
      url: "https://atribuya.com/",
      name: "Atribuya",
      alternateName: "atribuya.com",
      inLanguage: "en-US",
      publisher: { "@id": "https://atribuya.com/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://atribuya.com/#organization",
      name: "Atribuya",
      url: "https://atribuya.com/",
      logo: "https://atribuya.com/icon.png",
      description:
        "Software that attributes every Google Business Profile review to the salesperson who earned it, automatically and without asking the customer for a name. A Castillo Cantón product.",
      founder: {
        "@type": "Person",
        "@id": "https://atribuya.com/blog/autor/alejandro-castillo#person",
        name: "Alejandro Castillo",
        url: "https://atribuya.com/blog/autor/alejandro-castillo",
      },
      sameAs: ["https://www.linkedin.com/company/atribuya"],
    },
  ],
};

export default function HomePageEn() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <SiteHeader locale="en" />

      <main id="contenido">
        {/* ========================== Hero — Stat-Led ========================== */}
        <section
          aria-label="Atribuya"
          className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:pb-20 sm:pt-16"
        >
          {/* H1 + subhead + CTA (left) · proof card (right) — asymmetric */}
          <div className="grid items-center gap-y-10 gap-x-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <h1
                className="text-balance font-display font-medium leading-[1.04] tracking-[-0.02em] text-ink"
                style={{ fontSize: "var(--text-display)" }}
              >
                Stop guessing which rep brings in your
                Google reviews.
              </h1>
              <p
                className="mt-6 max-w-xl text-pretty leading-relaxed text-ink-2"
                style={{ fontSize: "var(--text-lead)" }}
              >
                Your reps stop arguing. You see who drives the business. No
                spreadsheets, no templates and no asking the customer for the
                rep's name. Atribuya does it on its own.
              </p>
              <div className="mt-8">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="/en/demo"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-accent-strong"
                  >
                    Show me who drives my business
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
                    </svg>
                  </a>
                  <a
                    href="/en/pricing"
                    className="inline-flex items-center justify-center rounded-full border border-ink/20 px-6 py-3.5 text-[15px] font-semibold text-ink transition hover:bg-ink/[0.04]"
                  >
                    See pricing
                  </a>
                </div>
                <p className="mt-3 text-[13px] text-ink-3">
                  No commitment. Google's official APIs, GDPR and a signed DPA.
                </p>
              </div>
            </div>
            <div className="md:col-span-5">
              <ReviewProof locale="en" />
            </div>
          </div>

          {/* Pilot proof — the 100% becomes support, not the lead */}
          <dl className="mt-12 grid gap-x-10 gap-y-8 border-t border-line pt-10 sm:mt-14 sm:grid-cols-3">
            <div>
              <dt
                className="font-display font-light italic leading-none tracking-tight text-accent"
                style={{ fontSize: "var(--text-stat-sm)" }}
              >
                100<span className="not-italic">%</span>
              </dt>
              <dd className="mt-2 max-w-[17rem] text-[14px] leading-snug text-ink-3">
                of the pilot's verified reviews, attributed to their rep. Most on
                their own; the rest, one click away.
              </dd>
            </div>
            <div>
              <dt
                className="font-display font-light italic leading-none tracking-tight text-accent"
                style={{ fontSize: "var(--text-stat-sm)" }}
              >
                0
              </dt>
              <dd className="mt-2 max-w-[17rem] text-[14px] leading-snug text-ink-3">
                arguments over who each review belonged to.
              </dd>
            </div>
            <div>
              <dt
                className="font-display font-light italic leading-none tracking-tight text-accent"
                style={{ fontSize: "var(--text-stat-sm)" }}
              >
                Day 1
              </dt>
              <dd className="mt-2 max-w-[17rem] text-[14px] leading-snug text-ink-3">
                up and running: you see which rep brings each review from the very
                first day.
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-[12px] leading-relaxed text-ink-4">
            Data from Atribuya's pilot deployment with a real estate developer: 4
            sales reps, 1 Google Business Profile listing, first month. Industry,
            size and metrics are real; customer name kept confidential pending
            commercial release.
          </p>

          {/* Sectors — point at the customer, don't hide them */}
          <div className="mt-12 border-t border-line pt-10 sm:mt-14">
            <p
              className="max-w-2xl font-display font-medium leading-snug tracking-tight text-ink"
              style={{ fontSize: "var(--text-h3)" }}
            >
              Got a sales team and Google reviews?{" "}
              <em className="font-light text-accent">This is for you.</em>
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {SECTORS.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] font-medium text-ink-2"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

        </section>

        {/* ============================= Problem ============================= */}
        <section aria-label="The problem" className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <div className="grid items-start gap-y-10 gap-x-12 md:grid-cols-12">
              <h2
                className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-white md:col-span-7"
                style={{ fontSize: "var(--text-h2)" }}
              >
                <em className="font-light">&ldquo;Whose review</em>
                <br />
                <em className="font-light">was this one?&rdquo;</em>
              </h2>
              <div className="md:col-span-5">
                <p
                  className="text-pretty leading-relaxed text-white/85"
                  style={{ fontSize: "var(--text-lead)" }}
                >
                  The customer writes &ldquo;great visit, the rep was very
                  helpful.&rdquo; No names. The admin spends hours every week
                  cross-referencing visit dates with Google reviews, by eye,
                  trying to guess who served whom.
                </p>
                <p className="mt-5 leading-relaxed text-white/70">
                  Bonuses miscalculated. Reps frustrated. Time wasted arguing
                  over attribution. Reviews that get missed because nobody is
                  tracking them. At the end of it all, the question no
                  admin can answer by eye: whose review was this?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ How it works ============================ */}
        <section id="how" aria-label="How it works">
          <HowItWorks locale="en" />
        </section>

        {/* === Real product — show the panel, don't just describe it === */}
        <section
          aria-label="Inside the product"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <div className="grid items-center gap-y-10 gap-x-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <h2
                  className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  Your whole team,{" "}
                  <em className="font-light text-accent">in one panel.</em>
                </h2>
                <p className="mt-5 max-w-md leading-relaxed text-ink-2">
                  Every rep, their reviews and their average rating in a single
                  view. You see who drives the business without opening a
                  spreadsheet, and the doubtful ones are resolved with one click.
                </p>
                <a
                  href="/en/product"
                  className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-accent underline decoration-line-strong underline-offset-4 transition hover:decoration-accent"
                >
                  See the product from the inside
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
                  </svg>
                </a>
              </div>
              <div className="md:col-span-7">
                <ProductShot
                  src="/landing/dashboard.png"
                  alt="Atribuya dashboard: reviews and average rating per sales rep"
                  width={2880}
                  height={1800}
                  url="atribuya.com/dashboard"
                  locale="en"
                  caption="The admin dashboard: per-rep metrics, in real time."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================== Why Atribuya (4 voices) ===================== */}
        <WhyAtribuya locale="en" />

        {/* ============================= Features ============================= */}
        <section
          aria-label="What's included"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2
              className="max-w-2xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              <em className="font-light text-accent">What's</em> in the box.
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-4 md:grid-cols-2">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 border-b border-line py-3 text-ink-2"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span className="text-[15px] leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* === Mid-page CTA — a conversion point halfway down === */}
        <section aria-label="Book a demo" className="border-t border-line bg-bg">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:py-14">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="max-w-xl font-display font-medium leading-tight tracking-tight text-ink"
                style={{ fontSize: "var(--text-h3)" }}
              >
                Can you see who drives your business?{" "}
                <em className="font-light text-accent">
                  Check it with your team.
                </em>
              </p>
              <a
                href="/en/demo"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-strong"
              >
                Request a demo
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ===================== Explore (section hub) ===================== */}
        <HubTeasers locale="en" />

        {/* ================================ FAQ ================================ */}
        <section
          id="faq"
          aria-label="Frequently asked questions"
          className="border-t border-line"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <h2
              className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              <em className="font-light text-accent">What people</em> usually ask.
            </h2>
            <div className="mt-10 divide-y divide-line border-y border-line">
              {FAQS.map(({ q, a }) => (
                <details key={q} name="faq" className="group open:bg-white">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-5 py-5 [&::-webkit-details-marker]:hidden sm:px-6">
                    <span className="font-display text-[17px] font-medium leading-snug tracking-tight text-ink sm:text-[18px]">
                      {q}
                    </span>
                    <svg
                      className="mt-1.5 h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <div className="space-y-3 px-5 pb-6 text-[15px] leading-relaxed text-ink-2 sm:px-6">
                    {a.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
          </div>
        </section>

        {/* ===== Trust — real signals, no fake logos or testimonials ===== */}
        <section
          aria-label="Trust and compliance"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
            <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="font-display text-lg font-medium tracking-tight text-ink">
                  Official Google APIs
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  We read reviews via the official Google Business Profile and
                  Places APIs. No scraping.
                </dd>
              </div>
              <div>
                <dt className="font-display text-lg font-medium tracking-tight text-ink">
                  GDPR compliant
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  Data on European servers, encrypted in transit and at rest.
                </dd>
              </div>
              <div>
                <dt className="font-display text-lg font-medium tracking-tight text-ink">
                  Signed DPA
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  A data processing agreement with each customer, under Article
                  28 of GDPR.
                </dd>
              </div>
              <div>
                <dt className="font-display text-lg font-medium tracking-tight text-ink">
                  Isolated per customer
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  Each organization is isolated at the database level (Postgres
                  Row Level Security).
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ============================ Final CTA ============================ */}
        <SectionCta locale="en" />
      </main>

      <Footer locale="en" />
    </div>
  );
}
