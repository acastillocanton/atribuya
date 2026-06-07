// Busca un negocio por texto y muestra sus reseñas más recientes.
// Uso: node scripts/find-place.mjs "Telepizza Benicàssim"
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const key = (envText.match(/^GOOGLE_PLACES_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^"|"$/g, "");
if (!key) { console.error("Falta GOOGLE_PLACES_API_KEY"); process.exit(1); }

const query = process.argv[2] || "Telepizza Benicàssim";

// 1) Resolver place_id por texto
const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?` + new URLSearchParams({
  input: query,
  inputtype: "textquery",
  fields: "place_id,name,formatted_address",
  language: "es",
  key,
});
const find = await (await fetch(findUrl)).json();
console.log("BÚSQUEDA:", query);
console.log("STATUS búsqueda:", find.status, find.error_message ?? "");
const cand = find.candidates?.[0];
if (!cand) { console.log("Sin candidatos."); process.exit(0); }
console.log("ENCONTRADO:", cand.name, "—", cand.formatted_address);
console.log("PLACE_ID:", cand.place_id);
console.log("");

// 2) Reseñas más recientes
const detUrl = `https://maps.googleapis.com/maps/api/place/details/json?` + new URLSearchParams({
  place_id: cand.place_id,
  fields: "reviews,rating,user_ratings_total,name",
  reviews_sort: "newest",
  language: "es",
  key,
});
const det = await (await fetch(detUrl)).json();
const r = det.result ?? {};
console.log("VALORACIÓN GLOBAL:", r.rating ?? "?", "★  (" + (r.user_ratings_total ?? 0) + " reseñas totales)");
const reviews = r.reviews ?? [];
console.log("RESEÑAS DEVUELTAS (top 5 recientes):", reviews.length);
console.log("");
for (const x of reviews) {
  const fecha = new Date(x.time * 1000).toLocaleDateString("es-ES");
  console.log(`  ${x.rating}★  ${x.author_name}  (${fecha}, ${x.relative_time_description})`);
  if (x.text) console.log(`      "${x.text.slice(0, 120)}${x.text.length > 120 ? "…" : ""}"`);
}
