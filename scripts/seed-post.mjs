// Crea (o actualiza) el primer artículo del blog vía API de escritura de Sanity.
//
// Requiere en .env.local:
//   NEXT_PUBLIC_SANITY_PROJECT_ID=afup27st
//   NEXT_PUBLIC_SANITY_DATASET=production
//   SANITY_API_WRITE_TOKEN=<token con permisos de Editor de sanity.io/manage/project/afup27st>
//
// Uso:
//   node scripts/seed-post.mjs            # crea autor, categoría y el post si no existen
//   node scripts/seed-post.mjs --force    # sobrescribe el cuerpo del post (pierde ediciones del Studio)
//
// El post usa _id determinista, así que relanzar sin --force no duplica.
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

// --- Cuerpo del artículo -----------------------------------------------------
// `policyImg` es el bloque de imagen (ya subida a Sanity) que se inserta en la
// sección de políticas de Google. Se construye en run() tras subir el asset.
const buildBody = (policyImg) => [
  block(
    "normal",
    "Si diriges una empresa con red comercial, la escena te suena. Un cliente deja cinco estrellas en Google, el equipo lo celebra en el grupo y, dos días después, nadie sabe con certeza qué comercial atendió a esa persona. La reseña suma a la reputación de la marca, pero se pierde como reconocimiento para quien de verdad la ganó.",
  ),
  block(
    "normal",
    "Atribuir cada reseña al comercial correcto parece un detalle menor. En realidad es lo que separa un buzón de valoraciones anónimas de un sistema que motiva al equipo, reparte comisiones con justicia y te dice qué vendedores generan clientes satisfechos. El problema es que hacerlo a mano no escala.",
  ),

  block("h2", "El coste invisible de atribuir reseñas a mano"),
  block(
    "normal",
    "La mayoría de las empresas que trabajan la reputación online acaban con la misma solución improvisada: una hoja de Excel donde alguien apunta, de memoria o preguntando por el chat interno, qué comercial cree que atendió a cada cliente que ha dejado reseña. Funciona con cinco reseñas al mes. Se rompe con cincuenta.",
  ),
  block("normal", "El método manual arrastra tres problemas que van a peor cuanto más crece el negocio:"),
  li([span("Se pierde tiempo. ", ["strong"]), span("Cada reseña obliga a un pequeño trabajo detectivesco: mirar fechas, cruzar con la agenda del comercial, preguntar. Multiplícalo por todo el equipo.")]),
  li([span("Se cuela el sesgo. ", ["strong"]), span("Sin un dato objetivo, las atribuciones dudosas tienden a repartirse por afinidad o por quien más reclama, no por quien atendió al cliente.")]),
  li([span("No se puede auditar. ", ["strong"]), span("Cuando una comisión depende de una reseña, cualquier comercial tiene derecho a preguntar por qué se le asignó a otro. Un Excel no responde esa pregunta.")]),

  block("h2", "Pedir el nombre del comercial en la reseña va contra las políticas de Google"),
  block(
    "normal",
    "La tentación es obvia: pedir al cliente que escriba el nombre del vendedor en el texto de la reseña. En la práctica casi nadie lo hace. El cliente quiere dejar su opinión rápido, no rellenar un formulario, y forzarlo resta reseñas justo donde más las necesitas.",
  ),
  block(
    "normal",
    "Hay un problema mayor que la comodidad del cliente. Las políticas de contenido generado por usuarios de Google Maps prohíben de forma expresa que un comercio pida a su personal que consiga reseñas con contenido concreto, y citan de manera literal el contenido que identifica a un empleado. Pedir al cliente que nombre al comercial no es solo poco práctico: es una práctica que Google señala como no permitida, y las reseñas que incumplen sus políticas se exponen a ser retiradas.",
  ),
  policyImg,
  block(
    "normal",
    "Google sí permite invitar al cliente a dejar una reseña honesta sobre su experiencia real. Lo que no permite es dirigir lo que escribe. La salida no pasa por pedirle nada extra ni por arriesgar la ficha del negocio. La salida es no depender de lo que escriba: atribuir la reseña por detrás, sin tocar su contenido.",
  ),

  block("h2", "Cómo atribuir cada reseña sin pedírselo al cliente"),
  block(
    "normal",
    "La atribución automática se apoya en dos piezas que trabajan juntas. La primera identifica de quién viene el cliente antes de que reseñe. La segunda cierra el círculo cuando la reseña aparece en Google.",
  ),

  block("h3", "1. Un enlace personalizado por comercial y por cliente"),
  paraWithLink(
    "Cada comercial comparte con su cliente un enlace propio que lleva directo a la pantalla de escribir reseña en Google. Ese enlace guarda quién lo generó y para qué cliente, sin que la persona note nada distinto a un enlace normal de Google. Es exactamente el flujo que hemos diseñado en ",
    "el producto",
    "/producto",
    ": el cliente cae en Google en un clic, el comercial queda registrado por detrás.",
  ),

  block("h3", "2. Ventana temporal más similitud de nombres"),
  block(
    "normal",
    "Cuando llega una reseña nueva, el sistema la cruza con los clientes a los que ese comercial envió su enlace en los días previos y compara el nombre público de quien reseña con el del cliente esperado. Si coinciden dentro de la ventana temporal, la atribución es automática. Si hay dudas, la reseña queda en una cola para revisar en un clic, en lugar de asignarse a ciegas.",
  ),
  block("blockquote", "La mayoría de las reseñas se atribuyen solas. Las que generan duda no se inventan: se marcan para que una persona decida, con el dato delante."),

  block("h2", "Qué cambia cuando la atribución es automática"),
  block("normal", "Resolver la atribución no es un fin en sí mismo. Es lo que desbloquea todo lo demás:"),
  li([span("Un ranking real. ", ["strong"]), span("El equipo ve quién genera más reseñas y mejor valoradas, con un dato que nadie discute.")]),
  li([span("Comisiones justas. ", ["strong"]), span("Si premias las reseñas, ahora el reparto se apoya en una traza auditable, no en la memoria de nadie.")]),
  li([span("Alertas de reputación. ", ["strong"]), span("Una valoración de una o dos estrellas se detecta al momento y llega a quien debe reaccionar, no dos semanas tarde.")]),
  li([span("Menos trabajo administrativo. ", ["strong"]), span("El tiempo que se iba en cruzar fechas en un Excel se recupera entero.")]),

  block("h2", "Empieza por una prueba con tu propio equipo"),
  paraWithLink(
    "La atribución de reseñas a comerciales deja de ser un trabajo manual en cuanto tienes las dos piezas montadas. Si quieres verlo con tu caso concreto, ",
    "pide una demo",
    "/demo",
    " y te enseñamos cómo quedaría con la estructura de tu equipo y tus fichas de Google.",
  ),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.atribucion-de-resenas";
const postId = "post.atribuir-resenas-google-comerciales-es";

const AUTHOR_PHOTO_URL =
  "https://marinadorconstrucciones.com/wp-content/uploads/2025/10/alejandro-castillo-canton.jpg";

// Sube la foto del autor a Sanity y devuelve la referencia de imagen. Los assets
// de Sanity son content-addressed (id por hash), así que relanzar no duplica.
async function uploadAuthorPhoto() {
  const res = await fetch(AUTHOR_PHOTO_URL);
  if (!res.ok) throw new Error(`No se pudo descargar la foto (HTTP ${res.status}).`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, {
    filename: "alejandro-castillo-canton.jpg",
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

// Sube la imagen de portada del artículo (asset local del repo). Da al post un
// `mainImage` real → hero, og:image y `image` del JSON-LD (campo del rich result
// de Article). Ids content-addressed → relanzar no duplica.
async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/ranking.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "ranking.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Ranking de comerciales por reseñas conseguidas en el panel de Atribuya",
  };
}

// Captura del centro de ayuda de políticas de Google Maps (contenido generado
// por usuarios) que respalda la sección de políticas del artículo. Se sube en
// caliente al dataset (no se versiona el binario en el repo público). Devuelve
// el _id del asset. Content-addressed → relanzar no duplica.
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

// Perfiles verificables del autor (sameAs). El primero, LinkedIn, refuerza el
// E-E-A-T; añade aquí la URL personal cuando la tengas.
const AUTHOR_SAME_AS = [
  "https://www.linkedin.com/in/alejandro-castillo-canton/",
  "https://x.com/castillo_canton",
  "https://castillocanton.com",
];

const AUTHOR_BIO =
  "Alejandro Castillo es el fundador de Castillo Cantón y creador de Atribuya. " +
  "Con más de 15 años de experiencia en marketing digital, desarrollo web y SEO, " +
  "ayuda a empresas con red comercial a convertir las reseñas de Google en un " +
  "activo medible: saber qué comercial ha conseguido cada valoración, sin " +
  "fricción para el cliente. En este blog escribe sobre reputación online, " +
  "atribución de reseñas y productividad de los equipos de ventas.";

const buildAuthor = (image) => ({
  _id: authorId,
  _type: "author",
  name: "Alejandro Castillo",
  role: "Fundador de Castillo Cantón",
  slug: { _type: "slug", current: "alejandro-castillo" },
  bio: AUTHOR_BIO,
  sameAs: AUTHOR_SAME_AS,
  image,
});

const category = {
  _id: categoryId,
  _type: "category",
  title: "Atribución de reseñas",
  slug: { _type: "slug", current: "atribucion-de-resenas" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "es",
  title: "Cómo saber qué comercial ha conseguido cada reseña de Google",
  slug: { _type: "slug", current: "atribuir-resenas-google-comerciales" },
  excerpt:
    "Las empresas con red comercial pierden el rastro de quién consigue cada reseña de Google. Así se atribuye cada valoración al comercial correcto, sin pedírselo al cliente.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  publishedAt: "2026-07-04T09:00:00.000Z",
  seoTitle: "Atribuir reseñas de Google a cada comercial",
  seoDescription:
    "Cómo saber qué comercial consiguió cada reseña de Google sin pedir el nombre al cliente: enlace personalizado, ventana temporal y similitud de nombres.",
};

// --- Ejecución ---------------------------------------------------------------
async function run() {
  console.log(`Sanity: proyecto ${projectId} / dataset ${dataset}`);
  const authorImage = await uploadAuthorPhoto();
  console.log(`  ✓ foto del autor subida (${authorImage.asset._ref})`);
  const author = buildAuthor(authorImage);
  await client.createOrReplace(author);
  console.log(`  ✓ autor "${author.name}"`);
  await client.createOrReplace(category);
  console.log(`  ✓ categoría "${category.title}"`);

  const cover = await uploadCover();
  console.log(`  ✓ portada subida (${cover.asset._ref})`);

  const policyRef = await uploadPolicyImage();
  console.log(`  ✓ imagen de la política de Google subida (${policyRef})`);
  const policyImg = img(
    policyRef,
    "Políticas de contenido de Google Maps: entre lo que un comercio no puede hacer figura pedir a su personal que consiga reseñas con contenido que identifique a un empleado.",
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
  console.log(`\nURL: https://atribuya.com/blog/${post.slug.current}`);
  console.log("Visible tras la revalidación ISR (máx. 600s) o al redeploy.");
}

run().catch((err) => {
  console.error("\nError:", err.message ?? err);
  if (String(err.message).includes("Insufficient permissions") || String(err.message).includes("Unauthorized")) {
    console.error("Revisa que SANITY_API_WRITE_TOKEN tenga permisos de Editor.");
  }
  process.exit(1);
});
