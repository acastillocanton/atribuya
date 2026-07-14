// Publishes the English mirror of "Cómo pedir reseñas de Google sin saltarte las
// políticas" → "How to ask for Google reviews without breaking the rules"
// (Pillar D, compliance). Reuses the existing author (author.castillo-canton),
// creates the EN category "Compliance & Google policies" and reuses the ES cover
// asset without re-uploading.
//
// Requires in .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Usage:
//   node scripts/seed-post-politicas-google-en.mjs          # create if missing
//   node scripts/seed-post-politicas-google-en.mjs --force  # rewrite body
//
// Deterministic _id → re-running without --force does not duplicate. After
// publishing, link the ES↔EN pair in scripts/link-post-translations.mjs.
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

// --- Portable Text helpers ---------------------------------------------------
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
const li = (children) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  listItem: "bullet",
  level: 1,
  markDefs: [],
  children: Array.isArray(children) ? children : [span(children)],
});
const paraWithLink = (before, linkText, href, after) => {
  const linkKey = key();
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [{ _type: "link", _key: linkKey, href }],
    children: [span(before), span(linkText, [linkKey]), span(after)],
  };
};

// --- Body --------------------------------------------------------------------
const body = [
  block("normal", [
    span("In short: ", ["strong"]),
    span(
      "you can ask your customers for Google reviews, but Google prohibits offering incentives in exchange, filtering so that only happy customers review you, and asking the customer to write your sales rep's name. Breaking those rules risks Google removing the reviews or penalizing your listing. The good news is that you need none of those practices: you can get legitimate reviews and still know which sales rep earned each one, without asking the customer for anything odd.",
    ),
  ]),

  block("h2", "Why the policies are worth taking seriously"),
  block(
    "normal",
    "Google reviews are today the first trust filter for your customers. That is why the temptation to force them is strong, and why Google watches. When it detects prohibited practices it can remove individual reviews, strip reviews all at once or, in serious cases, penalize the visibility of your Business Profile in Maps and the local pack.",
  ),
  block(
    "normal",
    "The problem for a business with a sales team is that many of these breaches happen without bad intent. A prize draw among reviewers, an email sent only to happy customers or asking the customer to put your sales rep's name all seem like harmless ideas to get more reviews. They all break the rules. It is worth knowing them before you build the process, not after Google wipes out half a quarter's work.",
  ),

  block("h2", "What Google prohibits exactly"),
  block(
    "normal",
    "The policies live in the Google Business Profile help center. These are the four prohibitions that most affect a sales team.",
  ),

  block("h3", "1. Incentives in exchange for reviews"),
  paraWithLink(
    "It is the most common and the clearest. Google's ",
    "Business Profile policies",
    "https://support.google.com/business/answer/3474122",
    " are explicit: offering free or discounted products or services to customers in exchange for posting, changing or removing negative reviews counts as fake engagement and is strictly prohibited.",
  ),
  block(
    "normal",
    "In practice this rules out discounts for reviews, gifts, gift cards, points and prize draws among reviewers. It does not matter whether the incentive is small or whether you condition the rating: the mere trade of a review for something is already fake engagement.",
  ),

  block("h3", "2. Filtering so only happy customers review you"),
  block(
    "normal",
    "Known as review gating. It means asking first whether the customer is satisfied and sending only the happy ones to Google, diverting the unhappy ones to a private form. Google prohibits it: the invitation to review has to be the same for everyone, without selecting by the expected rating. Asking a customer to remove or change a negative review falls in the same bucket.",
  ),

  block("h3", "3. Fake content that does not reflect a real experience"),
  block(
    "normal",
    "Reviews from people who were never customers, reviews written by the business itself or by employees about their own company, and duplicate or bought reviews. Google treats these as fake content. The review has to come from a real customer who lived the experience.",
  ),

  block("h3", "4. Asking the customer to mention your sales rep in the review"),
  block(
    "normal",
    "This is the specific trap for anyone with a sales team, and the one that matters most to us. To know which review each rep earned, the easy route is to ask the customer to write the rep's name in the text. Besides forcing the content of the review, something Google discourages, it leaves you fragile data: the customer gets the name wrong, omits it or misspells it, and your attribution falls apart. There are far better ways to know who brought each review without asking the customer to mention anyone, and we cover them below.",
  ),

  block("h2", "What you can do (and works better)"),
  block(
    "normal",
    "Complying with the policies does not leave you without tools. On the contrary, the legitimate practices are the ones that work best in the long run:",
  ),
  li([span("Ask for the review at the peak of satisfaction, ", ["strong"]), span("right after a visit or a service that went well.")]),
  li([span("Use a direct link or a QR code ", ["strong"]), span("that opens the write-a-review screen, so the customer does not have to search for the listing. Less friction, more reviews.")]),
  li([span("Invite every customer equally, ", ["strong"]), span("without filtering by the rating you expect. A healthy listing has varied reviews, and that builds more trust than a wall of perfect fives.")]),
  li([span("Respond to every review, ", ["strong"]), span("including the negative ones, politely and with a solution. It is your best reputation tool, and that one is allowed and recommended.")]),
  li([span("Give each sales rep their own personalized link, ", ["strong"]), span("so asking for the review becomes a natural part of their close.")]),
  block(
    "normal",
    "That last point is the key that connects compliance with what you really want to measure.",
  ),

  block("h2", "How to comply and still know who brought each review"),
  block(
    "normal",
    "Here is the knot. You need to attribute each review to a sales rep, but you cannot (and should not) ask the customer to write their name. The solution is not in the text of the review, but in the process that originates it.",
  ),
  block(
    "normal",
    "If each sales rep shares a personal link with their customer and you record when they do, you can later match each new review with the rep who originated it by the time window and the customer's name. The customer leaves their review on Google as always, without mentioning anyone, and you know who it came from. You comply with the policies and keep the data.",
  ),
  paraWithLink(
    "You can start organizing it today, with no tools, using a template. ",
    "Download the free review attribution template",
    "/recursos/plantilla-atribucion-resenas",
    " and organize the link per rep and the match with the reviews that come in, without breaking a single rule.",
  ),
  paraWithLink(
    "As the volume grows, that same logic is what ",
    "Atribuya",
    "/producto",
    " automates: each rep shares their link, the customer reviews on Google completely normally and the review is attributed on its own, with no incentives, no filtering and without asking anyone for the rep's name. In our real pilot with a property developer, four reps and one listing, most of the verified reviews were attributed on their own and the rest were one click away from confirming. All within Google's policies.",
  ),

  block("h2", "Frequently asked questions"),
  block("h3", "Can I offer a discount or a gift in exchange for a review?"),
  block("normal", "No. Google's policies prohibit offering incentives in exchange for reviews and treat it as fake engagement, with the risk of reviews being removed or the listing penalized."),
  block("h3", "Can I send the invitation only to customers I know are happy?"),
  block("normal", "No. Filtering so only satisfied customers review you (review gating) is prohibited. The invitation must be the same for every customer, without selecting by the expected rating."),
  block("h3", "Can I ask the customer to mention my sales rep in the review?"),
  block("normal", "It is not advisable. It forces the content of the review and leaves fragile data that breaks the moment the customer gets it wrong or omits it. Better to attribute the review through the process, without asking the customer for anything."),
  block("h3", "What happens if I break the policies by accident?"),
  block("normal", "Google can remove individual reviews, strip several at once or penalize the visibility of your Business Profile. That is why it is worth building the process well from the start."),
  block("h3", "Can I ask for reviews over WhatsApp or email?"),
  block("normal", "Yes, as long as it is a neutral invitation, with no incentive and sent to everyone equally. With the customer's prior permission for the channel, it is a legitimate practice."),

  block("h2", "In summary"),
  block(
    "normal",
    "Asking for Google reviews is allowed and it is a great idea. What you cannot do is buy them with incentives, filter to hide the negative ones, fabricate them or force their content by asking customers to mention your rep. All of that risks your listing. The legitimate practices, asking at the right moment, with a frictionless link, to everyone equally, work better and are sustainable. And to know who brought each review you do not need to break any rule: it is enough to attribute by the process, not by the text.",
  ),
  paraWithLink(
    "Want to get reviews and know which sales rep earned them, without breaking a single Google policy? ",
    "Book a demo of Atribuya",
    "/en/demo",
    " and we will show you with your own listing.",
  ),
];

