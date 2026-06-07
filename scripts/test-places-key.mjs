// Prueba rápida de la API key de Google Places (legacy Place Details).
// Lee GOOGLE_PLACES_API_KEY de .env.local. Uso:
//   node scripts/test-places-key.mjs [placeId]
// Si no pasas placeId, usa el de la oficina de Google en Sídney (ejemplo canónico).
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const m = envText.match(/^GOOGLE_PLACES_API_KEY=(.*)$/m);
const key = m ? m[1].trim().replace(/^"|"$/g, "") : "";
if (!key) {
  console.error("No encuentro GOOGLE_PLACES_API_KEY en .env.local");
  process.exit(1);
}

const placeId = process.argv[2] || "ChIJN1t_tDeuEmsRUsoyG83frY4";
const params = new URLSearchParams({
  place_id: placeId,
  fields: "reviews,name",
  reviews_sort: "newest",
  language: "es",
  key,
});
const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;

const res = await fetch(url);
const data = await res.json();

console.log("HTTP:", res.status);
console.log("STATUS:", data.status);
console.log("ERROR:", data.error_message ?? "(ninguno)");
const result = data.result ?? {};
console.log("NOMBRE:", result.name ?? "(sin nombre)");
const reviews = result.reviews ?? [];
console.log("RESEÑAS DEVUELTAS:", reviews.length);
for (const r of reviews.slice(0, 3)) {
  console.log(`  - ${r.author_name ?? "?"}: ${r.rating}★  "${(r.text ?? "").slice(0, 60)}…"`);
}
