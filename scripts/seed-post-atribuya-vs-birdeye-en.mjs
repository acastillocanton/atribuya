// Publishes the English mirror of "Atribuya vs Birdeye vs Excel: qué resuelve
// cada uno" → "Atribuya vs Birdeye vs Excel: what each one solves" (Promo pillar,
// comparison). Reuses the existing author (author.castillo-canton), creates the
// EN category "Comparisons" and reuses the ES cover asset without re-uploading.
//
// Requires in .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Usage:
//   node scripts/seed-post-atribuya-vs-birdeye-en.mjs          # create if missing
//   node scripts/seed-post-atribuya-vs-birdeye-en.mjs --force  # rewrite body
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

// --- Body --------------------------------------------------------------------
const body = [
  para([
    { text: "In short: ", marks: ["strong"] },
    { text: "these are not three ways of doing the same thing. Excel is the manual starting point for matching reviews by hand. Birdeye is a generalist reputation suite built to manage reviews at scale (request them, monitor them, respond to them, listings, surveys). Atribuya is a specialist that does one thing the other two do not: attribute each Google review to the sales rep who earned it, automatically and without asking the customer for anything odd. If what you want is to know which rep brings each review, Excel does not scale and Birdeye is not built for it. Atribuya is, and it sits happily alongside a suite if you already use one." },
  ]),

  block("h2", "The three solve different problems"),
  block("normal", "The question «Atribuya, Birdeye or Excel?» is poorly framed, because it assumes they compete for the same job. They do not. Before comparing prices or features it helps to be clear about which problem each one solves:"),
  li([{ text: "Excel ", marks: ["strong"] }, { text: "solves the problem of " }, { text: "starting to organize the data", marks: ["em"] }, { text: " without spending a cent." }]),
  li([{ text: "Birdeye ", marks: ["strong"] }, { text: "solves the problem of " }, { text: "managing your reputation at scale", marks: ["em"] }, { text: ": getting more reviews, watching them and responding to them across many locations." }]),
  li([{ text: "Atribuya ", marks: ["strong"] }, { text: "solves a very specific problem the other two leave out: " }, { text: "knowing which sales rep earned each review", marks: ["em"] }, { text: " and motivating the team with that data." }]),
  block("normal", "With that in mind, the comparison stops being «which is best» and becomes «which do I need for what I want to achieve»."),

  block("h2", "Excel: the manual starting point"),
  para([
    { text: "Almost everyone starts here, and rightly so. A spreadsheet is free, flexible and requires no sign-up. For a team of one or two reps with few reviews a month, a well-built Excel can be enough for a while. In fact, if you are at that point, we have a " },
    { text: "review attribution template", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " ready to download." },
  ]),
  block("normal", "Its limits show up as soon as the volume grows:"),
  li([{ text: "It is 100% manual. ", marks: ["strong"] }, { text: "Someone has to check the new reviews on Google, work out who brought them and note it down by hand. Every week, without fail." }]),
  li([{ text: "It breaks easily. ", marks: ["strong"] }, { text: "A misspelled name, an overwritten row, a date in the wrong format, and the count stops being reliable." }]),
  li([{ text: "It warns you of nothing. ", marks: ["strong"] }, { text: "If a one or two-star review comes in, you find out when you open the sheet, not when it happens." }]),
  li([{ text: "It does not scale. ", marks: ["strong"] }, { text: "With three reps it might work. With ten and several reviews a day, matching by hand stops being viable." }]),
  block("normal", "Excel is not a bad place to start. It is a bad place to stay once the business grows."),

  block("h2", "Birdeye: the reputation suite"),
  block("normal", "Birdeye is one of the best-known reputation management platforms, and it does very well what it is designed for. It is a generalist customer experience suite built above all for multi-location brands. Its usual features include:"),
  li("Generating reviews by requesting them automatically over SMS and email."),
  li("Monitoring reviews from many sites (Google, Facebook and others) in a single dashboard."),
  li("Responding to reviews, with AI help to draft the replies."),
  li("Managing the listings or directories where the business appears."),
  li("Messaging, web chat, surveys and per-location reporting."),
  block("normal", [
    span("If your problem is managing the reputation of a network of locations at scale, it is a powerful tool and you will get value from it. That said, it helps to know what it is "),
    span("not", ["strong"]),
    span(" built for."),
  ]),
  block("normal", [
    span("Birdeye manages reviews, it does not "),
    span("attribute them to your sales team", ["strong"]),
    span(". It does offer individual-level reporting, but that level measures the user's activity within the platform, for example their response times and rates. It does not answer the question a sales director asks: «this five-star review that just came in, which rep earned it?». That attribution, matching an incoming review with the rep who originated the visit, is not its job."),
  ]),
  block("normal", "On price, Birdeye does not publish fixed rates. Its cost is quoted case by case based on the number of locations and the products contracted, usually on an annual contract. It is a model built for the volume of a multi-location brand, not for «I just want to know who sells»."),

  block("h2", "Atribuya: the attribution specialist"),
  block("normal", "Atribuya does not try to be a full reputation suite. It does one specific thing and does it well: it connects each Google review with the sales rep who earned it, without asking the customer to write anyone's name."),
  block("normal", "The mechanism is simple. Each rep shares a personal link with their customer. When the customer leaves their review on Google completely normally, Atribuya brings it in through Google's official APIs and attributes it to the rep by matching the time window and the customer's name. From there you get:"),
  li([{ text: "Each review assigned to its rep", marks: ["strong"] }, { text: ", automatically. Most resolve on their own and the rest are one click away from confirming." }]),
  li([{ text: "A ", marks: ["strong"] }, { text: "ranking by sales rep", marks: ["strong"], href: "/en/blog/sales-rep-review-ranking-without-rivalry" }, { text: " ", marks: ["strong"] }, { text: "to recognize the team and base incentives on data, not perceptions." }]),
  li([{ text: "Alerts for one and two-star reviews", marks: ["strong"] }, { text: " so you react in time, not when it is already too late." }]),
  li([{ text: "Compliance with Google's policies", marks: ["strong"] }, { text: ", because the customer is never asked to mention anyone, nor is there any filtering or incentives." }]),
  block("normal", "What Atribuya does not do is replace a reputation suite with surveys, listings across dozens of directories or omnichannel messaging. It is focused on sales attribution and the team's day-to-day operations. If you already use a suite, Atribuya sits alongside it and adds the layer it is missing."),

  block("h2", "Summary by capability"),
  block("normal", "To see it at a glance, this is what each tool covers:"),
  li([{ text: "Attributing a review to the rep who earned it: ", marks: ["strong"] }, { text: "only Atribuya. Excel does it by hand and with effort; Birdeye is not built for it." }]),
  li([{ text: "Bringing in new reviews automatically: ", marks: ["strong"] }, { text: "Birdeye and Atribuya. In Excel you copy them yourself." }]),
  li([{ text: "Ranking by sales rep: ", marks: ["strong"] }, { text: "Atribuya. In Excel, by formula and hand." }]),
  li([{ text: "Alerts for negative reviews in the moment: ", marks: ["strong"] }, { text: "Birdeye and Atribuya. Excel does not warn you." }]),
  li([{ text: "Requesting reviews (link or QR per rep): ", marks: ["strong"] }, { text: "Atribuya and Birdeye, each in its own way." }]),
  li([{ text: "Responding to reviews, listings, surveys, multichannel: ", marks: ["strong"] }, { text: "Birdeye's territory." }]),
  li([{ text: "Entry cost: ", marks: ["strong"] }, { text: "Excel is free; Atribuya has " }, { text: "public plans by number of reps", href: "/en/pricing" }, { text: "; Birdeye is quoted case by case per location, on a contract." }]),
  li([{ text: "Maintenance effort: ", marks: ["strong"] }, { text: "high in Excel, low in Atribuya and in Birdeye." }]),

  block("h2", "So which do I need?"),
  block("normal", "It depends on which problem you want to solve first:"),
  li([{ text: "If you just want to know which rep brings each review", marks: ["strong"] }, { text: " and motivate the team with that data, that is exactly what Atribuya is for. An Excel works to get going if you are very small, but you will hit its ceiling soon." }]),
  li([{ text: "If your priority is managing the reputation of many locations", marks: ["strong"] }, { text: " at scale, with responses, listings and surveys, a suite like Birdeye makes sense. And if you also want to attribute reviews to your reps, Atribuya sits alongside it and fills that gap." }]),
  li([{ text: "If you are just starting and want to spend zero", marks: ["strong"] }, { text: ", start with the Excel template and move to a tool when matching by hand starts costing you time or reliability." }]),
  block("normal", "The myth worth debunking is «Birdeye already does that». Not exactly: Birdeye manages your reputation, but it does not credit which of your team brings each review. They are different things, and that is why many companies use a suite for the former and Atribuya for the latter."),

  block("h2", "Frequently asked questions"),
  block("h3", "Does Birdeye attribute reviews to individual sales reps?"),
  block("normal", "It is not designed for that. It offers user-level reporting within the platform (response times and rates), but it does not credit which rep earned each incoming review. That attribution by time window and customer name is what Atribuya does."),
  block("h3", "Does Atribuya replace Birdeye?"),
  block("normal", "Not entirely. Atribuya is focused on attributing reviews to your sales team and on day-to-day operations. If you need a full reputation suite with surveys, listings and messaging, Atribuya sits alongside it and adds the attribution layer it is missing."),
  block("h3", "Can I keep my Excel?"),
  para([
    { text: "Yes, especially if you are small. The " },
    { text: "review attribution template", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " organizes the process for free. The problem with Excel is not that it does not work, it is that it is manual and does not scale: as soon as the volume grows, matching by hand stops being reliable." },
  ]),
  block("h3", "Which is cheaper?"),
  para([
    { text: "Excel is free but costs you time. Atribuya has " },
    { text: "public plans", href: "/en/pricing" },
    { text: " by number of reps. Birdeye is quoted case by case based on locations and products, on a contract, so its cost depends on each case. Compare the price against the problem each one solves, not just the figure." },
  ]),
  block("h3", "Do I need to give Atribuya my customer's Google access?"),
  block("normal", "No. Attribution works without touching the customer's Google account: the customer leaves their review as usual and Atribuya brings it in through Google's official APIs and matches it with the rep who originated it."),

  block("h2", "In summary"),
  block("normal", "Excel, Birdeye and Atribuya do not compete for the same job. Excel is the manual starting point, free but with a ceiling. Birdeye is a powerful suite to manage your reputation at scale. Atribuya is the specialist that attributes each Google review to the rep who earned it, something Excel does not scale to and Birdeye is not built to do. Choose by the problem you want to solve, and remember you do not have to choose only one."),
  para([
    { text: "Want to know which rep brings each review, without switching suites or asking the customer for anything odd? " },
    { text: "Book a demo of Atribuya", href: "/en/demo" },
    { text: " and we will show you with your own listing." },
  ]),
];

// --- Documents ---------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.comparisons";
const postId = "post.atribuya-vs-birdeye-vs-excel-en";
const esCoverAssetRef = "image-5afd4420bb4477afd837a12829dfa9b86b61f1dd-2880x1800-png";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Comparisons",
  slug: { _type: "slug", current: "comparisons" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "en",
  title: "Atribuya vs Birdeye vs Excel: what each one solves",
  slug: { _type: "slug", current: "atribuya-vs-birdeye-vs-excel" },
  excerpt:
    "Excel, Birdeye and Atribuya do not compete for the same job. What each one solves, where it falls short and which you need to attribute reviews to your sales team.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Atribuya vs Birdeye vs Excel: what each one solves",
  seoDescription:
    "Excel, Birdeye and Atribuya solve different problems. We compare what each one does and which you need to attribute Google reviews to your sales reps.",
  mainImage: {
    _type: "image",
    asset: { _type: "reference", _ref: esCoverAssetRef },
    alt: "Comparison of Atribuya, Birdeye and Excel to attribute Google reviews to sales reps, with Atribuya's per-rep ranking",
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
