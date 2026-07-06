// Versión EN de "Cómo conseguir reseñas de Google con tu equipo comercial".
// Espejo de scripts/seed-post-conseguir-resenas.mjs con contenido en inglés,
// language: "en", slug y categoría propios. Reutiliza el MISMO autor y la MISMA
// portada que la versión ES (lee el mainImage del post ES → no vuelve a subir
// imágenes ni pisa las ilustraciones nuevas puestas desde el Studio).
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-conseguir-resenas-en.mjs          # crea si no existe
//   node scripts/seed-post-conseguir-resenas-en.mjs --force  # reescribe el cuerpo
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
  _type: "block", _key: key(), style, markDefs: [],
  children: Array.isArray(children) ? children : [span(children)],
});
const li = (children) => ({
  _type: "block", _key: key(), style: "normal", listItem: "bullet", level: 1, markDefs: [],
  children: Array.isArray(children) ? children : [span(children)],
});
const paraWithLink = (before, linkText, href, after) => {
  const linkKey = key();
  return {
    _type: "block", _key: key(), style: "normal",
    markDefs: [{ _type: "link", _key: linkKey, href }],
    children: [span(before), span(linkText, [linkKey]), span(after)],
  };
};

// --- Cuerpo (EN) -------------------------------------------------------------
const body = [
  block("normal", [
    span("In short: ", ["strong"]),
    span(
      "your sales team is your best channel for getting Google reviews, because they talk to the customer at the exact moment they're happy. The trick is to ask right then, with a direct, frictionless link, respect Google's policies and, above all, know afterwards which rep brought each review. That last step is the one almost nobody takes, and it's what turns reviews into a tool for leading your team.",
    ),
  ]),

  block("h2", "Why Google reviews matter more than ever"),
  paraWithLink(
    "When someone looks for a property developer, a clinic or a holiday rental, they check the stars before the website. It's not just an impression: according to BrightLocal's 2026 Local Consumer Review Survey, 97% of consumers read reviews of local businesses and 45% left a Google review in the past year ",
    "(BrightLocal)",
    "https://www.brightlocal.com/research/local-consumer-review-survey/",
    ". For most of your potential customers, reviews are the first filter before they get in touch.",
  ),
  block(
    "normal",
    "A listing with recent reviews and a good score climbs in Google Maps and in the local pack. More visibility means more calls, more visits to the show flat and more enquiries. For a business with a sales team this multiplies, because every rep who closes a visit on a good note has the ideal person to leave a review right in front of them.",
  ),

  block("h2", "When and how to ask for Google reviews without being pushy"),
  block(
    "normal",
    "The best moment to ask for a review is the peak of satisfaction: right after a visit that went well, when closing a service or when the customer thanks you in person. Wait a week and the momentum cools off.",
  ),
  block("normal", "The second factor is friction. The fewer steps, the more reviews. These are the channels that work best for a sales team:"),
  li([span("A direct link or QR code ", ["strong"]), span("that takes the customer to the write-a-review screen on your Google Business Profile (formerly Google My Business), without hunting for the listing by hand.")]),
  li([span("A follow-up email ", ["strong"]), span("between 24 and 72 hours after the service, short and without a sales tone.")]),
  li([span("WhatsApp or SMS, ", ["strong"]), span("with prior permission, in businesses where that conversation with the customer already happens.")]),
  block(
    "normal",
    "The operational key: give each rep their own personalized link. That way asking for the review becomes a natural part of their close, not an extra task that gets forgotten.",
  ),

  block("h2", "What Google prohibits when asking for reviews"),
  paraWithLink(
    "This is where many businesses get into trouble without realizing. Google Business Profile's ",
    "review policies",
    "https://support.google.com/business/answer/3474122",
    " are explicit about incentives: offering free or discounted products or services to customers in exchange for posting, changing or removing negative reviews counts as fake engagement and is strictly prohibited.",
  ),
  block("normal", "In practice, this rules out three things worth being clear about:"),
  li([span("Offering incentives ", ["strong"]), span("for reviews: discounts, gifts or prize draws.")]),
  li([span("Asking the customer to mention the rep by name ", ["strong"]), span("in the text. On top of forcing the review, it leaves you with fragile data.")]),
  li([span("Filtering ", ["strong"]), span("so only happy customers review, or asking for negative ones to be taken down.")]),
  block(
    "normal",
    "The good news: you don't need any of those practices. You can get legitimate reviews and still know who brought them, without asking the customer to write anyone's name.",
  ),

  block("h2", "The step almost nobody takes: knowing which rep brought each review"),
  block(
    "normal",
    "Imagine your team does its homework and reviews start coming in. Now answer this: which one did your first rep bring, and which one the second?",
  ),
  block(
    "normal",
    "The usual answer is an afternoon cross-referencing visit dates with review dates in a spreadsheet, guessing by the customer's name. It's slow, it's imprecise and it ends in arguments over whose bonus it is. The review becomes a source of conflict instead of recognition.",
  ),
  block(
    "normal",
    "Yet that's the most useful data you can have about your sales team. It tells you who builds real trust, not who talks loudest in the meeting. With it you split incentives with criteria, recognize who contributes and spot who needs support. What isn't measured can't be managed.",
  ),

  block("h2", "How to do it without a spreadsheet"),
  block(
    "normal",
    "The manual method works until you have more than a handful of reviews a month. Beyond that you need a system that attributes each review to its rep automatically, without asking anything strange of the customer.",
  ),
  paraWithLink(
    "That same logic is what ",
    "Atribuya",
    "/en/product",
    " automates: each rep shares their personal link, the customer leaves the review on Google as usual, and the review is attributed on its own. Most resolve automatically and the rest are one click away from confirming. No spreadsheet, and without asking the customer for the salesperson's name.",
  ),

  block("h2", "Frequently asked questions"),
  block("h3", "How do I get my customers to leave a Google review?"),
  block("normal", "Ask at the moment of peak satisfaction, with a direct link or a QR code that opens the review screen. The fewer steps, the more reviews."),
  block("h3", "Can I offer a discount in exchange for a review?"),
  block("normal", "No. Google's policies prohibit offering incentives in exchange for reviews and treat it as fake engagement, with the risk of reviews being removed or penalized."),
  block("h3", "Can I ask the customer to mention my rep in the review?"),
  block("normal", "It's neither advisable nor reliable. It forces the review and leaves fragile data. It's better to attribute the review by other means, without asking the customer."),
  block("h3", "How do I know which rep earned each review?"),
  block("normal", "With a personal link per rep and a system that cross-references each new review with the rep who originated it. That's exactly what Atribuya automates, without a spreadsheet."),

  block("h2", "In short"),
  block(
    "normal",
    "Your sales team is your best review engine if you give them the right moment and the right tool: ask at the peak of satisfaction, with a frictionless link, always respecting Google's policies. The step almost nobody takes is closing the loop and knowing who brings each review. That's where reviews stop being marketing and become a way to lead your team better.",
  ),
  paraWithLink(
    "Want to see who on your team generates business, without building a spreadsheet? ",
    "Book a demo of Atribuya",
    "/en/demo",
    " and we'll show you with your own listing.",
  ),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.getting-google-reviews-en";
const postId = "post.conseguir-resenas-google-equipo-comercial-en";
const esPostId = "post.conseguir-resenas-google-equipo-comercial-es";

const category = {
  _id: categoryId, _type: "category",
  title: "Getting Google reviews",
  slug: { _type: "slug", current: "getting-google-reviews" },
};

const post = {
  _id: postId, _type: "post", language: "en",
  title: "How to get Google reviews with your sales team",
  slug: { _type: "slug", current: "get-google-reviews-with-your-sales-team" },
  excerpt:
    "How to get more Google reviews through your sales team, ask at the right moment without being pushy or breaking the policies, and know who brought each one.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Get Google reviews with your sales team",
  seoDescription:
    "Guide to getting more Google reviews through your sales team, asking without breaking the policies and knowing which rep brought each one.",
};

// Reutiliza la portada del post ES (ilustración nueva del Studio). No sube nada.
async function reuseEsCover() {
  const es = await client.getDocument(esPostId).catch(() => null);
  if (!es?.mainImage?.asset?._ref) {
    throw new Error(`No pude leer la portada del post ES ${esPostId}. ¿Existe y tiene mainImage?`);
  }
  return {
    _type: "image",
    asset: { _type: "reference", _ref: es.mainImage.asset._ref },
    alt: "Personal link and QR code for a sales rep so the customer leaves a Google review, in the Atribuya dashboard",
  };
}

async function run() {
  console.log(`Sanity: proyecto ${projectId} / dataset ${dataset}`);
  const author = await client.getDocument(authorId).catch(() => null);
  if (!author) { console.error(`No existe el autor ${authorId}. Ejecuta antes scripts/seed-post.mjs.`); process.exit(1); }
  console.log(`  ✓ autor existente "${author.name}"`);

  await client.createOrReplace(category);
  console.log(`  ✓ categoría "${category.title}"`);

  const cover = await reuseEsCover();
  console.log(`  ✓ portada reutilizada del post ES (${cover.asset._ref})`);

  const existing = await client.getDocument(postId).catch(() => null);
  const publishedAt = existing?.publishedAt ?? new Date().toISOString();

  if (existing && !force) {
    await client.patch(postId).set({ mainImage: cover }).commit();
    console.log("  • post existente: actualizada la portada (usa --force para reescribir el cuerpo).");
  } else {
    await client.createOrReplace({ ...post, publishedAt, body, mainImage: cover });
    console.log(`  ✓ artículo "${post.title}" (publishedAt ${publishedAt})`);
  }
  console.log(`\nURL: https://atribuya.com/en/blog/${post.slug.current}`);
}

run().catch((err) => { console.error("\nError:", err.message ?? err); process.exit(1); });
