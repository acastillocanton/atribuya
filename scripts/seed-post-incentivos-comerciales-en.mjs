// Espejo de scripts/seed-post-incentivos-comerciales.mjs con contenido en inglés,
// language: "en", slug y categoría propios. Reutiliza el MISMO autor y la MISMA
// portada que la versión ES (lee el mainImage del post ES → no vuelve a subir
// imágenes ni pisa las ilustraciones nuevas puestas desde el Studio).
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-incentivos-comerciales-en.mjs          # crea si no existe
//   node scripts/seed-post-incentivos-comerciales-en.mjs --force  # reescribe el cuerpo
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const readEnv = (name) =>
  (envText.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^"|"$/g, "");

const projectId = readEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
const dataset = readEnv("NEXT_PUBLIC_SANITY_DATASET") || "production";
const token = readEnv("SANITY_API_WRITE_TOKEN") || process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) { console.error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID en .env.local"); process.exit(1); }
if (!token) { console.error("Falta SANITY_API_WRITE_TOKEN (Editor de sanity.io/manage)"); process.exit(1); }

const force = process.argv.includes("--force");

const client = createClient({ projectId, dataset, apiVersion: "2026-07-01", token, useCdn: false });

// --- Helpers de Portable Text ------------------------------------------------
let _k = 0;
const key = () => "b" + (_k++).toString(36).padStart(3, "0");
const span = (text, marks = []) => ({ _type: "span", _key: key(), text, marks });
const block = (style, children) => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children: Array.isArray(children) ? children : [span(children)],
});
const mixed = (parts, extra = {}) => {
  if (typeof parts === "string") parts = [{ text: parts }];
  const markDefs = [];
  const children = parts.map((p) => {
    const marks = [...(p.marks || [])];
    if (p.href) {
      const k = key();
      markDefs.push({ _type: "link", _key: k, href: p.href });
      marks.push(k);
    }
    return span(p.text, marks);
  });
  return { _type: "block", _key: key(), style: "normal", markDefs, children, ...extra };
};
const para = (parts) => mixed(parts);
const li = (parts) => mixed(parts, { listItem: "bullet", level: 1 });
const num = (parts) => mixed(parts, { listItem: "number", level: 1 });

