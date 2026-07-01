import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Atribuya",
  description:
    "Privacy Policy for Atribuya, a multi-tenant SaaS for attributing Google Business Profile reviews to sales representatives.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://atribuya.com/en/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <h1 style={h1}>Privacy Policy</h1>
      <p style={lede}>Last updated: June 7, 2026.</p>

      <p style={p}>
        This Privacy Policy describes how personal data is processed within{" "}
        <strong>Atribuya</strong>, a multi-tenant SaaS platform that enables
        businesses with a sales team to attribute Google Business Profile reviews
        to their sales representatives. It applies to authorised users of the
        Service, to end customers registered by sales reps, and to review
        authors whose public data is synchronised from Google.
      </p>

      <h2 style={h2}>1. Data controller and data processor</h2>
      <p style={p}>
        Atribuya holds two distinct roles depending on the type of data:
      </p>
      <ul style={ul}>
        <li>
          <strong>Data controller</strong> with respect to data relating to
          persons who subscribe to the Service and to account administrators
          (identifying, billing and authentication data required to provide the
          Service).
        </li>
        <li>
          <strong>Data processor</strong> (Art. 28 GDPR) with respect to data
          that each client organisation introduces into its instance: sales reps,
          end customers, Google listings, reviews and activity logs. In this
          case, <strong>the Client</strong> (the contracting organisation) acts
          as the data controller for that data.
        </li>
      </ul>
      <p style={p}>
        The controller's identifying details are in section 11.
      </p>

      <h2 style={h2}>2. Data we process</h2>

      <h3 style={h3}>2.1 Client and administrator data</h3>
      <ul style={ul}>
        <li>Company name or individual name, tax ID, billing address.</li>
        <li>Name, email, phone and role of the administrator or contact person.</li>
        <li>
          Aggregated service usage data at the organisation level (number of
          connected listings, active sales reps, sync frequency, etc.).
        </li>
      </ul>

      <h3 style={h3}>2.2 Authorised user data (sales reps and managers)</h3>
      <ul style={ul}>
        <li>
          Name, email, phone (optional), assigned role and linked Google listing
          (in the case of sales reps).
        </li>
        <li>
          Technical data derived from authentication: unique user identifier,
          date of last access, active sessions.
        </li>
        <li>Profile photo when voluntarily uploaded by the user.</li>
      </ul>

      <h3 style={h3}>2.3 End customer data registered by sales reps</h3>
      <ul style={ul}>
        <li>
          Full name of the end customer and, optionally, email and phone number,
          as entered by the sales rep to generate the personalised link.
        </li>
        <li>
          Records of personalised link opens (
          <code style={code}>share_links</code>): date and time, referral channel
          (WhatsApp, email, SMS, QR, direct) and browser user-agent.
        </li>
      </ul>

      <h3 style={h3}>2.4 Data synchronised from Google Business Profile</h3>
      <ul style={ul}>
        <li>
          Reviews published on connected Google listings: author name as shown by
          Google, star rating, review text, date and internal review reference.
        </li>
        <li>
          Administrative information about the connected listing: Google account
          identifier, listing identifier and email of the account that authorised
          the connection.
        </li>
        <li>
          Google OAuth access tokens: stored in an isolated table with access
          restricted to server-side processes; never exposed to the user's
          browser.
        </li>
      </ul>

      <h2 style={h2}>3. Purpose and legal basis</h2>
      <p style={p}>
        Processing is carried out for the following purposes, under the legal
        bases indicated:
      </p>
      <ul style={ul}>
        <li>
          <strong>Service provision</strong> (authentication, automatic review
          attribution, dashboards, Google synchronisation): performance of the
          contract (Art. 6(1)(b) GDPR) with the Client.
        </li>
        <li>
          <strong>Billing, support and legal compliance</strong>: compliance with
          legal obligations (Art. 6(1)(c)) and the controller's legitimate
          interests (Art. 6(1)(f)).
        </li>
        <li>
          <strong>Service improvement</strong> through aggregated and anonymised
          metrics: the controller's legitimate interests (Art. 6(1)(f)).
        </li>
        <li>
          <strong>End customer data registered by sales reps</strong>: the Client
          acts as controller and must establish an appropriate legal basis
          (typically legitimate interests in the context of the commercial
          relationship, or the end customer's consent). Atribuya only processes
          that data on the Client's instructions.
        </li>
      </ul>

      <h2 style={h2}>4. Sub-processors</h2>
      <p style={p}>
        To provide the Service, the Provider uses the following vendors as
        processors or sub-processors:
      </p>
      <ul style={ul}>
        <li>
          <strong>Supabase</strong> (Singapore, with EU data centres): PostgreSQL
          database hosting and authentication service.
        </li>
        <li>
          <strong>Vercel</strong> (USA, with EU edge nodes): application hosting
          and cron job execution.
        </li>
        <li>
          <strong>Google LLC</strong>: provider of the Google Places and Google
          Business Profile APIs to which the Client connects their listings.
        </li>
        <li>
          <strong>SMTP provider</strong> (currently transactional email managed
          by Supabase Auth; in the future Brevo or equivalent, both with EU
          servers): sending magic links and notifications.
        </li>
        <li>
          <strong>GitHub</strong> (USA, owned by Microsoft): used solely to run
          the hourly workflow that triggers the public sync endpoint; it does not
          receive personal data from the Client.
        </li>
      </ul>
      <p style={p}>
        Vendors established outside the European Economic Area offer appropriate
        safeguards: Standard Contractual Clauses issued by the European
        Commission, EU-US Data Privacy Framework certifications or other
        mechanisms provided for in Chapter V of the GDPR.
      </p>
      <p style={p}>
        The Client may request from the Provider an up-to-date list of
        sub-processors and sign a specific Data Processing Agreement (DPA) when
        subscribing to the Service.
      </p>

      <h2 style={h2}>5. Retention periods</h2>
      <ul style={ul}>
        <li>
          <strong>Client and administrator data</strong>: for the duration of the
          agreement and for the applicable statutory retention periods after
          termination (typically six years for commercial and tax obligations).
        </li>
        <li>
          <strong>Authorised user data</strong>: while they belong to an active
          organisation. Upon deletion of a user, identifying data is erased;
          associated activity logs are retained in anonymised form.
        </li>
        <li>
          <strong>End customer data and share_links</strong>: for as long as
          needed for review attribution (approximately 12 months), unless
          manually deleted earlier by the sales rep or administrator.
        </li>
        <li>
          <strong>Synchronised reviews</strong>: for as long as they exist on
          Google. If the end customer deletes their review, the system reflects
          this on the next sync via the{" "}
          <code style={code}>removed_at</code> field.
        </li>
        <li>
          <strong>OAuth tokens</strong>: until the Client revokes the connection
          from the listing panel or from their Google account.
        </li>
        <li>
          <strong>Audit log</strong>: five years from the date of each entry,
          unless a longer legal retention obligation applies.
        </li>
      </ul>

      <h2 style={h2}>6. Data subject rights</h2>
      <p style={p}>
        Any person whose data appears in Atribuya may exercise the rights
        recognised by the GDPR: access, rectification, erasure, objection,
        restriction of processing and portability. To do so, send a written
        request to{" "}
        <a href="mailto:alejandro@atribuya.com" style={a}>
          alejandro@atribuya.com
        </a>{" "}
        identifying yourself and describing the right you wish to exercise.
      </p>
      <p style={p}>
        If the data belongs to an end customer registered by a sales rep of a
        contracting organisation, the request is forwarded to that organisation
        (the actual data controller) and handled jointly.
      </p>
      <p style={p}>
        If you consider that the processing of your data does not comply with
        applicable law, you may lodge a complaint with the Spanish Data
        Protection Agency (
        <a href="https://www.aepd.es" style={a}>
          aepd.es
        </a>
        ) or with the supervisory authority of your country of residence within
        the EU.
      </p>

      <h2 style={h2}>7. Security</h2>
      <p style={p}>
        The Service implements technical and organisational measures to protect
        personal data: multi-tenant isolation through PostgreSQL Row Level
        Security, encryption in transit (HTTPS/TLS) and at rest, OAuth token
        rotation, audit logging of critical actions and role-based separation of
        responsibilities within each organisation.
      </p>

      <h2 style={h2}>8. Cookies and similar technologies</h2>
      <p style={p}>
        <strong>Technical cookies.</strong> In the authenticated area of the
        Service, Atribuya uses strictly necessary technical cookies to maintain
        the user's session and to ensure the platform works correctly. These
        cookies do not require consent.
      </p>
      <p style={p}>
        <strong>Third-party analytics cookies.</strong> On the public marketing
        pages of atribuya.com, Atribuya uses Google Analytics 4, a web analytics
        service provided by Google Ireland Limited, to understand how the site is
        used and to improve it. Google Analytics sets cookies and may transfer
        data to Google LLC (USA), covered by Standard Contractual Clauses and the
        EU-US Data Privacy Framework.
      </p>
      <p style={p}>
        These analytics cookies{" "}
        <strong>are only loaded if you give your prior consent</strong> via the
        banner shown on first visit. Until you click "Accept", no Google script
        runs and no analytics cookie is set. You may decline without affecting
        your browsing experience, and you can change your choice at any time from
        the "Cookies" link in the page footer.
      </p>
      <p style={p}>
        No advertising or commercial profiling cookies are used. For more
        information on Google's data processing, see{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline" }}
        >
          policies.google.com/privacy
        </a>
        .
      </p>

      <h2 style={h2}>9. Public Google review data</h2>
      <p style={p}>
        Reviews published on Google Business Profile are content voluntarily
        published by their authors on a public platform. Atribuya synchronises
        them for the purpose of identifying the sales rep who originated the
        visit and presenting the Client with an aggregated dashboard. Review
        authors retain all their rights over that content with respect to Google
        and may also exercise the rights listed in section 6 against the
        Atribuya controller.
      </p>

      <h2 style={h2}>10. Changes to this policy</h2>
      <p style={p}>
        This policy may be updated to reflect changes in the product, in
        applicable law or in sub-processors. The date of the last update appears
        at the top of this document. Material changes will be notified to the
        administrators of contracting organisations by email with reasonable
        prior notice.
      </p>

      <h2 style={h2}>11. Controller contact details</h2>
      <p style={p}>
        <strong>Alejandro Castillo Cantón</strong>
        <br />
        Tax ID: 55418862V
        <br />
        Address: Calle Leopoldo Querol 53, 3, 12560 Benicàssim, Castellón, Spain
        <br />
        Phone: +34 644 295 159
        <br />
        Privacy contact email:{" "}
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
const h3: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 15,
  fontWeight: 600,
  margin: "22px 0 8px",
  color: "var(--ink-2)",
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
const a: React.CSSProperties = {
  color: "var(--ink)",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};
const code: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  padding: "1px 4px",
  background: "var(--surface-2)",
  border: "1px solid var(--line)",
  borderRadius: 4,
};
