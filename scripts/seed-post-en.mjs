// Crea (o actualiza) la versión EN del primer artículo del blog vía API de
// escritura de Sanity. Espejo de scripts/seed-post.mjs con contenido en inglés,
// language: "en", slug y categoría propios. Reutiliza el mismo autor (compartido
// entre idiomas; debe existir ya, lo crea scripts/seed-post.mjs) y las mismas
// imágenes (portada + captura de la política de Google).
//
// Requiere en .env.local:
//   NEXT_PUBLIC_SANITY_PROJECT_ID=afup27st
//   NEXT_PUBLIC_SANITY_DATASET=production
//   SANITY_API_WRITE_TOKEN=<token con permisos de Editor>
//
// Uso:
//   node scripts/seed-post-en.mjs            # crea categoría EN y el post si no existen
//   node scripts/seed-post-en.mjs --force    # sobrescribe el cuerpo del post
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

// --- Config desde .env.local -------------------------------------------------
const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const readEnv = (name) =>
  (envText.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^"|"$/g, "");

const projectId = readEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
const dataset = readEnv("NEXT_PUBLIC_SANITY_DATASET") || "production";
const token = readEnv("SANITY_API_WRITE_TOKEN") || process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) { console.error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID en .env.local"); process.exit(1); }
if (!token) { console.error("Falta SANITY_API_WRITE_TOKEN (token de Editor de sanity.io/manage)"); process.exit(1); }

const force = process.argv.includes("--force");

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-07-01",
  token,
  useCdn: false,
});

// --- Helpers de Portable Text ------------------------------------------------
let _k = 0;
const key = () => "b" + (_k++).toString(36).padStart(3, "0");
const span = (text, marks = []) => ({ _type: "span", _key: key(), text, marks });
const block = (style, children, markDefs = []) => ({
  _type: "block",
  _key: key(),
  style,
  markDefs,
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
// Párrafo con un enlace en medio: (textoAntes, textoEnlace, href, textoDespues)
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
// Imagen inline en el cuerpo. `alt` es obligatorio en el esquema y el renderer
// lo usa además como pie de foto visible.
const img = (ref, alt) => ({
  _type: "image",
  _key: key(),
  asset: { _type: "reference", _ref: ref },
  alt,
});

// --- Cuerpo del artículo (EN) ------------------------------------------------
const buildBody = (policyImg) => [
  block(
    "normal",
    "If you run a business with a sales team, the scene will sound familiar. A customer leaves five stars on Google, the team celebrates it in the group chat and, two days later, nobody knows for sure which rep served that person. The review adds to the brand's reputation, but it's lost as recognition for whoever actually earned it.",
  ),
  block(
    "normal",
    "Attributing each review to the right rep sounds like a minor detail. It's actually what separates a mailbox of anonymous ratings from a system that motivates the team, splits commissions fairly and tells you which reps generate happy customers. The problem is that doing it by hand doesn't scale.",
  ),

  block("h2", "The hidden cost of attributing reviews by hand"),
  block(
    "normal",
    "Most companies that work on their online reputation end up with the same improvised solution: a spreadsheet where someone notes down, from memory or by asking in the internal chat, which rep they think served each customer who left a review. It works with five reviews a month. It breaks at fifty.",
  ),
  block("normal", "The manual method drags three problems that get worse as the business grows:"),
  li([span("It wastes time. ", ["strong"]), span("Each review calls for a bit of detective work: checking dates, cross-referencing the rep's calendar, asking around. Multiply that by the whole team.")]),
  li([span("Bias creeps in. ", ["strong"]), span("Without an objective data point, doubtful attributions tend to get shared out by affinity or by whoever complains most, not by who actually served the customer.")]),
  li([span("It can't be audited. ", ["strong"]), span("When a commission depends on a review, any rep has the right to ask why it was assigned to someone else. A spreadsheet doesn't answer that question.")]),

  block("h2", "Asking for the rep's name in the review goes against Google's policies"),
  block(
    "normal",
    "The temptation is obvious: ask the customer to write the rep's name in the text of the review. In practice, almost nobody does it. The customer wants to leave their opinion quickly, not fill out a form, and forcing it costs you reviews right where you need them most.",
  ),
  block(
    "normal",
    "There's a bigger problem than customer convenience. Google Maps' user-generated content policies expressly prohibit a business from asking its staff to solicit reviews with specific content, and they explicitly mention content that identifies a staff member. Asking the customer to name the rep isn't just impractical: it's a practice Google flags as not allowed, and reviews that break its policies are exposed to being removed.",
  ),
  policyImg,
  block(
    "normal",
    "Google does allow inviting the customer to leave an honest review about their real experience. What it doesn't allow is steering what they write. The way out isn't to ask the customer for anything extra, nor to put your business listing at risk. The way out is to not depend on what they write: attribute the review behind the scenes, without touching its content.",
  ),

  block("h2", "How to attribute every review without asking the customer"),
  block(
    "normal",
    "Automatic attribution rests on two pieces that work together. The first identifies where the customer comes from before they review. The second closes the loop when the review appears on Google.",
  ),

  block("h3", "1. A personalized link per rep and per customer"),
  paraWithLink(
    "Each rep shares a link of their own with the customer that leads straight to the write-a-review screen on Google. That link records who generated it and for which customer, without the person noticing anything different from a normal Google link. It's exactly the flow we've designed in ",
    "the product",
    "/en/product",
    ": the customer lands on Google in one click, the rep is recorded behind the scenes.",
  ),

  block("h3", "2. Time window plus name similarity"),
  block(
    "normal",
    "When a new review arrives, the system cross-references it with the customers that rep sent their link to in the previous days and compares the public name of whoever reviewed with that of the expected customer. If they match within the time window, attribution is automatic. If there's doubt, the review goes into a queue to review in one click, instead of being assigned blindly.",
  ),
  block("blockquote", "Most reviews are attributed on their own. The ones that raise doubt aren't invented: they're flagged so a person decides, with the data in front of them."),

  block("h2", "What changes when attribution is automatic"),
  block("normal", "Solving attribution isn't an end in itself. It's what unlocks everything else:"),
  li([span("A real ranking. ", ["strong"]), span("The team sees who generates more and better-rated reviews, with a figure nobody disputes.")]),
  li([span("Fair commissions. ", ["strong"]), span("If you reward reviews, the split now rests on an auditable trail, not on anyone's memory.")]),
  li([span("Reputation alerts. ", ["strong"]), span("A one or two star rating is detected right away and reaches whoever should react, not two weeks late.")]),
  li([span("Less admin work. ", ["strong"]), span("The time that went into cross-referencing dates in a spreadsheet is recovered in full.")]),

  block("h2", "Start with a test on your own team"),
  paraWithLink(
    "Attributing reviews to sales reps stops being manual work the moment you have the two pieces in place. If you want to see it with your own case, ",
    "book a demo",
    "/en/demo",
    " and we'll show you how it would look with your team's structure and your Google listings.",
  ),
];

// --- Documentos --------------------------------------------------------------
// Autor compartido entre idiomas (lo crea scripts/seed-post.mjs). Aquí solo se
// referencia; su listado de artículos se filtra por idioma en la query.
const authorId = "author.castillo-canton";
const categoryId = "category.review-attribution-en";
const postId = "post.atribuir-resenas-google-comerciales-en";

// Portada: mismo asset local que la versión ES.
async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/ranking.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "ranking.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Sales rep ranking by reviews earned in the Atribuya dashboard",
  };
}

