import type { Metadata } from "next";
import { LeadForm } from "@/components/landing/LeadForm";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ReviewProof } from "@/components/landing/ReviewProof";

export const metadata: Metadata = {
  title: "Atribuya: attribute Google reviews to each sales rep, automatically",
  description:
    "B2B SaaS that attributes Google Business Profile reviews to individual sales reps, without asking the customer to mention the rep's name. For companies with field sales teams.",
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

const STEPS = [
  {
    n: "01",
    title: "Each rep gets a personal link",
    body: "Atribuya generates a personalized link per sales rep, and optionally per customer. The rep adds it to their email signature, business card or sends it via WhatsApp.",
  },
  {
    n: "02",
    title: "The customer leaves the review",
    body: "The link takes the customer straight to the Google review form for your listing. One click. They don't have to search for anything or mention the rep's name.",
  },
  {
    n: "03",
    title: "You instantly know who brought it in",
    body: "Atribuya cross-references the review with whoever shared the link, the time window and the customer's name, and assigns it on its own. If something doesn't fit, it sits in manual review with suggestions: one click and done. No more guessing by eye.",
  },
];

const FEATURES = [
  "Works with any Google Business Profile listing you already have.",
  "Each customer only sees their own data: full isolation enforced by Postgres RLS.",
  "Your reps find out on their own: automatic email the moment they earn a review.",
  "See your team's ranking at a glance, without building any spreadsheet.",
  "Take it all to Excel whenever you want: filtered by rep, listing and dates.",
  "Counts both text reviews and star-only ratings. None slip through.",
  "Warns you if a review disappears, whether the customer or Google removes it.",
  "Several offices or listings? Manage them all from the same account.",
];

const PLANS = [
  {
    name: "Starter",
    fichas: "Up to 2 Google listings",
    price: "45",
    tagline: "A clinic, a development, a single location.",
    featured: true,
  },
  {
    name: "Professional",
    fichas: "Up to 10 Google listings",
    price: "149",
    tagline: "The developer or network with several sites.",
    featured: false,
  },
];

const PRICING_INCLUDED = [
  "Unlimited sales reps, no per-user cost",
  "Automatic review attribution by time window and name similarity",
  "Admin dashboard with per-rep, per-listing metrics and ranking",
  "Personal panel for each rep with their target and earned reviews",
  "Roles (admin, sales rep, reviews manager) with separate permissions",
  "Full data isolation with encryption and daily backups",
  "GDPR compliant, signed DPA",
  "Full implementation in just a few business days",
  "30-minute training session for your sales team",
  "Email support with response within 24 hours",
  "Full data export whenever you want",
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
      "The monthly subscription scales with the number of Google listings you manage: from €45/month (up to 2 listings) or €149/month (up to 10). Sales reps are unlimited on every plan, so your team grows without paying more. More than 10 listings or a chain? We tailor a plan with you.",
      "On top of that there's a one-time €60 turnkey setup that includes connecting your listings, onboarding your team, training your sales reps and support during the first weeks. No minimum contract. For an exact assessment of your case we book a 20-minute call.",
    ],
  },
  {
    q: "Is there a minimum contract?",
    a: [
      "No. The subscription is monthly with no commitment. You can cancel anytime and we export all your data.",
      "If within 90 days we haven't correctly attributed at least 70% of the reviews your reps have earned, we refund the setup fee in full.",
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
      "If what you need is to know who on your team brings you the 5★ reviews and who doesn't, today the market gives you only two options: a manual spreadsheet, or Atribuya.",
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

export default function HomePageEn() {
  return (
    <div className="min-h-screen bg-bg font-text text-ink">
      <Header locale="en" />

      <main id="contenido">
        {/* ========================== Hero — Stat-Led ========================== */}
        <section
          aria-label="Pilot results"
          className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:pb-20 sm:pt-16"
        >
          <div className="grid items-end gap-y-10 gap-x-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <p
                className="font-display font-light italic leading-[0.85] tracking-[-0.04em] text-ink"
                style={{ fontSize: "var(--text-stat)" }}
              >
                100<span className="not-italic font-normal">%</span>
              </p>
              <p className="mt-4 max-w-md text-[15px] leading-snug text-ink-2 sm:text-[16px]">
                of verified reviews, attributed on their own in the pilot's
                first month. Without lifting a finger.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-y-6 gap-x-6 md:col-span-5 md:grid-cols-1 md:gap-y-7">
              <div>
                <dt
                  className="font-display font-light italic leading-none tracking-tight text-ink"
                  style={{ fontSize: "var(--text-stat-sm)" }}
                >
                  Day 1
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  you see which rep brings each review, and who's falling behind.
                </dd>
              </div>
              <div>
                <dt
                  className="font-display font-light italic leading-none tracking-tight text-ink"
                  style={{ fontSize: "var(--text-stat-sm)" }}
                >
                  0
                </dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-3">
                  arguments over &ldquo;whose review was this?&rdquo;
                </dd>
              </div>
            </dl>
          </div>

          <hr className="my-12 border-line sm:my-14" />

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
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-ink-2"
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
                <p className="mt-3 text-[13px] text-ink-3">
                  No commitment. We show you who drives your business.
                </p>
              </div>
            </div>
            <div className="md:col-span-5">
              <ReviewProof locale="en" />
            </div>
          </div>

          {/* Sectors — point at the customer, don't hide them */}
          <div className="mt-12 border-t border-line pt-10 sm:mt-14">
            <p
              className="max-w-2xl font-display font-medium leading-snug tracking-tight text-ink"
              style={{ fontSize: "var(--text-h3)" }}
            >
              Got a sales team and Google reviews?{" "}
              <em className="font-light text-ink-2">This is for you.</em>
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

          {/* Pilot data attribution */}
          <p className="mt-10 text-[12px] leading-relaxed text-ink-4">
            Data from Atribuya's pilot deployment with a real estate developer:
            4 sales reps, 1 Google Business Profile listing, first month.
            Industry, size and metrics are real; customer name kept confidential
            pending commercial release.
          </p>
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
        <section
          id="how"
          aria-label="How it works"
          className="mx-auto max-w-6xl px-5 py-16 sm:py-24"
        >
          <div className="max-w-2xl">
            <h2
              className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Three steps.
              <br />
              <em className="font-light text-ink-2">
                Zero friction for the customer.
              </em>
            </h2>
            <p className="mt-5 leading-relaxed text-ink-2">
              Customers don't install anything, don't fill out forms and don't
              need to mention the rep's name. They just leave the Google review
              as they always do.
            </p>
          </div>

          <ol className="mt-14 grid gap-y-12 gap-x-10 md:grid-cols-3 md:gap-y-0">
            {STEPS.map((s) => (
              <li key={s.n} className="relative">
                <span
                  aria-hidden="true"
                  className="font-display font-light italic leading-none tracking-[-0.04em] text-ink-4"
                  style={{ fontSize: "clamp(3.5rem, 2rem + 6vw, 5.5rem)" }}
                >
                  {s.n}
                </span>
                <h3
                  className="mt-4 font-display font-medium leading-tight tracking-tight text-ink"
                  style={{ fontSize: "var(--text-h3)" }}
                >
                  {s.title}
                </h3>
                <p className="mt-3 leading-relaxed text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ============================ Case study ============================ */}
        <section
          id="case"
          aria-label="Case study"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
              Case study
            </p>
            <h2
              className="mt-3 font-display font-medium leading-[1.1] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              A real estate developer with a model home on the
              <em className="font-light text-ink-2">
                {" "}
                Mediterranean coast.
              </em>
            </h2>
            <div
              className="mt-7 space-y-5 leading-relaxed text-ink-2"
              style={{ fontSize: "var(--text-lead)" }}
            >
              <p>
                Four sales reps, one Google Business Profile listing at the
                model home. Before Atribuya, the admin spent{" "}
                <strong className="font-semibold text-ink">
                  two afternoons a month
                </strong>{" "}
                attributing reviews in an Excel sheet, and even so, there were
                arguments about which rep earned what.
              </p>
              <p>
                In the first month with Atribuya, the system attributed{" "}
                <strong className="font-semibold text-ink">
                  100% of verified reviews
                </strong>{" "}
                to their responsible sales rep, with no manual intervention.
                The spreadsheet disappeared. So did the arguments.
              </p>
              <p className="text-ink-3">
                For reference: roughly{" "}
                <span className="tabular-nums">8 hours/month</span> they got
                back over manual attribution, and zero internal disputes about
                review ownership.
              </p>
            </div>
            <p className="mt-10 text-[12px] leading-relaxed text-ink-4">
              Industry, size and metrics are real; customer name kept
              confidential pending commercial release.
            </p>
          </div>
        </section>

        {/* ============================= Features ============================= */}
        <section
          aria-label="What's included"
          className="mx-auto max-w-6xl px-5 py-16 sm:py-24"
        >
          <h2
            className="max-w-2xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h2)" }}
          >
            <em className="font-light">What's</em> in the box.
          </h2>
          <ul className="mt-10 grid gap-x-10 gap-y-4 md:grid-cols-2">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 border-b border-line py-3 text-ink-2"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-ok"
                />
                <span className="text-[15px] leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ============================== Pricing ============================== */}
        <section
          id="pricing"
          aria-label="Pricing"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <div className="max-w-2xl">
              <h2
                className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
                style={{ fontSize: "var(--text-h2)" }}
              >
                One plan <em className="font-light">for every size.</em>
              </h2>
              <p
                className="mt-5 leading-relaxed text-ink-2"
                style={{ fontSize: "var(--text-lead)" }}
              >
                You pay by the number of Google listings you manage. Sales reps
                are unlimited on every plan. Turnkey setup, monthly
                subscription, cancel anytime.
              </p>
            </div>

            {/* Two plans by number of listings + custom — Starter highlighted */}
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={
                    plan.featured
                      ? "relative flex flex-col rounded-2xl border border-ink/15 bg-bg p-7 shadow-card sm:p-8"
                      : "relative flex flex-col rounded-2xl border border-line bg-white p-7 sm:p-8"
                  }
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-7 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                      Most popular
                    </span>
                  )}
                  <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                    {plan.name} plan
                  </p>
                  <p className="mt-4 flex items-baseline gap-x-1.5">
                    <span className="font-display text-[2.5rem] font-medium leading-none tracking-tight text-ink sm:text-[3rem]">
                      €{plan.price}
                    </span>
                    <span className="text-[14px] text-ink-3">/ month</span>
                  </p>
                  <p className="mt-3 text-[14.5px] font-medium text-ink">
                    {plan.fichas}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-3">
                    {plan.tagline}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-2">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-1.5 w-1.5 rounded-full bg-ok"
                    />
                    Unlimited sales reps
                  </p>
                  <a
                    href="#contact"
                    className={
                      plan.featured
                        ? "mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-ink-2"
                        : "mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-[15px] font-semibold text-ink transition hover:bg-ink/[0.04]"
                    }
                  >
                    Get started
                  </a>
                </article>
              ))}

              {/* Custom card — chains and more than 10 listings */}
              <article className="relative flex flex-col rounded-2xl border border-line bg-white p-7 sm:p-8">
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                  Custom plan
                </p>
                <p className="mt-4 font-display text-[1.75rem] font-medium leading-none tracking-tight text-ink sm:text-[2rem]">
                  Custom
                </p>
                <p className="mt-3 text-[14.5px] font-medium text-ink">
                  More than 10 Google listings
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-3">
                  Chains and networks with several sites.
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-2">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-1.5 w-1.5 rounded-full bg-ok"
                  />
                  Unlimited sales reps
                </p>
                <a
                  href="#contact"
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-[15px] font-semibold text-ink transition hover:bg-ink/[0.04]"
                >
                  Let's talk
                </a>
              </article>
            </div>

            <p className="mt-5 text-[13px] leading-relaxed text-ink-3">
              A one-time €60 turnkey setup is added to any plan. No minimum
              contract.
            </p>

            {/* What every plan includes */}
            <div className="mt-12">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                Every plan includes
              </p>
              <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {PRICING_INCLUDED.map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-ok"
                    />
                    <span className="text-[14.5px] leading-relaxed text-ink-2">
                      {it}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <div className="rounded-2xl border border-line bg-white px-7 py-7 sm:px-9 sm:py-8">
                  <p className="font-display text-[16px] font-medium text-ink sm:text-[17px]">
                    <em className="font-light">Guarantee:</em> if it doesn't
                    work, we refund the setup in full.
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                    If within the first 90 days Atribuya doesn't correctly
                    attribute at least 70% of the reviews coming through your
                    reps' links, we refund the setup in full. No questions
                    asked.
                  </p>
                </div>
              </div>

              <aside
                aria-label="Founding Customer Program"
                className="md:col-span-5 md:pt-6"
              >
                <p className="font-display text-[13px] font-medium uppercase tracking-[0.16em] text-gold">
                  Founding Customer · 5 spots
                </p>
                <p
                  className="mt-4 font-display font-medium leading-[1.15] tracking-tight text-ink"
                  style={{ fontSize: "var(--text-h3)" }}
                >
                  <em className="font-light">For the first five</em>{" "}
                  companies that join now, special terms.
                </p>
                <dl className="mt-6 space-y-4 text-[14.5px] leading-relaxed text-ink-2">
                  <div className="flex justify-between gap-4 border-b border-line pb-3">
                    <dt>
                      Subscription
                      <br />
                      <span className="text-[13px] text-ink-3">first year</span>
                    </dt>
                    <dd className="text-right">
                      <span className="font-semibold text-ink">half price</span>{" "}
                      <span className="text-ink-4">on the plan you choose</span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>From month&nbsp;13</dt>
                    <dd className="text-right text-ink-3">
                      standard rate for your plan
                    </dd>
                  </div>
                </dl>
                <p className="mt-7 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                  What we ask in return
                </p>
                <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-2">
                  <li>12-month minimum commitment.</li>
                  <li>Permission to use your name as a reference.</li>
                  <li>A brief interview after 6 months.</li>
                </ul>
                <p className="mt-5 text-[13px] italic leading-relaxed text-ink-3">
                  If you want to join as a Founding Customer, mention it
                  explicitly during the call.
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* ================================ FAQ ================================ */}
        <section
          id="faq"
          aria-label="Frequently asked questions"
          className="mx-auto max-w-3xl px-5 py-16 sm:py-24"
        >
          <h2
            className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h2)" }}
          >
            <em className="font-light">What people</em> usually ask.
          </h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                name="faq"
                className="group open:bg-white"
              >
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
          {/* JSON-LD FAQPage for Google rich snippets. Rendered inline in SSR
              so Googlebot reads it on the first fetch. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </section>

        {/* ============================== Contact ============================== */}
        <section
          id="contact"
          aria-label="Request demo"
          className="border-t border-line bg-white"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <h2
              className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-ink"
              style={{ fontSize: "var(--text-h2)" }}
            >
              <em className="font-light">Want to know</em>
              <br />
              who on your team drives the business?
            </h2>
            <p
              className="mt-5 max-w-xl leading-relaxed text-ink-2"
              style={{ fontSize: "var(--text-lead)" }}
            >
              We reply within 24&nbsp;h. The demo lasts 20 minutes: we walk you
              through the live app with sample data and see if it fits your
              team.
            </p>
            <div className="mt-10">
              <LeadForm locale="en" />
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" />
    </div>
  );
}
