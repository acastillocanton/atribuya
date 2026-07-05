// Publica el artículo "Cómo conseguir reseñas de Google con tu equipo comercial"
// (Pilar A) vía API de escritura de Sanity. Reutiliza el autor ya existente
// (author.castillo-canton) y crea la categoría "Conseguir reseñas de Google".
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-conseguir-resenas.mjs          # crea si no existe
//   node scripts/seed-post-conseguir-resenas.mjs --force  # reescribe el cuerpo
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
      "tu red comercial es el mejor canal para conseguir reseñas de Google, porque habla con el cliente justo cuando está satisfecho. La clave está en pedirlas en ese momento con un enlace directo sin fricción, respetar las políticas de Google y, sobre todo, saber después qué comercial trajo cada reseña. Ese último paso es el que casi nadie da, y es el que convierte las reseñas en una herramienta para dirigir al equipo.",
    ),
  ]),

  block("h2", "Por qué las reseñas de Google importan más que nunca"),
  paraWithLink(
    "Cuando alguien busca una promotora, una clínica o un apartamento turístico, mira las estrellas antes que la web. No es una impresión: según el Local Consumer Review Survey 2026 de BrightLocal, el 97% de los consumidores lee reseñas de negocios locales y el 45% dejó una reseña en Google en el último año ",
    "(BrightLocal)",
    "https://www.brightlocal.com/research/local-consumer-review-survey/",
    ". Las reseñas son, para la mayoría de tus clientes potenciales, el primer filtro antes de contactar contigo.",
  ),
  block(
    "normal",
    "Una ficha con reseñas recientes y buena nota sube en Google Maps y en el paquete local de resultados. Más visibilidad significa más llamadas, más visitas al piso piloto y más solicitudes de información. Para un negocio con red comercial esto se multiplica, porque cada comercial que cierra una visita con buena sensación tiene delante a la persona ideal para dejar una reseña.",
  ),

  block("h2", "Cuándo y cómo pedir reseñas de Google sin incomodar"),
  block(
    "normal",
    "El mejor momento para pedir una reseña es el pico de satisfacción: justo después de una visita que ha ido bien, al cerrar un servicio o cuando el cliente da las gracias en persona. Si esperas una semana, el impulso se enfría.",
  ),
  block("normal", "El segundo factor es la fricción. Cuantos menos pasos, más reseñas. Estos son los canales que mejor funcionan para un equipo comercial:"),
  li([span("Enlace directo o código QR ", ["strong"]), span("que lleve al cliente a la pantalla de escribir reseña en tu Perfil de Empresa de Google (antes Google My Business), sin buscar la ficha a mano.")]),
  li([span("Email de seguimiento ", ["strong"]), span("entre 24 y 72 horas después del servicio, breve y sin tono de venta.")]),
  li([span("WhatsApp o SMS, ", ["strong"]), span("con permiso previo, en negocios donde ya existe esa conversación habitual con el cliente.")]),
  block(
    "normal",
    "La clave operativa: dale a cada comercial su propio enlace personalizado. Así pedir la reseña se vuelve parte natural de su cierre, no una tarea extra que se olvida.",
  ),

  block("h2", "Lo que Google prohíbe al pedir reseñas"),
  paraWithLink(
    "Aquí es donde muchos negocios se meten en problemas sin saberlo. Las ",
    "políticas de Perfil de Empresa de Google",
    "https://support.google.com/business/answer/3474122",
    " son explícitas sobre los incentivos:",
  ),
  block(
    "blockquote",
    "Ofrecer incentivos, como productos o servicios gratuitos o con descuento, a los clientes a cambio de que publiquen reseñas, las cambien o eliminen las negativas se considera interacción falsa y está estrictamente prohibido.",
  ),
  block("normal", "En la práctica, esto deja fuera tres cosas que conviene tener claras:"),
  li([span("Ofrecer incentivos ", ["strong"]), span("por reseñas: descuentos, regalos o sorteos.")]),
  li([span("Pedir que el cliente mencione al comercial por su nombre ", ["strong"]), span("en el texto. Además de forzar la reseña, te deja un dato frágil.")]),
  li([span("Filtrar ", ["strong"]), span("para que solo los clientes contentos reseñen, o pedir que retiren las negativas.")]),
  block(
    "normal",
    "La buena noticia: no necesitas ninguna de esas prácticas. Puedes conseguir reseñas legítimas y, aun así, saber quién las trae, sin pedirle al cliente que escriba el nombre de nadie.",
  ),

  block("h2", "El paso que casi nadie da: saber qué comercial trae cada reseña"),
  block(
    "normal",
    "Imagina que tu equipo hace bien los deberes y las reseñas empiezan a entrar. Ahora responde: ¿cuál trajo Javier y cuál Marta?",
  ),
  block(
    "normal",
    "La respuesta habitual es una tarde cruzando fechas de visita con fechas de reseña en un Excel, adivinando por el nombre del cliente. Es lento, es impreciso y termina en discusiones sobre a quién le toca el bono. La reseña se convierte en fuente de conflicto en lugar de en reconocimiento.",
  ),
  block(
    "normal",
    "Sin embargo, ese es el dato más útil que puedes tener de tu red comercial. Te dice quién genera confianza real, no quién habla más alto en la reunión. Con él repartes incentivos con criterio, reconoces al que aporta y detectas quién necesita apoyo. Lo que no se mide, no se dirige.",
  ),

  block("h2", "Cómo hacerlo sin Excel"),
  block(
    "normal",
    "La forma manual funciona hasta que tienes más de un puñado de reseñas al mes. A partir de ahí necesitas un sistema que atribuya cada reseña a su comercial de forma automática, sin pedirle nada raro al cliente.",
  ),
  paraWithLink(
    "Para empezar hoy mismo, sin herramientas, te hemos preparado una plantilla que ordena el proceso: enlace por comercial, registro de visitas y cruce con las reseñas que van entrando. ",
    "Descarga gratis la plantilla de atribución de reseñas",
    "/recursos/plantilla-atribucion-resenas",
    " y deja de adivinar quién trae cada una.",
  ),
  paraWithLink(
    "Cuando el volumen crezca, esa misma lógica es la que automatiza ",
    "Atribuya",
    "/producto",
    ": cada comercial comparte su enlace personal, el cliente deja la reseña en Google como siempre, y la reseña queda atribuida sola. La mayoría se resuelven automáticamente y el resto quedan a un clic de confirmar. Sin Excel y sin pedirle el nombre del vendedor al cliente.",
  ),

  block("h2", "Preguntas frecuentes"),
  block("h3", "¿Cómo consigo que mis clientes dejen una reseña en Google?"),
  block("normal", "Pídesela en el momento de mayor satisfacción, con un enlace directo o un código QR que abra la pantalla de reseña. Cuantos menos pasos, más reseñas."),
  block("h3", "¿Puedo ofrecer un descuento a cambio de una reseña?"),
  block("normal", "No. Las políticas de Google prohíben ofrecer incentivos a cambio de reseñas y lo consideran interacción falsa, con riesgo de que se eliminen o penalicen."),
  block("h3", "¿Puedo pedir que el cliente mencione a mi comercial en la reseña?"),
  block("normal", "No es recomendable ni fiable. Fuerza la reseña y deja un dato débil. Es mejor atribuir la reseña por otros medios, sin pedírselo al cliente."),
  block("h3", "¿Cómo sé qué comercial ha conseguido cada reseña?"),
  block("normal", "Con un enlace personal por comercial y un sistema que cruce cada reseña nueva con el comercial que la originó. Es justo lo que automatiza Atribuya, sin Excel."),

  block("h2", "En resumen"),
  block(
    "normal",
    "Tu red comercial es tu mejor motor de reseñas si le das el momento y la herramienta adecuados: pedir en el pico de satisfacción, con un enlace sin fricción, respetando siempre las políticas de Google. El paso que casi nadie da es cerrar el círculo y saber quién trae cada reseña. Ahí es donde las reseñas dejan de ser marketing y se convierten en una forma de dirigir mejor a tu equipo.",
  ),
  paraWithLink(
    "¿Quieres ver quién de tu equipo te genera negocio, sin montar un Excel? ",
    "Pide una demo de Atribuya",
    "/demo",
    " y te lo enseñamos con tu propia ficha.",
  ),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.conseguir-resenas-google";
const postId = "post.conseguir-resenas-google-equipo-comercial-es";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Conseguir reseñas de Google",
  slug: { _type: "slug", current: "conseguir-resenas-google" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "es",
  title: "Cómo conseguir reseñas de Google con tu equipo comercial",
  slug: { _type: "slug", current: "conseguir-resenas-google-equipo-comercial" },
  excerpt:
    "Cómo conseguir más reseñas de Google con tu red comercial, pedirlas en el momento justo sin incomodar ni saltarte las políticas, y saber quién trae cada una.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Cómo conseguir reseñas de Google con tu equipo comercial",
  seoDescription:
    "Guía para conseguir más reseñas de Google con tu red comercial, pedirlas sin infringir las políticas y saber qué comercial trae cada una.",
};

async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/enlace-qr.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "enlace-qr.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Enlace personal y código QR de un comercial para que el cliente deje una reseña en Google, en el panel de Atribuya",
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
