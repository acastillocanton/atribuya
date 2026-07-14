// Publica el artículo "Cómo pedir reseñas de Google sin saltarte las políticas"
// (Pilar D, cumplimiento) vía API de escritura de Sanity. Reutiliza el autor ya
// existente (author.castillo-canton) y crea la categoría "Cumplimiento y
// políticas de Google".
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-politicas-google.mjs          # crea si no existe
//   node scripts/seed-post-politicas-google.mjs --force  # reescribe el cuerpo
//
// _id determinista → relanzar sin --force no duplica. OJO: --force reescribe la
// portada; si el usuario la ha cambiado en el Studio por una WebP propia, no uses
// --force (o vuelve a ponerla). Tras publicar, recuerda enlazar la traducción EN
// en scripts/link-post-translations.mjs.
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
      "puedes pedir reseñas de Google a tus clientes, pero Google prohíbe ofrecer incentivos a cambio, filtrar para que solo reseñen los contentos y pedir que el cliente escriba el nombre de tu comercial. Saltarse esas reglas arriesga que Google elimine las reseñas o penalice tu ficha. La buena noticia es que no necesitas ninguna de esas prácticas: se pueden conseguir reseñas legítimas y, aun así, saber qué comercial trajo cada una, sin pedirle nada raro al cliente.",
    ),
  ]),

  block("h2", "Por qué conviene tomarse en serio las políticas"),
  block(
    "normal",
    "Las reseñas de Google son hoy el primer filtro de confianza de tus clientes. Por eso la tentación de forzarlas es grande, y por eso Google vigila. Cuando detecta prácticas prohibidas puede eliminar reseñas concretas, quitarte reseñas de golpe o, en casos graves, penalizar la visibilidad de tu Perfil de Empresa en Maps y en el paquete local.",
  ),
  block(
    "normal",
    "El problema para un negocio con red comercial es que muchas de estas infracciones se cometen sin mala intención. Un sorteo entre quienes dejen reseña, un email que solo se manda a los clientes contentos o pedirle al cliente que ponga el nombre de tu comercial parecen ideas inofensivas para conseguir más reseñas. Todas van contra las reglas. Merece la pena conocerlas antes de montar el proceso, no después de que Google borre medio trabajo del trimestre.",
  ),

  block("h2", "Qué prohíbe Google exactamente"),
  block(
    "normal",
    "Las políticas viven en el centro de ayuda del Perfil de Empresa de Google. Estas son las cuatro prohibiciones que más afectan a un equipo comercial.",
  ),

  block("h3", "1. Incentivos a cambio de reseñas"),
  paraWithLink(
    "Es la más común y la más clara. Las ",
    "políticas de Perfil de Empresa de Google",
    "https://support.google.com/business/answer/3474122",
    " son explícitas:",
  ),
  block(
    "blockquote",
    "Ofrecer incentivos, como productos o servicios gratuitos o con descuento, a los clientes a cambio de que publiquen reseñas, las cambien o eliminen las negativas se considera interacción falsa y está estrictamente prohibido.",
  ),
  block(
    "normal",
    "En la práctica esto deja fuera descuentos por reseña, regalos, tarjetas, puntos y sorteos entre quienes reseñen. Da igual que el incentivo sea pequeño o que no condiciones la nota: el mero intercambio de reseña a cambio de algo ya es interacción falsa.",
  ),

  block("h3", "2. Filtrar para que solo reseñen los clientes contentos"),
  block(
    "normal",
    "Conocido como review gating. Consiste en preguntar antes si el cliente está satisfecho y enviar solo a los contentos a Google, desviando a los descontentos a un formulario privado. Google lo prohíbe: la invitación a reseñar tiene que ser la misma para todos, sin seleccionar por la nota esperada. Pedir a un cliente que retire o cambie una reseña negativa entra en el mismo saco.",
  ),

  block("h3", "3. Contenido falso o que no refleja una experiencia real"),
  block(
    "normal",
    "Reseñas de personas que no han sido clientes, reseñas escritas por el propio negocio o por empleados sobre su empresa, y reseñas duplicadas o compradas. Google las considera contenido falso. La reseña tiene que venir de un cliente real que ha vivido la experiencia.",
  ),

  block("h3", "4. Pedir que el cliente mencione a tu comercial en la reseña"),
  block(
    "normal",
    "Esta es la trampa específica de quien tiene red comercial, y la que más nos importa. Para saber qué reseña trajo cada vendedor, la vía fácil es pedirle al cliente que escriba el nombre del comercial en el texto. Además de forzar el contenido de la reseña, algo que Google desaconseja, te deja un dato frágil: el cliente se equivoca de nombre, lo omite o lo escribe mal, y tu atribución se cae. Hay formas mucho mejores de saber quién trae cada reseña sin pedirle al cliente que mencione a nadie, y las vemos más abajo.",
  ),

  block("h2", "Lo que sí puedes hacer (y funciona mejor)"),
  block(
    "normal",
    "Cumplir las políticas no te deja sin herramientas. Al contrario, las prácticas legítimas son las que mejor funcionan a largo plazo:",
  ),
  li([span("Pedir la reseña en el momento de mayor satisfacción, ", ["strong"]), span("justo después de una visita o un servicio que ha ido bien.")]),
  li([span("Poner un enlace directo o un código QR ", ["strong"]), span("que abra la pantalla de escribir reseña, sin que el cliente tenga que buscar la ficha. Menos fricción, más reseñas.")]),
  li([span("Invitar a todos los clientes por igual, ", ["strong"]), span("sin filtrar por la nota que esperas. Una ficha sana tiene reseñas variadas, y eso genera más confianza que un muro de cincos perfectos.")]),
  li([span("Responder a todas las reseñas, ", ["strong"]), span("también a las negativas, con educación y una solución. Es tu mejor herramienta de reputación, y esa sí está permitida y recomendada.")]),
  li([span("Dar a cada comercial su propio enlace personalizado, ", ["strong"]), span("para que pedir la reseña sea parte natural de su cierre.")]),
  block(
    "normal",
    "Ese último punto es la clave que conecta el cumplimiento con lo que de verdad quieres medir.",
  ),

  block("h2", "Cómo cumplir y, aun así, saber quién trae cada reseña"),
  block(
    "normal",
    "Aquí está el nudo. Necesitas atribuir cada reseña a un comercial, pero no puedes (ni te conviene) pedirle al cliente que escriba su nombre. La solución no está en el texto de la reseña, sino en el proceso que la origina.",
  ),
  block(
    "normal",
    "Si cada comercial comparte un enlace personal con su cliente y registras cuándo lo hace, luego puedes cruzar cada reseña nueva con el comercial que la originó por la ventana temporal y el nombre del cliente. El cliente deja su reseña en Google como siempre, sin mencionar a nadie, y tú sabes de quién vino. Cumples las políticas y conservas el dato.",
  ),
  paraWithLink(
    "Puedes empezar a ordenarlo hoy mismo, sin herramientas, con una plantilla. ",
    "Descarga gratis la plantilla de atribución de reseñas",
    "/recursos/plantilla-atribucion-resenas",
    " y organiza el enlace por comercial y el cruce con las reseñas que entran, sin saltarte ninguna regla.",
  ),
  paraWithLink(
    "Cuando el volumen crece, esa misma lógica es la que automatiza ",
    "Atribuya",
    "/producto",
    ": cada comercial comparte su enlace, el cliente reseña en Google con total normalidad y la reseña queda atribuida sola, sin incentivos, sin filtrar y sin pedirle el nombre del vendedor a nadie. En nuestro piloto real con una promotora, cuatro comerciales y una ficha, la mayoría de las reseñas verificadas se atribuyeron solas y el resto quedaron a un clic de confirmar. Todo dentro de las políticas de Google.",
  ),

  block("h2", "Preguntas frecuentes"),
  block("h3", "¿Puedo ofrecer un descuento o un regalo a cambio de una reseña?"),
  block("normal", "No. Las políticas de Google prohíben ofrecer incentivos a cambio de reseñas y lo consideran interacción falsa, con riesgo de que se eliminen las reseñas o se penalice la ficha."),
  block("h3", "¿Puedo enviar la invitación solo a los clientes que sé que están contentos?"),
  block("normal", "No. Filtrar para que solo reseñen los satisfechos (review gating) está prohibido. La invitación debe ser la misma para todos los clientes, sin seleccionar por la nota esperada."),
  block("h3", "¿Puedo pedirle al cliente que mencione a mi comercial en la reseña?"),
  block("normal", "No es recomendable. Fuerza el contenido de la reseña y deja un dato frágil que se rompe en cuanto el cliente se equivoca o lo omite. Es mejor atribuir la reseña por el proceso, sin pedirle nada al cliente."),
  block("h3", "¿Qué pasa si me salto las políticas sin querer?"),
  block("normal", "Google puede eliminar reseñas concretas, retirar varias a la vez o penalizar la visibilidad de tu Perfil de Empresa. Por eso conviene montar el proceso bien desde el principio."),
  block("h3", "¿Puedo pedir reseñas por WhatsApp o email?"),
  block("normal", "Sí, siempre que sea una invitación neutral, sin incentivo y enviada a todos por igual. Con permiso previo del cliente para el canal, es una práctica legítima."),

  block("h2", "En resumen"),
  block(
    "normal",
    "Pedir reseñas de Google está permitido y es una gran idea. Lo que no puedes hacer es comprarlas con incentivos, filtrar para esconder las negativas, fabricarlas o forzar su contenido pidiendo que mencionen a tu comercial. Todo eso arriesga tu ficha. Las prácticas legítimas, pedir en el momento justo, con un enlace sin fricción, a todos por igual, funcionan mejor y son sostenibles. Y para saber quién trae cada reseña no necesitas romper ninguna regla: basta con atribuir por el proceso, no por el texto.",
  ),
  paraWithLink(
    "¿Quieres conseguir reseñas y saber qué comercial las trae, sin saltarte una sola política de Google? ",
    "Pide una demo de Atribuya",
    "/demo",
    " y te lo enseñamos con tu propia ficha.",
  ),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.cumplimiento-politicas-google";
