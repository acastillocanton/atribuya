// Publica el artículo "Atribuya vs Birdeye vs Excel: qué resuelve cada uno"
// (Pilar Promo, comparativa) vía API de escritura de Sanity. Reutiliza el autor
// ya existente (author.castillo-canton) y crea la categoría "Comparativas".
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-atribuya-vs-birdeye.mjs          # crea si no existe
//   node scripts/seed-post-atribuya-vs-birdeye.mjs --force  # reescribe el cuerpo
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
// Construye children con enlaces/negritas mezclados. `parts` = [{text, marks?, href?}].
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

// --- Cuerpo ------------------------------------------------------------------
const body = [
  para([
    { text: "En corto: ", marks: ["strong"] },
    { text: "no son tres formas de hacer lo mismo. Excel es el punto de partida manual para cruzar reseñas a mano. Birdeye es una suite generalista de reputación pensada para gestionar reseñas a gran escala (pedirlas, monitorizarlas, responderlas, listings, encuestas). Atribuya es un especialista que hace una cosa que las otras dos no hacen: atribuir cada reseña de Google al comercial que la consiguió, de forma automática y sin pedirle nada raro al cliente. Si lo que quieres es saber qué comercial trae cada reseña, ni el Excel escala ni Birdeye está pensado para eso. Atribuya sí, y convive sin problema con una suite si ya usas una." },
  ]),

  block("h2", "Los tres resuelven problemas distintos"),
  block("normal", "La pregunta «¿Atribuya, Birdeye o Excel?» está mal planteada, porque da por hecho que compiten por el mismo trabajo. No es así. Antes de comparar precios o funciones conviene tener claro qué problema resuelve cada uno:"),
  li([{ text: "Excel ", marks: ["strong"] }, { text: "resuelve el problema de " }, { text: "empezar a ordenar los datos", marks: ["em"] }, { text: " sin gastar un euro." }]),
  li([{ text: "Birdeye ", marks: ["strong"] }, { text: "resuelve el problema de " }, { text: "gestionar tu reputación a escala", marks: ["em"] }, { text: ": conseguir más reseñas, vigilarlas y responderlas en muchas sedes." }]),
  li([{ text: "Atribuya ", marks: ["strong"] }, { text: "resuelve un problema muy concreto que los otros dos dejan fuera: " }, { text: "saber qué comercial ha conseguido cada reseña", marks: ["em"] }, { text: " y motivar al equipo con ese dato." }]),
  block("normal", "Con eso en mente, la comparación deja de ser «cuál es mejor» y pasa a ser «cuál necesito para lo que quiero conseguir»."),

  block("h2", "Excel: el punto de partida manual"),
  para([
    { text: "Casi todo el mundo empieza aquí, y con razón. Una hoja de cálculo es gratis, flexible y no requiere dar de alta nada. Para un equipo de uno o dos comerciales con pocas reseñas al mes, un Excel bien montado puede bastar durante un tiempo. De hecho, si estás en ese punto, tenemos una " },
    { text: "plantilla de atribución de reseñas", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " lista para descargar." },
  ]),
  block("normal", "Sus límites aparecen en cuanto el volumen crece:"),
  li([{ text: "Es 100% manual. ", marks: ["strong"] }, { text: "Alguien tiene que mirar las reseñas nuevas en Google, buscar quién las trajo y apuntarlo a mano. Cada semana, sin fallar." }]),
  li([{ text: "Se rompe con facilidad. ", marks: ["strong"] }, { text: "Un nombre mal escrito, una fila pisada, una fecha en el formato equivocado, y el recuento deja de ser fiable." }]),
  li([{ text: "No avisa de nada. ", marks: ["strong"] }, { text: "Si entra una reseña de una o dos estrellas, te enteras cuando abres la hoja, no cuando pasa." }]),
  li([{ text: "No escala. ", marks: ["strong"] }, { text: "Con tres comerciales quizá va. Con diez y varias reseñas al día, cruzar a mano deja de ser viable." }]),
  block("normal", "El Excel no es un mal sitio para empezar. Es un mal sitio para quedarse cuando el negocio crece."),

  block("h2", "Birdeye: la suite de reputación"),
  block("normal", "Birdeye es una de las plataformas de gestión de reputación más conocidas, y hace muy bien aquello para lo que está diseñada. Es una suite generalista de experiencia de cliente pensada sobre todo para marcas con muchas sedes. Entre sus funciones habituales están:"),
  li("Generar reseñas pidiéndolas de forma automática por SMS y email."),
  li("Monitorizar reseñas de muchos sitios (Google, Facebook y otros) en un solo panel."),
  li("Responder reseñas, con ayuda de IA para redactar las respuestas."),
  li("Gestionar los listings o directorios donde aparece el negocio."),
  li("Mensajería, chat web, encuestas y reporting por sede."),
  block("normal", [
    span("Si tu problema es gestionar la reputación de una red de sedes a gran escala, es una herramienta potente y le sacarás partido. Ahora bien, conviene saber para qué "),
    span("no", ["strong"]),
    span(" está pensada."),
  ]),
  block("normal", [
    span("Birdeye gestiona reseñas, no las "),
    span("atribuye a tu red comercial", ["strong"]),
    span(". Sí ofrece reporting a nivel individual, pero ese nivel mide la actividad del usuario dentro de la plataforma, por ejemplo sus tiempos y tasas de respuesta. No responde a la pregunta que se hace un director comercial: «esta reseña de cinco estrellas que acaba de entrar, ¿qué comercial la consiguió?». Esa atribución, cruzar una reseña entrante con el vendedor que originó la visita, no es su trabajo."),
  ]),
  block("normal", "Sobre el precio, Birdeye no publica tarifas fijas. Su coste se calcula a medida según el número de sedes y los productos contratados, normalmente con contrato anual. Es un modelo pensado para el volumen de una marca multi-sede, no para «solo quiero saber quién vende»."),

  block("h2", "Atribuya: el especialista en atribución"),
  block("normal", "Atribuya no intenta ser una suite de reputación completa. Hace una cosa concreta y la hace bien: conecta cada reseña de Google con el comercial que la consiguió, sin pedirle al cliente que escriba el nombre de nadie."),
  block("normal", "El mecanismo es simple. Cada comercial comparte un enlace personal con su cliente. Cuando el cliente deja su reseña en Google con total normalidad, Atribuya la trae por las APIs oficiales de Google y la atribuye al comercial cruzando la ventana temporal y el nombre del cliente. A partir de ahí tienes:"),
  li([{ text: "Cada reseña asignada a su comercial", marks: ["strong"] }, { text: ", de forma automática. La mayoría se resuelven solas y el resto quedan a un clic de confirmar." }]),
  li([{ text: "Un ", marks: ["strong"] }, { text: "ranking por comercial", marks: ["strong"], href: "/blog/ranking-resenas-comercial-sin-rivalidad" }, { text: " ", marks: ["strong"] }, { text: "para reconocer al equipo y basar incentivos en datos, no en percepciones." }]),
  li([{ text: "Alertas de reseñas de una o dos estrellas", marks: ["strong"] }, { text: " para reaccionar a tiempo, no cuando ya es tarde." }]),
  li([{ text: "Cumplimiento de las políticas de Google", marks: ["strong"] }, { text: ", porque nunca se le pide al cliente que mencione a nadie ni se filtra ni se incentiva." }]),
  block("normal", "Lo que Atribuya no hace es sustituir a una suite de reputación con encuestas, listings de decenas de directorios o mensajería omnicanal. Está centrado en la atribución comercial y la operativa del día a día del equipo. Si ya usas una suite, Atribuya convive con ella y le añade la capa que le falta."),

  block("h2", "Resumen por capacidad"),
  block("normal", "Para verlo de un vistazo, esto es lo que cubre cada herramienta:"),
  li([{ text: "Atribuir una reseña al comercial que la consiguió: ", marks: ["strong"] }, { text: "solo Atribuya. El Excel lo hace a mano y con esfuerzo; Birdeye no está pensado para ello." }]),
  li([{ text: "Traer las reseñas nuevas automáticamente: ", marks: ["strong"] }, { text: "Birdeye y Atribuya. En Excel lo copias tú." }]),
  li([{ text: "Ranking por comercial: ", marks: ["strong"] }, { text: "Atribuya. En Excel, a fórmula y mano." }]),
  li([{ text: "Alertas de reseñas negativas en el momento: ", marks: ["strong"] }, { text: "Birdeye y Atribuya. El Excel no avisa." }]),
  li([{ text: "Pedir reseñas (enlace o QR por comercial): ", marks: ["strong"] }, { text: "Atribuya y Birdeye, cada uno a su manera." }]),
  li([{ text: "Responder reseñas, listings, encuestas, multi-canal: ", marks: ["strong"] }, { text: "el terreno de Birdeye." }]),
  li([{ text: "Coste de entrada: ", marks: ["strong"] }, { text: "Excel es gratis; Atribuya tiene " }, { text: "planes públicos por número de comerciales", href: "/precios" }, { text: "; Birdeye es a medida por sedes, con contrato." }]),
  li([{ text: "Esfuerzo de mantenimiento: ", marks: ["strong"] }, { text: "alto en Excel, bajo en Atribuya y en Birdeye." }]),

  block("h2", "Entonces, ¿cuál necesito?"),
  block("normal", "Depende de qué problema quieras resolver primero:"),
  li([{ text: "Si solo quieres saber qué comercial trae cada reseña", marks: ["strong"] }, { text: " y motivar al equipo con ese dato, esa es exactamente la función de Atribuya. Un Excel te vale para arrancar si eres muy pequeño, pero llegarás pronto a su techo." }]),
  li([{ text: "Si tu prioridad es gestionar la reputación de muchas sedes", marks: ["strong"] }, { text: " a gran escala, con respuestas, listings y encuestas, una suite como Birdeye tiene sentido. Y si además quieres atribuir reseñas a tus comerciales, Atribuya convive con ella y cubre ese hueco." }]),
  li([{ text: "Si estás empezando y quieres gastar cero", marks: ["strong"] }, { text: ", arranca con la plantilla de Excel y da el salto a una herramienta cuando cruzar a mano te empiece a costar tiempo o fiabilidad." }]),
  block("normal", "El mito que conviene desmontar es «para eso ya está Birdeye». No exactamente: Birdeye gestiona tu reputación, pero no acredita quién de tu equipo trae cada reseña. Son cosas distintas, y por eso muchas empresas usan una suite para lo primero y Atribuya para lo segundo."),

  block("h2", "Preguntas frecuentes"),
  block("h3", "¿Birdeye atribuye reseñas a comerciales individuales?"),
  block("normal", "No está diseñado para eso. Ofrece reporting a nivel de usuario dentro de la plataforma (tiempos y tasas de respuesta), pero no acredita qué comercial consiguió cada reseña entrante. Esa atribución por ventana temporal y nombre del cliente es lo que hace Atribuya."),
  block("h3", "¿Atribuya sustituye a Birdeye?"),
  block("normal", "No en todo. Atribuya está centrado en atribuir reseñas a tu equipo comercial y en la operativa del día a día. Si necesitas una suite completa de reputación con encuestas, listings y mensajería, Atribuya convive con ella y le añade la capa de atribución que le falta."),
  block("h3", "¿Puedo seguir con mi Excel?"),
  para([
    { text: "Sí, sobre todo si eres pequeño. La " },
    { text: "plantilla de atribución de reseñas", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " te ordena el proceso gratis. El problema del Excel no es que no funcione, es que es manual y no escala: en cuanto crece el volumen, cruzar a mano deja de ser fiable." },
  ]),
  block("h3", "¿Cuál es más barato?"),
  para([
    { text: "Excel es gratis pero te cuesta tiempo. Atribuya tiene " },
    { text: "planes públicos", href: "/precios" },
    { text: " por número de comerciales. Birdeye se cotiza a medida según sedes y productos, con contrato, así que su coste depende de cada caso. Compara el precio contra el problema que resuelve cada uno, no solo la cifra." },
  ]),
  block("h3", "¿Necesito darle el acceso de Google de mi cliente a Atribuya?"),
  block("normal", "No. La atribución funciona sin tocar la cuenta de Google del cliente: el cliente deja su reseña con normalidad y Atribuya la trae por las APIs oficiales de Google y la cruza con el comercial que la originó."),

  block("h2", "En resumen"),
  block("normal", "Excel, Birdeye y Atribuya no compiten por el mismo trabajo. El Excel es el punto de partida manual, gratis pero con techo. Birdeye es una suite potente para gestionar tu reputación a escala. Atribuya es el especialista que atribuye cada reseña de Google al comercial que la consiguió, algo que ni el Excel escala ni Birdeye está pensado para hacer. Elige por el problema que quieras resolver, y recuerda que no tienes por qué elegir solo uno."),
  para([
    { text: "¿Quieres saber qué comercial trae cada reseña, sin cambiar de suite ni pedirle nada raro al cliente? " },
    { text: "Pide una demo de Atribuya", href: "/demo" },
    { text: " y te lo enseñamos con tu propia ficha." },
  ]),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.comparativas";
const postId = "post.atribuya-vs-birdeye-vs-excel-es";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Comparativas",
  slug: { _type: "slug", current: "comparativas" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "es",
  title: "Atribuya vs Birdeye vs Excel: qué resuelve cada uno",
  slug: { _type: "slug", current: "atribuya-vs-birdeye-vs-excel" },
  excerpt:
    "Excel, Birdeye y Atribuya no compiten por lo mismo. Qué resuelve cada uno, dónde se queda corto y cuál necesitas para atribuir reseñas a tu equipo comercial.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Atribuya vs Birdeye vs Excel: qué resuelve cada uno",
  seoDescription:
    "Excel, Birdeye y Atribuya resuelven problemas distintos. Comparamos qué hace cada uno y cuál necesitas para atribuir reseñas de Google a tus comerciales.",
};

async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/ranking.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "ranking.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Comparativa de Atribuya, Birdeye y Excel para atribuir reseñas de Google a comerciales, con el ranking por comercial de Atribuya",
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
