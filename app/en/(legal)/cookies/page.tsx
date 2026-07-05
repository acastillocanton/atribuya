import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb } from "@/lib/marketing/seo";
import { CookiePrefs } from "@/components/landing/CookiePrefs";

export const metadata: Metadata = {
  title: "Cookie Policy · Atribuya",
  description:
    "Atribuya's Cookie Policy: which cookies we use, their purpose and duration, and how to accept, decline or withdraw your consent.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://atribuya.com/en/cookies" },
};

const bc = makeBreadcrumb({
  locale: "en",
  crumbs: [{ name: "Cookie Policy", path: "/en/cookies" }],
});

export default function CookiePolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <Breadcrumbs
        items={bc.items}
        className="mx-auto w-full max-w-6xl px-5 pt-6"
      />
      <article className="mx-auto w-full max-w-[720px] px-6 pt-8">
        <h1 style={h1}>Cookie Policy</h1>
        <p style={lede}>Last updated: July 5, 2026.</p>

        <p style={p}>
          This Cookie Policy explains what cookies are, which ones{" "}
          <strong>Atribuya</strong> uses on atribuya.com, their purpose and
          duration, and how you can accept, decline or withdraw your consent at
          any time. It complements our{" "}
          <Link href="/en/privacy" style={a}>
            Privacy Policy
          </Link>
          .
        </p>

        <h2 style={h2}>1. What cookies are</h2>
        <p style={p}>
          A cookie is a small text file that a website stores in your browser
          when you visit it. Among other things, it helps remember your
          preferences or measure, in aggregate, how the site is used. Alongside
          cookies there are similar technologies (local storage, identifiers)
          that we treat under the same criteria.
        </p>

        <h2 style={h2}>2. Cookies we use</h2>
        <p style={p}>
          On the public pages of atribuya.com we only use technical cookies and,
          with your prior consent, Google Analytics analytics cookies. We do not
          use advertising or commercial profiling cookies.
        </p>

        <div style={{ overflowX: "auto", margin: "0 0 18px" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Cookie</th>
                <th style={th}>Provider</th>
                <th style={th}>Purpose</th>
                <th style={th}>Type</th>
                <th style={th}>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>
                  <code style={code}>atribuya_consent</code>
                </td>
                <td style={td}>Atribuya (first-party)</td>
                <td style={td}>
                  Remembers your cookie choice (accepted or declined, per
                  category) and serves as proof of your consent.
                </td>
                <td style={td}>Technical (necessary)</td>
                <td style={td}>6 months</td>
              </tr>
              <tr>
                <td style={td}>Session cookies</td>
                <td style={td}>Atribuya (first-party)</td>
                <td style={td}>
                  Keep you signed in and the private area working. Only used if
                  you access the application.
                </td>
                <td style={td}>Technical (necessary)</td>
                <td style={td}>Session</td>
              </tr>
              <tr>
                <td style={td}>
                  <code style={code}>_ga</code>,{" "}
                  <code style={code}>_ga_*</code>
                </td>
                <td style={td}>Google Ireland Limited</td>
                <td style={td}>
                  Measure, in aggregate, how the public pages are used (visits,
                  page views) to help us improve them.
                </td>
                <td style={td}>Analytics (third-party)</td>
                <td style={td}>Up to 2 years</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={p}>
          Technical cookies are exempt from consent because they are essential
          to provide the service. Google's analytics cookies{" "}
          <strong>are only loaded if you give your prior consent</strong>: until
          you click "Accept", no Google script runs and no analytics cookie is
          set.
        </p>

        <h2 style={h2}>3. Legal basis and consent</h2>
        <p style={p}>
          The basis for technical cookies is the legitimate interest in
          providing a service the user has requested. The basis for analytics
          cookies is your <strong>consent</strong> (art. 6.1.a GDPR), collected
          via a banner shown on your first visit. You can decline as easily as
          you accept, without affecting your browsing. We store your choice with
          a timestamp and version, so we can honour it and demonstrate your
          consent; if we update this policy, we will ask you again.
        </p>

        <h2 style={h2}>4. How to manage or withdraw your consent</h2>
        <p style={p}>
          You can change or withdraw your choice at any time from the cookie
          preferences panel:
        </p>
        <p style={p}>
          <CookiePrefs label="Open cookie preferences" />
        </p>
        <p style={p}>
          You will also find the "Cookies" link in the footer of every page. In
          addition, you can block or delete cookies from your browser settings
          (Chrome, Firefox, Safari, Edge and others let you manage and delete
          them). Note that blocking technical cookies may affect how the private
          area works.
        </p>

        <h2 style={h2}>5. International transfers</h2>
        <p style={p}>
          Google Analytics is a service provided by Google Ireland Limited. When
          you use it, Google may process data and transfer it to Google LLC
          (USA), relying on the European Commission's Standard Contractual
          Clauses and the EU-US Data Privacy Framework. You can review how Google
          processes data at{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={a}
          >
            policies.google.com/privacy
          </a>
          , and install the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            style={a}
          >
            Google Analytics opt-out add-on
          </a>{" "}
          for your browser.
        </p>

        <h2 style={h2}>6. Changes to this policy</h2>
        <p style={p}>
          We may update this Cookie Policy to reflect changes in the site, in the
          tools we use, or in applicable law. The date of the last update appears
          at the top of the document. When a change affects cookies subject to
          consent, we will ask for your choice again.
        </p>

        <h2 style={h2}>7. Contact</h2>
        <p style={p}>
          Controller: <strong>Alejandro Castillo Cantón</strong>. For any
          questions about this policy, you can write to{" "}
          <a href="mailto:alejandro@atribuya.com" style={a}>
            alejandro@atribuya.com
          </a>
          .
        </p>
      </article>
    </>
  );
}

const h1: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 32,
  fontWeight: 700,
  letterSpacing: "-0.025em",
  margin: "0 0 12px",
};
const lede: React.CSSProperties = {
  margin: "0 0 28px",
  fontSize: 13.5,
  color: "var(--ink-3)",
};
const h2: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 19,
  fontWeight: 600,
  letterSpacing: "-0.015em",
  margin: "32px 0 12px",
};
const p: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 14.5,
  lineHeight: 1.65,
  color: "var(--ink-2)",
};
const a: React.CSSProperties = {
  color: "var(--ink)",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};
const table: React.CSSProperties = {
  width: "100%",
  minWidth: 560,
  borderCollapse: "collapse",
  fontSize: 13.5,
  color: "var(--ink-2)",
};
const th: React.CSSProperties = {
  textAlign: "left",
  fontWeight: 600,
  color: "var(--ink)",
  borderBottom: "1px solid var(--line-strong)",
  padding: "8px 10px",
  verticalAlign: "top",
};
const td: React.CSSProperties = {
  borderBottom: "1px solid var(--line)",
  padding: "8px 10px",
  verticalAlign: "top",
  lineHeight: 1.5,
};
const code: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  background: "var(--surface-2)",
  padding: "1px 5px",
  borderRadius: 5,
};