const postId = "post.pedir-resenas-google-sin-infringir-politicas-es";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Cumplimiento y políticas de Google",
  slug: { _type: "slug", current: "cumplimiento-politicas-google" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "es",
  title: "Cómo pedir reseñas de Google sin saltarte las políticas",
  slug: { _type: "slug", current: "pedir-resenas-google-sin-infringir-politicas" },
  excerpt:
    "Qué está prohibido al pedir reseñas de Google, qué sí puedes hacer y cómo conseguirlas sin arriesgar que Google las elimine o penalice tu ficha.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Cómo pedir reseñas de Google sin infringir las políticas",
  seoDescription:
    "Qué prohíbe Google al pedir reseñas (incentivos, filtrar negativas, mencionar al comercial) y cómo conseguirlas de forma legítima sin arriesgar tu ficha.",
};

async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/enlace-qr.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "enlace-qr.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Enlace personal y código QR para pedir una reseña de Google de forma legítima, sin incentivos ni mención al comercial",
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

  const existing = await client.getDocument(postId).catch(() => null);
  const publishedAt = existing?.publishedAt ?? new Date().toISOString();

  if (existing && !force) {
    console.log("  • post existente: no se toca (usa --force para reescribir el cuerpo y la portada).");
  } else {
    const cover = await uploadCover();
    console.log(`  ✓ portada subida (${cover.asset._ref})`);
    await client.createOrReplace({ ...post, publishedAt, body, mainImage: cover });
    console.log(`  ✓ artículo "${post.title}" (publishedAt ${publishedAt})`);
  }
  console.log(`\nURL: https://atribuya.com/blog/${post.slug.current}`);
  console.log("Visible tras la revalidación ISR (máx. 600s) o al redeploy.");
  console.log("Recuerda: enlazar la traducción EN en scripts/link-post-translations.mjs.");
}

run().catch((err) => {
  console.error("\nError:", err.message ?? err);
  process.exit(1);
});