// --- Cuerpo ------------------------------------------------------------------
const body = [
  para([
    { text: "In short: ", marks: ["strong"] },
    { text: "yes, you can pay bonuses or commissions to your sales team for earning Google reviews. What you cannot do is incentivize the customer who writes them: that violates Google's policies and puts your listing at risk. The difference between an incentive plan that motivates and one that breeds arguments comes down to three things: rewarding only verified, attributed reviews, setting a single transparent rule, and adding guardrails against gaming. Without reliable attribution of each review to its sales rep, the bonus becomes a source of conflict instead of motivation." },
  ]),

  block("h2", "Why tie incentives to reviews"),
  para([
    { text: "Google reviews are one of the few sales outcomes visible from the outside. A happy customer leaving five stars is public proof of a well-closed sale and a well-handled experience. They also drive acquisition directly: the vast majority of consumers check reviews before choosing a local business, as BrightLocal's annual " },
    { text: "Local Consumer Review Survey", href: "https://www.brightlocal.com/research/local-consumer-review-survey/" },
    { text: " measures year after year." },
  ]),
  para([
    { text: "For a sales director they have another virtue: they measure behavior your CRM cannot see. The CRM records the sale; the review records how the customer felt after the sale. If you want your team to care about that last stretch, it makes sense to recognize and reward it. The first step, though, is " },
    { text: "getting your team to ask for reviews consistently", href: "/en/blog/get-google-reviews-with-your-sales-team" },
    { text: "; the incentive comes afterwards, to sustain the habit." },
  ]),

  block("h2", "The red line: who you can incentivize and who you cannot"),
  block("normal", "Before designing anything, be crystal clear about the boundary, because it is easy to cross and your Google listing pays the consequences:"),
  li([
    { text: "Incentivizing the customer is forbidden. ", marks: ["strong"] },
    { text: "Offering discounts, gifts, raffles or money in exchange for a review violates " },
    { text: "Google Maps content policies", href: "https://support.google.com/contributionpolicy/answer/7400114" },
    { text: ", which ban incentivized content. Google can remove those reviews and penalize the listing." },
  ]),
  li([
    { text: "Compensating your own team is an internal business decision. ", marks: ["strong"] },
    { text: "Google does not regulate your commission plan. Paying a sales rep for doing the review-request process well, naturally and without pressuring anyone, breaks no policy." },
  ]),
  para([
    { text: "The important nuance: a poorly designed internal incentive pushes the team straight toward what is forbidden, pressuring customers, promising them something in return or filtering who gets asked. That is why guardrails matter as much as the amount. For the full detail of what Google allows when asking for reviews, see " },
    { text: "how to ask for Google reviews without breaking the rules", href: "/en/blog/ask-for-google-reviews-without-breaking-policies" },
    { text: "." },
  ]),

  block("h2", "Without reliable attribution there is no fair bonus"),
  block("normal", "This is where most incentive plans fall apart. Paying money requires an indisputable fact: which review each sales rep earned. Two complications make that hard to do by hand:"),
  li([
    { text: "You cannot ask the customer to name the rep in the review. ", marks: ["strong"] },
    { text: "Requesting content that identifies an employee goes against Google's policies. Attribution has to be solved another way: by crossing when the review was requested with who the customer was." },
  ]),
  li([
    { text: "Spreadsheets fall short as soon as money is involved. ", marks: ["strong"] },
    { text: "Matching reviews by hand every week works until a rep disputes an assignment on payday. A misspelled name or an overwritten row stops being an anecdote when it decides a bonus." },
  ]),
  block("normal", "The practical rule: if the data that decides the incentive can be disputed, the incentive creates more conflict than motivation. Verification before payment is not bureaucracy; it is what makes the bonus defensible in front of the team."),

  block("h2", "Four incentive models that work"),
  block("normal", "There is no single correct plan. These four models cover most cases and can be combined:"),
  num([
    { text: "Flat commission per verified review. ", marks: ["strong"] },
    { text: "A reasonable amount for each attributed, confirmed review. The most direct model: reps see the link between their work and their paycheck. Works well as a base." },
  ]),
  num([
    { text: "Monthly target with a bonus. ", marks: ["strong"] },
    { text: "A number of reviews per rep per month and a reward for hitting it. Sustains the habit and keeps the effort from bunching into streaks." },
  ]),
  num([
    { text: "Ranking with recognition. ", marks: ["strong"] },
    { text: "Not everything is money: a visible leaderboard, milestone badges and recognition in the team meeting move more than you would expect. Design it so it does not pit the team against each other; we cover how in " },
    { text: "review rankings without rivalry", href: "/en/blog/sales-rep-review-ranking-without-rivalry" },
    { text: "." },
  ]),
  num([
    { text: "Mixed model. ", marks: ["strong"] },
    { text: "A small commission per review plus a reward for the monthly target. Splits motivation between the short term (every review counts) and consistency (the full month)." },
  ]),
  block("normal", "Whatever the model, three design rules are non-negotiable:"),
  li([{ text: "One single, transparent rule. ", marks: ["strong"] }, { text: "The whole team knows which reviews count, from when, and how they are verified. No fine print, no last-minute exceptions." }]),
  li([{ text: "Pay for the verified review, not the promise. ", marks: ["strong"] }, { text: "What counts is what lands on Google and gets attributed, not activity or intentions." }]),
  li([{ text: "Quality counts too. ", marks: ["strong"] }, { text: "Rewarding volume alone invites gaming. Add the average rating or month-over-month improvement to the recognition." }]),

  block("h2", "Five guardrails against gaming"),
  block("normal", "Every incentive creates the temptation to cut corners. These five controls neutralize it without turning the plan into paperwork:"),
  num([
    { text: "Verification before payment. ", marks: ["strong"] },
    { text: "No review enters the payout without being attributed and verified. Most resolve automatically; doubtful ones get confirmed with one click before closing." },
  ]),
  num([
    { text: "Duplicate detection. ", marks: ["strong"] },
    { text: "The same customer can only count once. If they leave two reviews, or edit the one they had, the system must keep a single valid one." },
  ]),
  num([
    { text: "Rate frozen at closing. ", marks: ["strong"] },
    { text: "Commission changes apply going forward, never to an already closed month. It avoids the feeling that the rules change when it is time to pay." },
  ]),
  num([
    { text: "Negative reviews get looked at too. ", marks: ["strong"] },
    { text: "An incentive plan cannot paper over problems. One and two star reviews need an immediate alert and follow-up, not silence." },
  ]),
  num([
    { text: "No self-reviews or reviews from friends and family. ", marks: ["strong"] },
    { text: "Besides breaking internal trust, Google detects and removes this kind of review, putting everyone's listing at risk." },
  ]),

  block("h2", "The most common mistakes"),
  li([{ text: "Promising the customer something in exchange for the review. ", marks: ["strong"] }, { text: "The most common violation and the most expensive one: removed reviews and a listing at risk." }]),
  li([{ text: "Paying for raw volume without verification. ", marks: ["strong"] }, { text: "By month three you get doubtful reviews, duplicates and payday arguments." }]),
  li([{ text: "Asking only happy customers for reviews. ", marks: ["strong"] }, { text: "Selective solicitation also goes against Google's policies. Ask everyone and manage whatever comes." }]),
  li([{ text: "A bonus that pits the team against each other. ", marks: ["strong"] }, { text: "If only first place wins, everyone else checks out. Recognize improvement and consistency, not just the podium." }]),
  li([{ text: "Settling payouts by hand with money at stake. ", marks: ["strong"] }, { text: "A spreadsheet is fine to start; to pay bonuses you need data nobody can dispute." }]),

  block("h2", "How Atribuya solves it"),
  block("normal", "Atribuya is built exactly for this case: it attributes every Google review to the sales rep who earned it, without asking the customer for anything unusual, and turns that attribution into the basis of the incentive:"),
  li([{ text: "Per-review commission in euros", marks: ["strong"] }, { text: ", configurable per rep, with a monthly settlement cycle and rates frozen for closed months." }]),
  li([{ text: "Built-in verification: ", marks: ["strong"] }, { text: "most reviews attribute themselves and doubtful ones land in a queue to confirm with one click." }]),
  li([{ text: "Duplicate detection out of the box: ", marks: ["strong"] }, { text: "the same customer counts once, even if they edit or repeat their review." }]),
  li([{ text: "Ranking, monthly goals and badges", marks: ["strong"] }, { text: " for the recognition side, plus immediate alerts for one and two star reviews for the management side." }]),
  para([
    { text: "If you handle this by hand today, you can start for free with our " },
    { text: "review attribution template", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " and upgrade when the volume, or the money at stake, calls for it." },
  ]),

  block("h2", "Frequently asked questions"),
  block("h3", "Can I pay my sales reps for earning Google reviews?"),
  block("normal", "Yes. How you compensate your team is an internal business decision and Google does not regulate it. What Google's policies forbid is incentivizing the person who writes the review (the customer) or faking content. Build the plan on verified reviews with transparent rules and you will be fine."),
  block("h3", "Can I offer customers a discount in exchange for a review?"),
  para([
    { text: "No. " },
    { text: "Google's content policies", href: "https://support.google.com/contributionpolicy/answer/7400114" },
    { text: " forbid incentivized content: discounts, gifts, raffles or money in exchange for reviews. Google can remove those reviews and penalize the business listing." },
  ]),
  block("h3", "How much should I pay per review?"),
  block("normal", "There is no universal figure. A practical reference is what an organic lead is worth to you: a review keeps attracting customers long after it is published. In practice, a modest flat amount per verified review works well, complemented by a monthly target bonus and non-monetary recognition."),
  block("h3", "How do I keep the incentive from being gamed?"),
  block("normal", "With four controls: verifying every review before settlement, detecting duplicates per customer, freezing rates for closed months and zero tolerance for self-reviews. When the underlying data is reliable, gaming stops paying off."),
  block("h3", "Is a spreadsheet enough to settle the bonuses?"),
  para([
    { text: "To get started, yes: the " },
    { text: "review attribution template", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " organizes the process for free. The limit arrives with money: when a manual match decides someone's pay, any error or doubt turns into conflict. At that point you want automatic verification." },
  ]),

  block("h2", "In summary"),
  block("normal", "Rewarding your sales team for Google reviews works and is perfectly legitimate, as long as the incentive points inward (your team) and never outward (the customer who writes). The plan stands on three legs: reviews verified and attributed to their rep, a single rule everyone knows, and guardrails that make gaming not worth it. With that, the bonus stops being a source of arguments and becomes what it was meant to be: a fair way to recognize whoever takes care of the customer all the way to the end."),
  para([
    { text: "Want to pay incentives on data nobody can dispute? " },
    { text: "Book a demo of Atribuya", href: "/en/demo" },
    { text: " and we will show you attribution, commissions and the ranking working with your own listing." },
  ]),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.sales-team-en";
const esPostId = "post.incentivos-comerciales-resenas-google-es";
const postId = "post.incentivos-comerciales-resenas-google-en";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Sales team",
  slug: { _type: "slug", current: "sales-team" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "en",
  title: "Sales rep incentives and bonuses based on Google reviews",
  slug: { _type: "slug", current: "sales-rep-incentives-google-reviews" },
  excerpt:
    "Yes, you can pay your team bonuses for earning Google reviews; what you cannot do is incentivize the customer. How to design a fair plan, which models work and which guardrails stop gaming.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Sales rep incentives for Google reviews: a practical guide",
  seoDescription:
    "How to design incentives and bonuses for your sales team based on verified Google reviews, without incentivizing customers or breaking Google's policies.",
};

async function reuseEsCover() {
  const es = await client.getDocument(esPostId).catch(() => null);
  if (!es?.mainImage?.asset?._ref) {
    throw new Error(`No pude leer la portada del post ES ${esPostId}. ¿Existe y tiene mainImage?`);
  }
  return {
    _type: "image",
    asset: { _type: "reference", _ref: es.mainImage.asset._ref },
    alt: "Atribuya's per-rep review ranking, the basis for paying sales incentives and bonuses on verified data",
  };
}

async function run() {
  console.log(`Sanity: proyecto ${projectId} / dataset ${dataset}`);

  const author = await client.getDocument(authorId).catch(() => null);
  if (!author) {
    console.error(`No existe el autor ${authorId}. Ejecuta antes scripts/seed-post.mjs.`);
    process.exit(1);
  }
  console.log(`  ✓ autor existente "${author.name}"`);

  await client.createOrReplace(category);
  console.log(`  ✓ categoría "${category.title}"`);

  const existing = await client.getDocument(postId).catch(() => null);
  const publishedAt = existing?.publishedAt ?? new Date().toISOString();

  if (existing && !force) {
    console.log("  • post existente: no se toca (usa --force para reescribir el cuerpo y la portada).");
  } else {
    const cover = await reuseEsCover();
    console.log(`  ✓ portada reutilizada del post ES (${cover.asset._ref})`);
    await client.createOrReplace({ ...post, publishedAt, body, mainImage: cover });
    console.log(`  ✓ artículo "${post.title}" (publishedAt ${publishedAt})`);
  }
  console.log(`\nURL: https://atribuya.com/en/blog/${post.slug.current}`);
  console.log("Visible tras la revalidación ISR (máx. 600s) o al redeploy.");
  console.log("Recuerda: enlazar el par en scripts/link-post-translations.mjs y correrlo.");
}

run().catch((err) => {
  console.error("\nError:", err.message ?? err);
  process.exit(1);
});
