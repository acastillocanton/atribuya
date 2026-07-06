// Enlaza cada par de posts ES/EN mediante el campo `translationSlug`, que el
// sitio usa para emitir las anotaciones hreflang en la metadata de cada post.
// Es un PATCH (no createOrReplace): no toca el resto del documento, así que es
// seguro relanzarlo y no pisa portadas ni cuerpo. Idempotente.
//
// Ejecutar tras publicar/traducir un artículo, o después de un seed con --force
// (createOrReplace borra translationSlug; este script lo repone).
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
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

const client = createClient({ projectId, dataset, apiVersion: "2026-07-01", token, useCdn: false });

// Pares ES ↔ EN por _id. Añadir aquí cada nuevo par al traducir un artículo.
const PAIRS = [
  {
    es: { id: "post.atribuir-resenas-google-comerciales-es", slug: "atribuir-resenas-google-comerciales" },
    en: { id: "post.atribuir-resenas-google-comerciales-en", slug: "attribute-google-reviews-to-sales-reps" },
  },
  {
    es: { id: "post.conseguir-resenas-google-equipo-comercial-es", slug: "conseguir-resenas-google-equipo-comercial" },
    en: { id: "post.conseguir-resenas-google-equipo-comercial-en", slug: "get-google-reviews-with-your-sales-team" },
  },
  {
    es: { id: "post.ranking-resenas-comercial-sin-rivalidad-es", slug: "ranking-resenas-comercial-sin-rivalidad" },
    en: { id: "post.ranking-resenas-comercial-sin-rivalidad-en", slug: "sales-rep-review-ranking-without-rivalry" },
  },
];

async function run() {
  console.log(`Sanity: proyecto ${projectId} / dataset ${dataset}`);
  for (const { es, en } of PAIRS) {
    const [esDoc, enDoc] = await Promise.all([
      client.getDocument(es.id).catch(() => null),
      client.getDocument(en.id).catch(() => null),
    ]);
    if (!esDoc || !enDoc) {
      console.log(`  ⚠ par incompleto (${es.slug} ↔ ${en.slug}): ES=${!!esDoc} EN=${!!enDoc}. Se omite.`);
      continue;
    }
    // ES apunta al slug EN; EN apunta al slug ES.
    await client.patch(es.id).set({ translationSlug: en.slug }).commit();
    await client.patch(en.id).set({ translationSlug: es.slug }).commit();
    console.log(`  ✓ ${es.slug}  ⇄  ${en.slug}`);
  }
  console.log("\nListo. Redeploy para regenerar la metadata (hreflang) de los posts.");
}

run().catch((err) => { console.error("\nError:", err.message ?? err); process.exit(1); });
