// Publica el artículo "Ranking de reseñas por comercial sin generar rivalidad"
// (Pilar B — dirigir el equipo comercial) vía API de escritura de Sanity.
// Reutiliza el autor ya existente (author.castillo-canton) y crea la categoría
// "Equipo comercial".
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-ranking-sin-rivalidad.mjs          # crea si no existe
//   node scripts/seed-post-ranking-sin-rivalidad.mjs --force  # reescribe el cuerpo
//
// _id determinista → relanzar sin --force no duplica.
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
const numbered = (children) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  listItem: "number",
  level: 1,
  markDefs: [],
  children: Array.isArray(children) ? children : [span(children)],
});
// Párrafo con un enlace en medio.
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

// --- Cuerpo ------------------------------------------------------------------
const body = [
  block("normal", [
    span("En corto: ", ["strong"]),
    span(
      "un ranking de reseñas por comercial motiva al equipo cuando reconoce el resultado real, y lo quema cuando se usa para señalar al último de la lista. La diferencia está en qué mides (reseñas de verdad atribuidas, no lo que cada uno dice que trajo), en cómo lo comunicas y en separar el reconocimiento de la sanción. Bien montado, se acaban las discusiones sobre a quién le toca el mérito.",
    ),
  ]),

  block("h2", "Por qué un ranking de reseñas motiva al equipo comercial"),
  block(
    "normal",
    "Pedir reseñas es una de esas tareas que todo comercial sabe que debería hacer y casi nadie hace de forma constante. Es invisible: no aparece en el CRM, no tiene marcador y se pierde entre visitas. Un ranking la convierte en un objetivo con progreso visible, y eso cambia el comportamiento del equipo sin necesidad de insistir en cada reunión.",
  ),
  block(
    "normal",
    "El reconocimiento público pesa tanto como el bono. A un buen comercial le motiva ver su nombre arriba y que el resto lo vea. Cuando el marcador premia conseguir reseñas, pedirlas deja de ser una tarea que se olvida y pasa a ser parte natural del cierre.",
  ),
  block(
    "normal",
    "Y hay un efecto de negocio directo detrás: más reseñas recientes y mejor nota suben tu ficha en Google Maps y en el paquete local. El ranking no es un juego interno, es el motor de una reputación que trae más visitas y más llamadas.",
  ),

  block("h2", "El error que convierte un ranking en un campo de batalla"),
  block(
    "normal",
    "Un ranking mal planteado hace más daño que no tener ninguno. Estos son los cuatro fallos que lo convierten en fuente de tensión:",
  ),
  li([span("Medir lo que cada uno dice que trajo. ", ["strong"]), span("Sin un dato objetivo, el ranking se basa en la palabra de cada comercial. En cuanto hay un bono en juego, aparecen las disputas sobre quién se apunta cada reseña.")]),
  li([span("Enseñar solo el podio y usar la cola para señalar. ", ["strong"]), span("Si el ranking sirve para avergonzar al último, el 80% del equipo lo vive como una amenaza y se desengancha.")]),
  li([span("Cambiar las reglas a mitad de mes. ", ["strong"]), span("En cuanto el criterio se percibe como arbitrario, el ranking pierde toda credibilidad.")]),
  li([span("Comparar peras con manzanas. ", ["strong"]), span("Un comercial con 200 visitas al mes no juega en la misma liga que uno con 20. Un buen ranking lo tiene en cuenta.")]),

  block("h2", "Qué medir: reseñas atribuidas, no autodeclaradas"),
  block(
    "normal",
    "El corazón de un ranking justo es un dato honesto: la reseña real que aparece en Google, atribuida al comercial que la originó. No lo que cada uno anota en su hoja, ni una estimación a ojo.",
  ),
  paraWithLink(
    "El error clásico para conseguir ese dato es pedirle al cliente que escriba el nombre del comercial en la reseña. Además de forzar la reseña, deja un dato frágil y va contra las políticas de Google. Hay formas mejores de atribuir cada reseña sin pedirle nada raro al cliente, como explicamos en la guía sobre ",
    "cómo conseguir reseñas de Google con tu equipo comercial",
    "/blog/conseguir-resenas-google-equipo-comercial",
    ".",
  ),
  block(
    "normal",
    "La alternativa fiable es dar a cada comercial un enlace personal para pedir la reseña y cruzar cada reseña nueva con quién la originó. Ese cruce es lo que produce un número en el que todo el equipo puede confiar, y sin confianza en el dato no hay ranking que aguante.",
  ),

  block("h2", "Cinco reglas para un ranking que suma en vez de dividir"),
  numbered([span("Un criterio único y transparente. ", ["strong"]), span("Todo el equipo sabe exactamente cómo se cuenta una reseña y desde cuándo. Sin letra pequeña ni excepciones de última hora.")]),
  numbered([span("Mide el resultado, no el ruido. ", ["strong"]), span("Cuenta la reseña atribuida y verificada, no las promesas ni la actividad. Lo que entra en Google es lo que suma.")]),
  numbered([span("Reconoce más de una cosa. ", ["strong"]), span("Además del número de reseñas, premia la nota media, la mejora respecto al mes anterior o las reseñas recuperadas tras una mala experiencia. Así gana más gente y no siempre el mismo.")]),
  numbered([span("Hazlo visible y periódico. ", ["strong"]), span("Un marcador que se actualiza solo motiva. Un Excel que aparece el día de repartir el bono, no.")]),
  numbered([span("Separa reconocimiento de sanción. ", ["strong"]), span("El ranking celebra en público. Las conversaciones sobre quien va flojo son en privado y con apoyo, nunca en el marcador.")]),

  block("h2", "Del ranking al incentivo justo"),
  block(
    "normal",
    "Cuando el dato es fiable, el incentivo se reparte con criterio en lugar de por quién habla más alto en la reunión. Sabes quién genera confianza real con los clientes, quién aporta de forma constante y quién necesita apoyo. Eso es lo que un director comercial quiere de verdad de un ranking: no un concurso, sino una foto honesta para dirigir mejor.",
  ),
  paraWithLink(
    "Si quieres montar el sistema hoy mismo sin herramientas, te hemos preparado una plantilla que ordena el proceso: enlace por comercial, registro de visitas y cruce con las reseñas que van entrando. ",
    "Descarga gratis la plantilla de atribución de reseñas",
    "/recursos/plantilla-atribucion-resenas",
    " y tendrás la base para tu primer ranking.",
  ),

  block("h2", "Cómo montar el ranking sin pelearte con un Excel"),
  block(
    "normal",
    "La plantilla funciona hasta que el volumen crece. A partir de unas cuantas reseñas al mes, mantener el ranking a mano se vuelve una tarea de cruzar fechas y adivinar por el nombre del cliente, justo el tipo de trabajo que genera las discusiones que querías evitar.",
  ),
  paraWithLink(
    "A esa escala, la lógica del ranking se automatiza. Con ",
    "Atribuya",
    "/producto",
    ", cada comercial comparte su enlace personal, el cliente deja la reseña en Google como siempre y la reseña queda atribuida sola. La mayoría se resuelven automáticamente y el resto quedan a un clic de confirmar. El ranking se actualiza en vivo, con un dato en el que el equipo confía, sin Excel y sin pedirle el nombre del vendedor al cliente.",
  ),

  block("h2", "Preguntas frecuentes"),
  block("h3", "¿Un ranking de comerciales no genera mal ambiente?"),
  block("normal", "Depende de cómo se use. Si sirve para reconocer y repartir bien los incentivos, motiva. Si se usa para señalar al último de la lista, quema al equipo. La clave es celebrar en público y tener las conversaciones difíciles en privado."),
  block("h3", "¿Qué debo medir en el ranking de reseñas?"),
  block("normal", "La reseña real de Google atribuida al comercial que la originó, no lo que cada uno declara. Añade la nota media y la mejora respecto al mes anterior para que el reconocimiento no dependa solo del volumen."),
  block("h3", "¿Cómo evito que se falseen los números?"),
  block("normal", "Basando el ranking en las reseñas verificadas que entran en Google y atribuyéndolas por un método objetivo, no por lo que cada comercial anota. Si el dato es auditable, no hay número que inflar."),
  block("h3", "¿Cada cuánto debo actualizar el ranking?"),
  block("normal", "Cuanto más visible y frecuente, mejor. Un marcador que se actualiza en tiempo real mantiene el objetivo presente. Si lo llevas a mano, revísalo al menos cada semana para que no se enfríe."),

  block("h2", "En resumen"),
  block(
    "normal",
    "Un ranking de reseñas por comercial es una de las mejores palancas para motivar a tu red comercial, siempre que descanse sobre un dato honesto y se use para reconocer, no para castigar. Mide reseñas atribuidas de verdad, hazlo transparente y visible, y separa el marcador de las conversaciones difíciles. Así dejas de discutir sobre méritos y empiezas a dirigir con datos.",
  ),
  paraWithLink(
    "¿Quieres ver el ranking de tu equipo actualizándose solo, sin montar un Excel? ",
    "Pide una demo de Atribuya",
    "/demo",
    " y te lo enseñamos con tu propia ficha.",
  ),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.equipo-comercial";
const postId = "post.ranking-resenas-comercial-sin-rivalidad-es";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Equipo comercial",
  slug: { _type: "slug", current: "equipo-comercial" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "es",
  title: "Ranking de reseñas por comercial sin generar rivalidad",
  slug: { _type: "slug", current: "ranking-resenas-comercial-sin-rivalidad" },
  excerpt:
    "Cómo montar un ranking de reseñas por comercial que motive al equipo en vez de dividirlo: qué medir, cinco reglas y el error que lo convierte en un campo de batalla.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Ranking de reseñas por comercial sin rivalidad",
  seoDescription:
    "Guía para montar un ranking de reseñas por comercial que motive al equipo: qué medir, cinco reglas para que sume y cómo hacerlo sin Excel.",
};

async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/ranking.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "ranking.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Ranking de comerciales por reseñas conseguidas en el panel de Atribuya",
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

  const cover = await uploadCover();
  console.log(`  ✓ portada subida (${cover.asset._ref})`);

  const existing = await client.getDocument(postId).catch(() => null);
  const publishedAt = existing?.publishedAt ?? new Date().toISOString();

  if (existing && !force) {
    await client.patch(postId).set({ mainImage: cover }).commit();
    console.log("  • post existente: actualizada la portada (usa --force para reescribir el cuerpo).");
  } else {
    await client.createOrReplace({ ...post, publishedAt, body, mainImage: cover });
    console.log(`  ✓ artículo "${post.title}" (publishedAt ${publishedAt})`);
  }
  console.log(`\nURL: https://atribuya.com/blog/${post.slug.current}`);
  console.log("Visible tras la revalidación ISR (máx. 600s) o al redeploy.");
}

run().catch((err) => {
  console.error("\nError:", err.message ?? err);
  process.exit(1);
});
