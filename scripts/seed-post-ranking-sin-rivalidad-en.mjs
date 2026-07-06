// Versión EN de "Ranking de reseñas por comercial sin generar rivalidad".
// Espejo de scripts/seed-post-ranking-sin-rivalidad.mjs con contenido en inglés,
// language: "en", slug y categoría propios. Reutiliza el MISMO autor y la MISMA
// portada que la versión ES (lee el mainImage del post ES → no vuelve a subir
// imágenes ni pisa las ilustraciones nuevas puestas desde el Studio).
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-ranking-sin-rivalidad-en.mjs          # crea si no existe
//   node scripts/seed-post-ranking-sin-rivalidad-en.mjs --force  # reescribe el cuerpo
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
const numbered = (children) => ({
  _type: "block", _key: key(), style: "normal", listItem: "number", level: 1, markDefs: [],
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
      "a sales rep review ranking motivates the team when it recognizes real results, and it burns them out when it's used to single out whoever is last on the list. The difference lies in what you measure (reviews that are genuinely attributed, not what each person claims they brought), in how you communicate it and in keeping recognition separate from punishment. Done well, the arguments over who deserves the credit are over.",
    ),
  ]),

  block("h2", "Why a review ranking motivates a sales team"),
  block(
    "normal",
    "Asking for reviews is one of those tasks every rep knows they should do and almost nobody does consistently. It's invisible: it doesn't show up in the CRM, it has no scoreboard and it gets lost between visits. A ranking turns it into a goal with visible progress, and that changes the team's behaviour without having to nag in every meeting.",
  ),
  block(
    "normal",
    "Public recognition weighs as much as the bonus. A good rep is motivated by seeing their name at the top and having everyone else see it too. When the scoreboard rewards earning reviews, asking for them stops being a task that gets forgotten and becomes part of the close.",
  ),
  block(
    "normal",
    "There's a direct business effect behind it: more recent reviews and a better score lift your listing in Google Maps and in the local pack. The ranking isn't an internal game, it's the engine of a reputation that brings more visits and more calls.",
  ),

  block("h2", "The mistake that turns a ranking into a battlefield"),
  block(
    "normal",
    "A badly designed ranking does more harm than none at all. These are the four mistakes that turn it into a source of tension:",
  ),
  li([span("Measuring what each person says they brought. ", ["strong"]), span("Without an objective data point, the ranking rests on each rep's word. The moment a bonus is at stake, disputes appear over who claims each review.")]),
  li([span("Showing only the podium and using the tail to shame. ", ["strong"]), span("If the ranking serves to embarrass whoever is last, 80% of the team experiences it as a threat and disengages.")]),
  li([span("Changing the rules mid-month. ", ["strong"]), span("The moment the criteria are seen as arbitrary, the ranking loses all credibility.")]),
  li([span("Comparing apples with oranges. ", ["strong"]), span("A rep with 200 visits a month isn't playing in the same league as one with 20. A good ranking takes that into account.")]),

  block("h2", "What to measure: attributed reviews, not self-reported ones"),
  block(
    "normal",
    "The heart of a fair ranking is an honest data point: the real review that appears on Google, attributed to the rep who originated it. Not what each person jots down on their sheet, nor a rough guess.",
  ),
  paraWithLink(
    "The classic mistake for getting that data is asking the customer to write the rep's name in the review. On top of forcing the review, it leaves fragile data and goes against Google's policies. There are better ways to attribute each review without asking the customer for anything, as we explain in the guide on ",
    "how to get Google reviews with your sales team",
    "/en/blog/get-google-reviews-with-your-sales-team",
    ".",
  ),
  block(
    "normal",
    "The reliable alternative is to give each rep a personal link to ask for the review and cross-reference each new review with whoever originated it. That cross-reference is what produces a figure the whole team can trust, and without trust in the data there's no ranking that holds up.",
  ),

  block("h2", "Five rules for a ranking that adds up instead of dividing"),
  numbered([span("One single, transparent criterion. ", ["strong"]), span("The whole team knows exactly how a review is counted and from when. No fine print, no last-minute exceptions.")]),
  numbered([span("Measure the result, not the noise. ", ["strong"]), span("Count the attributed, verified review, not promises or activity. What lands on Google is what counts.")]),
  numbered([span("Recognize more than one thing. ", ["strong"]), span("Beyond the number of reviews, reward the average rating, the improvement over the previous month or reviews recovered after a bad experience. That way more people win, and not always the same ones.")]),
  numbered([span("Make it visible and regular. ", ["strong"]), span("A scoreboard that updates on its own motivates. A spreadsheet that shows up the day the bonus is paid does not.")]),
  numbered([span("Separate recognition from punishment. ", ["strong"]), span("The ranking celebrates in public. Conversations about who's falling behind happen in private and with support, never on the scoreboard.")]),

  block("h2", "From ranking to fair incentives"),
  block(
    "normal",
    "When the data is reliable, the incentive is split with criteria instead of by who talks loudest in the meeting. You know who builds real trust with customers, who contributes consistently and who needs support. That's what a sales director really wants from a ranking: not a contest, but an honest picture to lead better.",
  ),

  block("h2", "How to build the ranking without fighting a spreadsheet"),
  block(
    "normal",
    "Keeping the ranking by hand works until the volume grows. Beyond a few reviews a month, it turns into a chore of cross-referencing dates and guessing by the customer's name, exactly the kind of work that creates the disputes you wanted to avoid.",
  ),
  paraWithLink(
    "At that scale, the ranking's logic gets automated. With ",
    "Atribuya",
    "/en/product",
    ", each rep shares their personal link, the customer leaves the review on Google as usual and the review is attributed on its own. Most resolve automatically and the rest are one click away from confirming. The ranking updates live, with a figure the team trusts, no spreadsheet and without asking the customer for the salesperson's name.",
  ),

  block("h2", "Frequently asked questions"),
  block("h3", "Doesn't a sales rep ranking create a bad atmosphere?"),
  block("normal", "It depends on how it's used. If it serves to recognize and split incentives well, it motivates. If it's used to single out whoever is last, it burns the team out. The key is to celebrate in public and have the hard conversations in private."),
  block("h3", "What should I measure in the review ranking?"),
  block("normal", "The real Google review attributed to the rep who originated it, not what each person reports. Add the average rating and the improvement over the previous month so recognition doesn't rest on volume alone."),
  block("h3", "How do I stop the numbers being gamed?"),
  block("normal", "By basing the ranking on the verified reviews that land on Google and attributing them by an objective method, not by what each rep writes down. If the data is auditable, there's no figure to inflate."),
  block("h3", "How often should I update the ranking?"),
  block("normal", "The more visible and frequent, the better. A scoreboard that updates in real time keeps the goal present. If you keep it by hand, review it at least weekly so it doesn't go cold."),

  block("h2", "In short"),
  block(
    "normal",
    "A sales rep review ranking is one of the best levers to motivate your team, as long as it rests on an honest data point and is used to recognize, not to punish. Measure genuinely attributed reviews, make it transparent and visible, and keep the scoreboard apart from the hard conversations. That way you stop arguing over credit and start leading with data.",
  ),
  paraWithLink(
    "Want to see your team's ranking update on its own, without building a spreadsheet? ",
    "Book a demo of Atribuya",
    "/en/demo",
    " and we'll show you with your own listing.",
  ),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.sales-team-en";
const postId = "post.ranking-resenas-comercial-sin-rivalidad-en";
const esPostId = "post.ranking-resenas-comercial-sin-rivalidad-es";

const category = {
  _id: categoryId, _type: "category",
  title: "Sales team",
  slug: { _type: "slug", current: "sales-team" },
};

const post = {
  _id: postId, _type: "post", language: "en",
  title: "A sales rep review ranking without the rivalry",
  slug: { _type: "slug", current: "sales-rep-review-ranking-without-rivalry" },
  excerpt:
    "How to build a sales rep review ranking that motivates the team instead of dividing it: what to measure, five rules and the mistake that turns it into a battlefield.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "A sales rep review ranking without the rivalry",
  seoDescription:
    "Guide to building a sales rep review ranking that motivates the team: what to measure, five rules to make it add up and how to do it without a spreadsheet.",
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
    alt: "Sales rep ranking by reviews earned in the Atribuya dashboard",
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