// Captura del centro de ayuda de políticas de Google Maps. Content-addressed →
// comparte asset con la versión ES, no duplica.
const POLICY_IMG_URL =
  "https://images.seroundtable.com/google-review-policy-update-1776345477.png";
async function uploadPolicyImage() {
  const res = await fetch(POLICY_IMG_URL);
  if (!res.ok)
    throw new Error(`No se pudo descargar la imagen de la política (HTTP ${res.status}).`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, {
    filename: "google-review-policy.png",
  });
  return asset._id;
}

const category = {
  _id: categoryId,
  _type: "category",
  title: "Review attribution",
  slug: { _type: "slug", current: "review-attribution" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "en",
  title: "How to know which sales rep earned each Google review",
  slug: { _type: "slug", current: "attribute-google-reviews-to-sales-reps" },
  excerpt:
    "Businesses with a sales team lose track of who earns each Google review. Here's how to attribute every rating to the right rep, without asking the customer.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  publishedAt: "2026-07-04T09:00:00.000Z",
  seoTitle: "Attribute Google reviews to each sales rep",
  seoDescription:
    "How to know which rep earned each Google review without asking the customer for a name: personalized link, time window and name similarity.",
};

// --- Ejecución ---------------------------------------------------------------
async function run() {
  console.log(`Sanity: proyecto ${projectId} / dataset ${dataset}`);

  const authorExists = await client.getDocument(authorId).catch(() => null);
  if (!authorExists) {
    console.error(`Falta el autor "${authorId}". Ejecuta antes: node scripts/seed-post.mjs`);
    process.exit(1);
  }

  await client.createOrReplace(category);
  console.log(`  ✓ categoría "${category.title}"`);

  const cover = await uploadCover();
  console.log(`  ✓ portada subida (${cover.asset._ref})`);

  const policyRef = await uploadPolicyImage();
  console.log(`  ✓ imagen de la política de Google subida (${policyRef})`);
  const policyImg = img(
    policyRef,
    "Google Maps content policies: among the things a business is not allowed to do is asking its staff to solicit reviews with content that identifies a staff member.",
  );
  const body = buildBody(policyImg);

  const existing = await client.getDocument(postId).catch(() => null);
  if (existing && !force) {
    await client.patch(postId).set({ mainImage: cover }).commit();
    console.log(`  • post existente: actualizada la portada (usa --force para reescribir el cuerpo).`);
  } else {
    await client.createOrReplace({ ...post, body, mainImage: cover });
    console.log(`  ✓ artículo "${post.title}"`);
  }
  console.log(`\nURL: https://atribuya.com/en/blog/${post.slug.current}`);
  console.log("Visible tras la revalidación ISR (máx. 600s) o al redeploy.");
}

run().catch((err) => {
  console.error("\nError:", err.message ?? err);
  if (String(err.message).includes("Insufficient permissions") || String(err.message).includes("Unauthorized")) {
    console.error("Revisa que SANITY_API_WRITE_TOKEN tenga permisos de Editor.");
  }
  process.exit(1);
});
