// Publishes the English mirror of article #6 "Why your Google reviews are not
// showing up (and how to tell if they are being filtered)" (Pillar D, personas
// Laura+Carlos) via the Sanity write API. Reuses the existing author
// (author.castillo-canton), the EN category "Compliance & Google policies" from
// article #3, and the ES post's cover asset (no re-upload).
//
// Requires in .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Usage:
//   node scripts/seed-post-resenas-no-aparecen-en.mjs          # creates if missing
//   node scripts/seed-post-resenas-no-aparecen-en.mjs --force  # rewrites body
//
// Deterministic _id → re-running without --force never duplicates. NOTE: --force
// rewrites the cover; if the user replaced it in the Studio, restore it after.
// After publishing, link the pair in scripts/link-post-translations.mjs and run it.
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

// --- Body --------------------------------------------------------------------
const body = [
  para([
    { text: "In short: ", marks: ["strong"] },
    { text: "if your customers' reviews are not showing up on your Google listing, the most likely explanation is that Google's automated filter is holding them back or removing them. The part almost nobody knows is that Google never tells you when it happens: no email, no notification, the review simply never appears. The business assumes customers are not leaving reviews, when in fact they are leaving them and the reviews vanish. This article covers the most common causes, a six-step diagnosis to confirm whether you are being filtered and what to do to recover without putting your listing at risk." },
  ]),

  block("h2", "First, rule out the normal case: a delay"),
  para([
    { text: "Not every review you cannot see has been filtered. Every review goes through automated checks before it is published and, in some cases, that process takes a few days. Google acknowledges this in its help page about " },
    { text: "missing or delayed reviews", href: "https://support.google.com/business/answer/10313341?hl=en" },
    { text: ": delays are normal, especially on new listings, recently merged listings or when the review includes a photo or a long text." },
  ]),
  block("normal", "The practical rule: a review that has been missing for less than a week may still be under review. If two weeks go by, or if the problem repeats with several customers, it is no longer a delay. It is time to diagnose."),

  block("h2", "Google removes reviews without telling you"),
  para([
    { text: "Here is the fact that changes the conversation. According to " },
    { text: "Google's official report on protecting content on Maps", href: "https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/" },
    { text: " published in April 2026, its systems blocked or removed over 292 million policy-violating reviews during 2025. Most are removed before anyone ever sees them." },
  ]),
  block("normal", "No notice to the business accompanies that process. Nobody writes to tell you a review failed the filter or why. The result is a silent problem: the owner sees the pace of reviews drop and draws the wrong conclusions. They think customers are ungrateful, the campaign is not working or the algorithm is acting up. Meanwhile, the real cause (almost always a flaw in how reviews are requested) stays active and the damage compounds."),

  block("h2", "The six most common causes"),
  block("normal", "When legitimate reviews from real customers fail to publish, the filter is usually reacting to one of these patterns:"),
  num([
    { text: "Incentivized content. ", marks: ["strong"] },
    { text: "Discounts, gifts, raffles or anything offered in exchange for the review. " },
    { text: "Google's content policies", href: "https://support.google.com/contributionpolicy/answer/7400114" },
    { text: " treat this as fake engagement and it is among the first things the systems learn to detect." },
  ]),
  num([
    { text: "Review gating. ", marks: ["strong"] },
    { text: "Asking customers first whether they are happy and sending only the satisfied ones to Google, diverting the rest to a private form. It is prohibited, and some reputation vendors still sell it as a service. If your agency does it on your behalf, your listing carries the risk." },
  ]),
  num([
    { text: "Bursts and artificial patterns. ", marks: ["strong"] },
    { text: "Many reviews in a very short window after months of silence, or several reviews written from the same wifi network at your premises. The classic case: the customer scans the QR code at the counter while connected to the store wifi, and their review reaches Google from the same address as the previous ten." },
  ]),
  num([
    { text: "The reviewer's profile. ", marks: ["strong"] },
    { text: "Freshly created accounts with no contribution history or prior activity are more likely to have their reviews held back. Reviews from employees or close relatives, besides being filtered, violate the policies as a conflict of interest." },
  ]),
  num([
    { text: "The review text itself. ", marks: ["strong"] },
    { text: "Links, phone numbers, off-topic content or text that reads like a template. This also includes a practice that looks harmless: asking the customer to write the name of the sales rep who served them. It goes against the policies, and we explain it in detail in " },
    { text: "how to ask for Google reviews without breaking the rules", href: "/en/blog/ask-for-google-reviews-without-breaking-policies" },
    { text: "." },
  ]),
  num([
    { text: "The state of the listing. ", marks: ["strong"] },
    { text: "Suspensions, recent major changes (name, category, address) or merges of duplicate listings can hold back new reviews for days. In this case the problem is not the review filter but the listing itself." },
  ]),

  block("h2", "A six-step diagnosis"),
  block("normal", "Before changing anything, confirm what is going on. This diagnosis takes less than an hour:"),
  num([
    { text: "Ask the customer to check their review. ", marks: ["strong"] },
    { text: "From their own Google account (Maps, Your contributions menu) the author always sees their own review. If they see it published and you cannot find it on the listing from an incognito window, the review is being held back or filtered. That is the definitive test." },
  ]),
  num([
    { text: "Count the missing ones. ", marks: ["strong"] },
    { text: "Compare how many reviews your team has requested with how many were published. If you do not keep that log, start today: our " },
    { text: "review attribution template", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " lets you record every request and cross it against what reaches the listing." },
  ]),
  num([
    { text: "Look for the time pattern. ", marks: ["strong"] },
    { text: "Did reviews stop publishing after a specific date? Cross that date with what changed: a new campaign, a QR code at the counter, an agency you hired, an incentive somebody improvised." },
  ]),
  num([
    { text: "Audit how reviews are being requested. ", marks: ["strong"] },
    { text: "Ask your team what exactly they say when requesting a review, and read the emails or messages being sent. You are looking for three things: promises in exchange for the review, pre-surveys that filter, and requests for specific content." },
  ]),
  num([
    { text: "Check the state of your listing. ", marks: ["strong"] },
    { text: "Open your Business Profile and confirm there are no suspension notices or pending verifications, and that you have not made major changes in the last few days." },
  ]),
  num([
    { text: "Contact support only at the end. ", marks: ["strong"] },
    { text: "If everything above is clean and reviews are still missing after two weeks, open a case with Business Profile support from the " },
    { text: "help center", href: "https://support.google.com/business/answer/10313341?hl=en" },
    { text: ". Have the details ready: review date, author name and a screenshot from the customer's account if you have one." },
  ]),

  block("h2", "What to do if the filter is penalizing you"),
  block("normal", "If the diagnosis points to one of the causes above, the recovery plan is simpler than it looks, although it requires patience:"),
  li([
    { text: "Stop the prohibited practice today. ", marks: ["strong"] },
    { text: "Every week the incentive or the gating stays active, the pattern gets reinforced. The first step is to stop feeding it, including when an agency does it in your name." },
  ]),
  li([
    { text: "Ask everyone, with no conditions. ", marks: ["strong"] },
    { text: "The invitation has to be the same for every customer, happy or not, with no pre-survey and nothing offered in return. That is what the policy requires and it also produces credible reviews." },
  ]),
  li([
    { text: "Ask at the right moment with a direct link. ", marks: ["strong"] },
    { text: "The request works when it arrives right after the good experience, with a link that leaves the customer one click away from writing. The customer reviews from their own phone and their own network, with their usual account: exactly the natural pattern the filter expects." },
  ]),
  li([
    { text: "Accept the natural pace. ", marks: ["strong"] },
    { text: "Reviews should arrive at the pace of your real business. If you sell ten homes a month, twenty reviews a week is not a good sign, it is a red flag." },
  ]),
  li([
    { text: "Do not push the same review twice. ", marks: ["strong"] },
    { text: "Asking the customer to delete it and write it again usually makes things worse. Reviews removed for policy violations cannot be recovered; reviews held back by mistake sometimes can, through support." },
  ]),

  block("h2", "The log that warns you in time"),
  para([
    { text: "Notice that the whole diagnosis rests on one piece of data: how many reviews were requested and how many arrived. A business without that log takes months to find out it is being filtered; a business with it finds out in the first week. That is one of the reasons Atribuya records every request: each sales rep shares their personalized link with each customer, the system logs the moment and cross-checks daily what gets published on the listing against what was requested. If an expected review never arrives, you see it. If it arrives, it gets " },
    { text: "attributed to the rep who earned it", href: "/en/blog/attribute-google-reviews-to-sales-reps" },
    { text: " by time window and customer name, without asking anyone to write anything special in the text." },
  ]),
  block("normal", "The same mechanism protects the listing: because attribution is resolved by process rather than by the review's content, the team has no reason to ask for mentions, offer incentives or touch any of the red lines that trigger the filter. Alerts for one and two star reviews complete the loop: you learn about problems in time, instead of discovering them in the quarterly report."),

  block("h2", "Frequently asked questions"),
  block("h3", "Why is my customer's review not showing on my listing?"),
  block("normal", "The three most likely explanations, in order: the review is under review (automated checks can take a few days), the spam filter held it back because of a suspicious pattern (new account, same wifi network, burst of reviews) or it violates a content policy (incentive, conflict of interest, links in the text). Ask the customer to confirm from their account that it is still published, and compare with what you see in an incognito window."),
  block("h3", "Does Google notify you when it removes a review?"),
  block("normal", "No. Google does not notify the business or the author when it holds back or removes a review. The only way to detect it is to keep your own log of requested versus published reviews and check it often."),
  block("h3", "How long does a Google review take to appear?"),
  block("normal", "Usually a few hours. It can take several days if it goes through an additional check, which is more common on new listings, after listing merges or when the review includes photos. After two weeks without appearing, treat it as filtered and diagnose."),
  block("h3", "Can removed reviews be recovered?"),
  block("normal", "It depends on the cause. If Google removed it for violating its policies, there is no recovery process. If it was lost through a technical error or during a change to the listing, Business Profile support can restore it in some cases. That is why it pays to finish the diagnosis before opening a case: if the cause is a prohibited practice, appealing gets you nowhere."),
  block("h3", "Does asking for reviews with a QR code get them filtered?"),
  block("normal", "The QR code itself is not the problem; it is a legitimate way to hand over the link. The risk is the pattern around it: if every customer reviews from the same counter connected to the store wifi, the reviews reach Google from the same network and the filter notices. Better to let the customer scan and review later from their own connection, or send the link by message so they open it wherever they want."),

  block("h2", "The bottom line"),
  block("normal", "If your Google reviews are not showing up, do not assume your customers are not leaving them: most likely they are, and the filter is holding them back. Google removes hundreds of millions of reviews a year and notifies nobody. The diagnosis starts by confirming with the customer that their review exists, continues with the log of requested versus published reviews, and almost always ends at the request process: incentives, gating or artificial patterns that somebody introduced with good intentions. The way out is asking properly (everyone, at the right moment, with a direct link) and keeping a log that warns you in the first week, not in the first quarter."),
  para([
    { text: "Want that log running with zero manual work? " },
    { text: "Book a demo of Atribuya", href: "/en/demo" },
    { text: " and we will show you how we cross-check your listing's reviews against your team's requests every day, with each review attributed to its sales rep." },
  ]),
];

// --- Documents -----------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.compliance-google-policies";
const esPostId = "post.resenas-google-no-aparecen-es";
const postId = "post.resenas-google-no-aparecen-en";

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
  title: "Why your Google reviews are not showing up (and how to tell if they are being filtered)",
  slug: { _type: "slug", current: "google-reviews-not-showing-up" },
  excerpt:
    "Google removes reviews without telling you: no email, no notification. The most common reasons your customers' reviews never appear, a six-step diagnosis and how to recover your pace.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Google reviews not showing up: causes and fixes",
  seoDescription:
    "Google removes reviews without notice. The most common reasons your Google reviews are missing, how to diagnose filtering and how to fix your request process.",
};

async function reuseEsCover() {
  const es = await client.getDocument(esPostId).catch(() => null);
  if (!es?.mainImage?.asset?._ref) {
    throw new Error(`No pude leer la portada del post ES ${esPostId}. ¿Existe y tiene mainImage?`);
  }
  return {
    _type: "image",
    asset: { _type: "reference", _ref: es.mainImage.asset._ref },
    alt: "Atribuya's verified reviews panel, the log that detects in time when Google reviews stop publishing",
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