// --- Documents ---------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.compliance-google-policies";
const postId = "post.pedir-resenas-google-sin-infringir-politicas-en";
const esCoverAssetRef = "image-f7c6669eeb20bfeeb29ee35d235633f9bcde229c-2880x1800-png";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Compliance & Google policies",
  slug: { _type: "slug", current: "compliance-google-policies" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "en",
  title: "How to ask for Google reviews without breaking the rules",
  slug: { _type: "slug", current: "ask-for-google-reviews-without-breaking-policies" },
  excerpt:
    "What is prohibited when asking for Google reviews, what you can do, and how to get them without risking Google removing them or penalizing your listing.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "How to ask for Google reviews without breaking the rules",
  seoDescription:
    "What Google prohibits when asking for reviews (incentives, filtering negatives, mentioning the rep) and how to get them legitimately without risking your listing.",
  mainImage: {
    _type: "image",
    asset: { _type: "reference", _ref: esCoverAssetRef },
    alt: "Personal link and QR code to ask for a Google review the right way, with no incentives and no sales-rep mention",
  },
};

async function run() {
  console.log(`Sanity: project ${projectId} / dataset ${dataset}`);

  const author = await client.getDocument(authorId).catch(() => null);
  if (!author) {
    console.error(`Author ${authorId} not found. Run scripts/seed-post.mjs first.`);
    process.exit(1);
  }
  console.log(`  ✓ existing author "${author.name}"`);

  await client.createOrReplace(category);
  console.log(`  ✓ category "${category.title}"`);

  const existing = await client.getDocument(postId).catch(() => null);
  const publishedAt = existing?.publishedAt ?? new Date().toISOString();

  if (existing && !force) {
    console.log("  • existing post: left untouched (use --force to rewrite the body).");
  } else {
    await client.createOrReplace({ ...post, publishedAt, body });
    console.log(`  ✓ article "${post.title}" (publishedAt ${publishedAt})`);
  }
  console.log(`\nURL: https://atribuya.com/en/blog/${post.slug.current}`);
  console.log("Visible after ISR revalidation (max 600s) or on redeploy.");
  console.log("Remember: link the ES↔EN pair in scripts/link-post-translations.mjs.");
}

run().catch((err) => {
  console.error("\nError:", err.message ?? err);
  process.exit(1);
});
