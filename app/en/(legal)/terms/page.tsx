import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { makeBreadcrumb } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "Terms of Service · Atribuya",
  description:
    "Terms and conditions for the Atribuya service: multi-tenant SaaS for automatic attribution of Google Business Profile reviews to individual sales reps.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://atribuya.com/en/terms" },
};

const bc = makeBreadcrumb({
  locale: "en",
  crumbs: [{ name: "Terms of Service", path: "/en/terms" }],
});

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc.jsonLd) }}
      />
      <Breadcrumbs items={bc.items} className="mb-6" />
      <h1 style={h1}>Terms of Service</h1>
      <p style={lede}>Last updated: May 24, 2026.</p>

      <p style={p}>
        These Terms of Service (hereinafter "the Terms") govern access to and
        use of Atribuya, a software-as-a-service (SaaS) platform that enables
        businesses with a sales team to automatically attribute Google Business
        Profile reviews to their individual sales representatives. Atribuya is
        provided by the party identified in section 14.
      </p>
      <p style={p}>
        By subscribing to the service or by accessing the application, the
        Client and its authorised users accept these Terms. If you disagree with
        any of the conditions, do not use the service.
      </p>

      <h2 style={h2}>1. Definitions</h2>
      <ul style={ul}>
        <li>
          <strong>Service</strong> or <strong>Atribuya</strong>: the platform
          accessible at <code style={code}>atribuya.com</code>, including the
          web application, integrations with Google Business Profile and Google
          Places API, and the matching, notification and export features.
        </li>
        <li>
          <strong>Client</strong>: the organisation (company, self-employed
          individual, entity or professional) that subscribes to the Service and
          for which an <em>organisation</em> account is created in Atribuya.
        </li>
        <li>
          <strong>Authorised Users</strong>: the individuals invited by the
          Client to use the Service (administrators, sales reps and review
          managers).
        </li>
        <li>
          <strong>Provider</strong>: Alejandro Castillo Cantón, identified in
          section 14, owner of the Service.
        </li>
      </ul>

      <h2 style={h2}>2. Who can subscribe to Atribuya</h2>
      <p style={p}>
        Atribuya is intended exclusively for legal entities, self-employed
        individuals and professionals who subscribe to the Service to manage
        their organisation's sales activity. It is not a service for individual
        consumers or minors.
      </p>
      <p style={p}>
        New organisations are onboarded manually by the Provider. There is no
        self-service sign-up: every subscription goes through a prior
        conversation and an individual commercial proposal.
      </p>

      <h2 style={h2}>3. Description of the service</h2>
      <p style={p}>The Service allows the Client to:</p>
      <ul style={ul}>
        <li>
          Register Google Business Profile listings and link them to their
          organisation within Atribuya.
        </li>
        <li>
          Invite their sales reps and managers as authorised users, each with a
          distinct role and permissions limited to their own organisation.
        </li>
        <li>
          Generate personalised links of the form{" "}
          <code style={code}>/o/[organisation]/c/[sales-rep]/[client]</code>{" "}
          that redirect to the Google review form.
        </li>
        <li>
          Automatically synchronise received reviews (via Google Places API
          and/or Google Business Profile API) and attribute them to the
          corresponding sales rep using a time-window and name-similarity
          algorithm.
        </li>
        <li>
          Access activity dashboards, export reports and manually review the
          attributions proposed by the system.
        </li>
      </ul>

      <h2 style={h2}>4. Accounts, credentials and Client responsibilities</h2>
      <p style={p}>
        The Client designates at least one person as the initial administrator
        when subscribing to the service. The administrator is responsible for
        inviting the rest of the authorised users within their organisation and
        managing their permissions.
      </p>
      <p style={p}>The Client and its authorised users agree to:</p>
      <ul style={ul}>
        <li>
          Keep access credentials confidential and notify the Provider of any
          suspected unauthorised use.
        </li>
        <li>
          Use the Service only for its intended purposes and in compliance with
          applicable law.
        </li>
        <li>
          Not share credentials or leave sessions open on uncontrolled devices.
        </li>
        <li>
          Not attempt to access data belonging to other organisations on the
          Service or to circumvent the multi-tenant isolation controls.
        </li>
        <li>
          Report any detected security vulnerabilities to the contact email
          indicated in section 14.
        </li>
      </ul>

      <h2 style={h2}>5. Client data and end-customer data</h2>
      <p style={p}>
        Each organisation is the <strong>owner and controller</strong> of the
        data it registers in its Atribuya instance: information about its sales
        reps, end customers, connected Google Business Profile listings and
        attributed reviews. The Provider acts as a{" "}
        <strong>data processor</strong> with respect to that data, pursuant to
        Article 28 of Regulation (EU) 2016/679 (GDPR). Processing details are
        governed by the{" "}
        <a href="/en/privacy" style={a}>Privacy Policy</a>.
      </p>
      <p style={p}>
        When a sales rep registers a customer in their panel, they confirm that
        they have obtained the customer's identifying data (name and, optionally,
        email and phone) legitimately within the context of the commercial
        relationship. Any data subject request from the end customer (access,
        erasure, objection, etc.) must be handled by the Client's organisation
        in the first instance; the Provider will cooperate as necessary.
      </p>

      <h2 style={h2}>6. Acceptable use</h2>
      <p style={p}>The Client agrees not to use the Service to:</p>
      <ul style={ul}>
        <li>
          Generate fake reviews or artificial traffic to Google listings.
          Atribuya is designed to manage real reviews obtained from real sales
          visits; non-compliance exposes the Client to Google's policies and to
          suspension of the service.
        </li>
        <li>
          Store special categories of personal data (ethnic origin, health,
          ideology, biometric data, etc.) or data relating to minors.
        </li>
        <li>
          Reverse-engineer, decompile or otherwise attempt to derive the source
          code of the Service.
        </li>
        <li>
          Overload the infrastructure through automated scripts that exceed
          reasonable commercial use.
        </li>
      </ul>

      <h2 style={h2}>7. Service availability</h2>
      <p style={p}>
        The Provider makes reasonable efforts to keep the Service available but
        does not guarantee continuous uptime. Interruptions may occur due to
        scheduled maintenance, failures of subcontracted providers (Supabase,
        Vercel, Google, SMTP provider) or force majeure events.
      </p>
      <p style={p}>
        Review synchronisation depends on Google APIs and their quotas and
        limits. No real-time guarantee exists: reviews are synchronised at
        periodic intervals defined by the system.
      </p>

      <h2 style={h2}>8. Pricing and payment</h2>
      <p style={p}>
        Commercial terms (monthly fee, onboarding setup cost, number of listings
        and sales reps included, etc.) are agreed individually with each Client
        and documented in a specific proposal or contract outside this document.
        Billing is manual (professional services) until further notice.
      </p>
      <p style={p}>
        Non-payment of any invoice entitles the Provider to temporarily suspend
        access to the Service, with prior notice to the Client.
      </p>

      <h2 style={h2}>9. Confidentiality</h2>
      <p style={p}>
        Each party agrees to treat as confidential the commercial, technical and
        operational information of the other party that it learns in the context
        of the Service, unless such information is public, was previously known
        or is obtained from independent lawful sources. This obligation subsists
        during the term of the agreement and for two years after its termination.
      </p>

      <h2 style={h2}>10. Intellectual property</h2>
      <p style={p}>
        Atribuya, its source code, design, brand, domains and documentation are
        the property of the Provider. These Terms do not transfer any
        intellectual property rights to the Client: the Client receives a
        non-exclusive, non-transferable licence limited to the duration of the
        agreement.
      </p>
      <p style={p}>
        Google reviews and public listing data are the property of their
        respective authors or of Google as applicable; Atribuya processes them
        under the terms of Google's APIs.
      </p>

      <h2 style={h2}>11. Term, cancellation and data portability</h2>
      <p style={p}>
        The Service agreement has the duration agreed with each Client. Either
        party may terminate it by written notice with a minimum of thirty (30)
        calendar days, except in the case of a material breach by the other
        party (in which case termination is immediate).
      </p>
      <p style={p}>
        After cancellation, the Provider will retain the Client's data for up to
        sixty (60) calendar days in case of reactivation, after which it will be
        securely deleted, unless a legal retention obligation applies. The Client
        may request an Excel export of their data prior to cancellation.
      </p>

      <h2 style={h2}>12. Limitation of liability</h2>
      <p style={p}>
        To the maximum extent permitted by applicable law, the Provider's total
        liability to the Client for any claim arising from the Service is limited
        to the total amount invoiced to the Client in the twelve (12) months
        preceding the event giving rise to the claim.
      </p>
      <p style={p}>
        In no event shall the Provider be liable for indirect, consequential,
        lost profit, lost business opportunity, reputational or data-loss damages
        when such loss is attributable to subcontracted providers or to the
        Client itself.
      </p>
      <p style={p}>
        Automatic review attribution is a system proposal; the final decision to
        count or reassign a review rests with the Client's administrator, who has
        access to a manual verification queue.
      </p>

      <h2 style={h2}>13. Modifications and governing law</h2>
      <p style={p}>
        These Terms may be updated to reflect changes in the product or in
        applicable law. The date of the last update appears at the top of this
        document. Material changes will be notified to the Client's
        administrators by email with at least thirty (30) calendar days' notice.
      </p>
      <p style={p}>
        These Terms are governed by Spanish law. For the resolution of any
        dispute, the parties submit to the Courts and Tribunals of Castellón,
        expressly waiving any other jurisdiction, unless mandatory consumer
        protection law requires otherwise.
      </p>

      <h2 style={h2}>14. Provider and contact</h2>
      <p style={p}>
        <strong>Alejandro Castillo Cantón</strong>
        <br />
        Tax ID: 55418862V
        <br />
        Address: Calle Leopoldo Querol 53, 3, 12560 Benicàssim, Castellón, Spain
        <br />
        Phone: +34 644 295 159
        <br />
        Contact email:{" "}
        <a href="mailto:alejandro@atribuya.com" style={a}>
          alejandro@atribuya.com
        </a>
      </p>
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
  color: "var(--ink-4)",
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
const ul: React.CSSProperties = {
  margin: "0 0 14px",
  paddingLeft: 22,
  fontSize: 14.5,
  lineHeight: 1.65,
  color: "var(--ink-2)",
};
const code: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  padding: "1px 4px",
  background: "var(--surface-2)",
  border: "1px solid var(--line)",
  borderRadius: 4,
};
const a: React.CSSProperties = {
  color: "var(--ink)",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};
