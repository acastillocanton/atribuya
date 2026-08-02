// Publishes the English mirror of article #7 "How to respond to Google reviews
// (guide with ready-to-adapt templates)" (Pillar C, personas Marta+Laura) via
// the Sanity write API. Reuses the existing author (author.castillo-canton),
// creates the EN category "Local reputation", and reuses the ES post's cover
// asset (no re-upload).
//
// Requires in .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Usage:
//   node scripts/seed-post-responder-resenas-en.mjs          # creates if missing
//   node scripts/seed-post-responder-resenas-en.mjs --force  # rewrites body
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
const quote = (text) => block("blockquote", text);

// --- Body --------------------------------------------------------------------
const body = [
  para([
    { text: "In short: ", marks: ["strong"] },
    { text: "respond to every Google review, good and bad, fast and without sounding like a robot. You are not writing the response for the person who left the review: you are writing it for the dozens of people who will read that conversation before deciding whether to buy from you. This guide gives you the full method plus templates ready to adapt to every situation, including the hardest one: the unfair negative review. One warning up front: the template is the starting point, not the answer. Copy it word for word and readers will notice, and punish it." },
  ]),

  block("h2", "Why respond to all of them, with data"),
  para([
    { text: "BrightLocal's " },
    { text: "Local Consumer Review Survey", href: "https://www.brightlocal.com/research/local-consumer-review-survey/" },
    { text: " for 2026 settles the argument: 80% of consumers say they are likely to use a business that responds to all of its reviews, 42% say they are unlikely to use one that never replies and, mind this one, generic templated replies put off 50% of consumers. Responding only to the good ones, or only to the bad ones, does not work either: readers notice the bias." },
  ]),
  para([
    { text: "Google recommends responding and makes it easy from your " },
    { text: "Business Profile", href: "https://support.google.com/business/answer/3474050" },
    { text: ". The response appears in public, right under the review, signed by the business. That is the setting: a shop window, not a complaints inbox." },
  ]),

  block("h2", "Four principles before touching any template"),
  num([
    { text: "Write for the next customer, not for the reviewer. ", marks: ["strong"] },
    { text: "The angry customer may never come back; the person deciding tonight where to spend their money will read your whole reply. Every response to a negative review is a public demonstration of how you treat people when something goes wrong." },
  ]),
  num([
    { text: "Respond quickly. ", marks: ["strong"] },
    { text: "A reply in the first week is worth twice the same reply a month later. For one and two star reviews the deadline is measured in hours, not days; that is where an instant alert makes the difference." },
  ]),
  num([
    { text: "Be specific or you will not sound human. ", marks: ["strong"] },
    { text: "One real detail (the day, the service, what you changed since) turns a corporate reply into a credible conversation. Specificity is what separates your response from the 50% that bore readers with stock phrases." },
  ]),
  num([
    { text: "Never argue and never reveal data. ", marks: ["strong"] },
    { text: "No sarcasm, no accusations, no details of the customer's history with you. In sensitive sectors such as clinics, do not even confirm the person is a patient: thank them, answer in general terms and invite them to a private channel. Confidentiality comes before being right." },
  ]),

  block("h2", "Templates for positive reviews"),
  block("normal", "The temptation is to skip them. That is a mistake: they are half of your shop window and take a minute each. Three typical situations; replace the brackets and always add one detail of your own:"),
  block("h3", "Positive review with detail"),
  quote("Thank you so much, [name]. We are especially glad you mention [the detail they highlight], because that is exactly where the team puts most care. Hope to see you again soon."),
  block("h3", "Short positive review (the classic \"all good\")"),
  quote("Thanks for the trust, [name]. If there is anything we can do even better next time, we would love to hear it. Best from the whole [business] team."),
  block("h3", "Review that mentions a team member"),
  quote("Thank you, [name]. We will pass your comment on to [employee name], who will be delighted: recognizing good work also shows inside the team."),
  para([
    { text: "That last case, when the customer mentions on their own initiative who served them, is internal gold: it lets you recognize the employee and reinforce the service culture. What you cannot do is ask the customer to include that name, as we explain in " },
    { text: "how to ask for Google reviews without breaking the rules", href: "/en/blog/ask-for-google-reviews-without-breaking-policies" },
    { text: "." },
  ]),

  block("h2", "Templates for negative reviews"),
  block("normal", "The method in four moves: acknowledge without excuses, give the context in one sentence, say what you changed and offer a private channel to finish. Four situations:"),
  block("h3", "A fair complaint"),
  quote("You are right, [name], and we apologize. [One sentence of honest context: we were short-staffed that day / the order went out late]. Since then we have [what you changed, specifically]. We would love to tell you about it directly: write to us at [email or phone] and we will make it right."),
  block("h3", "A complaint based on a misunderstanding"),
  quote("Thanks for telling us, [name]. We believe there was a misunderstanding about [the specific point]: [one-sentence clarification, no reproachful tone]. Even so, we are sorry the experience was not a good one. If you write to us at [contact], we will gladly go over it with you."),
  block("h3", "A review from someone with no customer record"),
  quote("Thank you for the message. We cannot find any visit or order matching these details, so we would like to understand what happened. If you have been a customer of ours, please write to us at [contact] and we will look into it right away."),
  para([
    { text: "This neutral reply does two things without accusing anyone: it tells readers you keep records, and it leaves public proof that you tried to verify. If you suspect the review violates the policies, also report it through the official channel; why Google removes fewer reviews than you would expect is covered in " },
    { text: "why your Google reviews are not showing up", href: "/en/blog/google-reviews-not-showing-up" },
    { text: "." },
  ]),
  block("h3", "One star with no text"),
  quote("Hi, [name]. We can see your rating but we do not know what went wrong, and we would like to fix it. Could you write to us at [contact] and tell us? We will look into it personally."),
  para([
    { text: "These seven templates cover the essentials. If you want the full library, we have put together a ", marks: [] },
    { text: "free pack with 20 response templates in Word", href: "/recursos/plantillas-respuesta-resenas", marks: ["strong"] },
    { text: ": positive, negative, tricky cases (fake reviews, former employees, threats of formal complaints) and confidentiality-bound sectors such as clinics or advisory firms. The pack is in Spanish." },
  ]),

  block("h2", "What you must never do"),
  li([
    { text: "Offer anything in exchange for removing or softening the review. ", marks: ["strong"] },
    { text: "Google's policies prohibit it just like buying reviews. The right move is to genuinely solve the problem; if the customer then decides to update their review on their own, great, but the initiative has to be theirs." },
  ]),
  li([
    { text: "Argue the facts in public. ", marks: ["strong"] },
    { text: "Even when you are completely right. Readers do not see a business being right, they see a business on the defensive. The place for nuance is the private channel." },
  ]),
  li([
    { text: "Reveal customer information. ", marks: ["strong"] },
    { text: "No treatment dates, amounts, history or personal circumstances. Besides being ugly, it can be a data protection violation." },
  ]),
  li([
    { text: "Reply in the heat of the moment. ", marks: ["strong"] },
    { text: "Unfair reviews sting. Write the draft, let it rest for an hour and delete everything your next customer would not read with respect." },
  ]),

  block("h2", "How to organize it as a team without missing any"),
  para([
    { text: "In a business with volume, the problem is not writing: it is finding out in time and knowing who replies. Three pieces are enough. First, one clear owner per listing (a single public voice, even if several people draft). Second, instant alerts for one and two star reviews, the ones that cannot wait for the weekly check. Third, context: knowing which customer it is and who served them turns a generic reply into a specific one. That is where Atribuya helps more than it seems: because every review gets " },
    { text: "attributed to the sales rep who earned it", href: "/en/blog/attribute-google-reviews-to-sales-reps" },
    { text: ", whoever replies knows which sale it comes from, who served the customer and what happened, without asking around on three channels. Negative review alerts arrive by email as soon as they are detected." },
  ]),

  block("h2", "Frequently asked questions"),
  block("h3", "Do I have to respond to every review, including positive ones?"),
  block("normal", "Yes. BrightLocal's data shows that responding to only part of them convinces fewer readers than responding to all, and readers notice the bias. Positive ones take a minute with a thank-you and one specific detail; negative ones take more care and pay more back."),
  block("h3", "How long can I take to respond?"),
  block("normal", "The sooner the better. As a practical rule: one and two star reviews, same day; everything else, within the week. A late reply loses most of its effect on whoever is reading your listing today."),
  block("h3", "Can I ask the customer to delete or change their negative review?"),
  block("normal", "Never in exchange for anything: offering compensation for removing or improving a review violates Google's policies. The right path is solving the problem through a private channel; if the customer, once happy, decides to update the review on their own, that is legitimate and happens more often than you would think."),
  block("h3", "What do I do if the review is fake or from someone who was never a customer?"),
  block("normal", "Reply in public with the neutral template from this guide (we cannot find any record matching these details, write to us and we will look into it) and report it through the official channel citing the specific policy it violates. Do not accuse anyone in public: readers cannot verify your accusation, but they can verify your tone."),
  block("h3", "Does responding to reviews improve local rankings?"),
  block("normal", "Google recommends responding and treats review interaction as part of a well-managed profile. The direct ranking effect is not publicly quantified, so the main reason remains conversion: 80% of consumers prefer businesses that respond to everything."),

  block("h2", "The bottom line"),
  block("normal", "Responding to reviews is one of the few marketing actions that is free, public and compounding. The method fits in one sentence: respond to everything, quickly, with one specific detail and without ever arguing in public. The templates in this guide remove the blank page; the personalization is on you, because half of consumers detect and punish canned replies. To reach the ones that matter in time, the one and two star reviews, you need to know within hours: that is no longer a writing problem but a systems one."),
  para([
    { text: "If you want negative review alerts and the context of every review (which customer, which rep, which sale) running with zero manual work, " },
    { text: "book a demo of Atribuya", href: "/en/demo" },
    { text: " and we will show you with your own listing." },
  ]),
];

// --- Documents -----------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.local-reputation";
const esPostId = "post.responder-resenas-google-es";
const postId = "post.responder-resenas-google-en";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Local reputation",
  slug: { _type: "slug", current: "local-reputation" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "en",
  title: "How to respond to Google reviews: a guide with ready-to-adapt templates",
  slug: { _type: "slug", current: "respond-to-google-reviews" },
  excerpt:
    "Respond to every review, fast and without sounding like a robot: the four-principle method plus templates for every situation, from the terse positive to the unfair negative.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "How to respond to Google reviews: guide and templates",
  seoDescription:
    "A practical guide to responding to Google reviews: a four-principle method, templates for positive and negative reviews, forbidden mistakes and how to organize it as a team.",
};

async function reuseEsCover() {
  const es = await client.getDocument(esPostId).catch(() => null);
  if (!es?.mainImage?.asset?._ref) {
    throw new Error(`No pude leer la portada del post ES ${esPostId}. ¿Existe y tiene mainImage?`);
  }
  return {
    _type: "image",
    asset: { _type: "reference", _ref: es.mainImage.asset._ref },
    alt: "Atribuya dashboard with the team's Google reviews, the starting point for responding to every review in time",
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
