// Publica el artículo #5 "Incentivos y bonos comerciales basados en reseñas de
// Google" (Pilar B, persona Javier, keyword «incentivos comerciales reseñas»)
// vía API de escritura de Sanity. Reutiliza el autor existente
// (author.castillo-canton) y la categoría "Equipo comercial" del artículo #2.
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-incentivos-comerciales.mjs          # crea si no existe
//   node scripts/seed-post-incentivos-comerciales.mjs --force  # reescribe el cuerpo
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
const num = (parts) => mixed(parts, { listItem: "number", level: 1 });

// --- Cuerpo ------------------------------------------------------------------
const body = [
  para([
    { text: "En corto: ", marks: ["strong"] },
    { text: "sí puedes pagar bonos o comisiones a tu equipo comercial por conseguir reseñas de Google. Lo que no puedes hacer es incentivar al cliente que las escribe: eso lo prohíben las políticas de Google y pone en riesgo la ficha. La diferencia entre un plan de incentivos que motiva y uno que genera discusiones está en tres cosas: premiar solo reseñas verificadas y atribuidas, fijar un criterio único y transparente, y poner guardarraíles contra las trampas. Sin una atribución fiable de cada reseña a su comercial, el bono se convierte en fuente de conflictos en vez de motivación." },
  ]),

  block("h2", "Por qué ligar incentivos a las reseñas"),
  para([
    { text: "Las reseñas de Google son de los pocos resultados comerciales que se ven desde fuera. Un cliente satisfecho que deja cinco estrellas es la prueba pública de una venta bien cerrada y de una experiencia bien cuidada. Además influyen directamente en la captación: la inmensa mayoría de los consumidores consulta reseñas antes de decidirse por un negocio local, según mide cada año la " },
    { text: "Local Consumer Review Survey de BrightLocal", href: "https://www.brightlocal.com/research/local-consumer-review-survey/" },
    { text: "." },
  ]),
  para([
    { text: "Para un director comercial tienen otra virtud: miden un comportamiento que el CRM no ve. El CRM registra la venta; la reseña registra cómo quedó el cliente después de la venta. Si quieres que tu equipo cuide ese último tramo, tiene sentido reconocerlo y retribuirlo. El primer paso, eso sí, es " },
    { text: "conseguir que el equipo pida reseñas de forma sistemática", href: "/blog/conseguir-resenas-google-equipo-comercial" },
    { text: "; el incentivo llega después, para sostener el hábito." },
  ]),

  block("h2", "La línea roja: a quién puedes incentivar y a quién no"),
  block("normal", "Antes de diseñar nada conviene tener clarísima la frontera, porque se cruza con facilidad y las consecuencias las paga tu ficha de Google:"),
  li([
    { text: "Incentivar al cliente está prohibido. ", marks: ["strong"] },
    { text: "Ofrecer descuentos, regalos, sorteos o dinero a cambio de una reseña infringe las " },
    { text: "políticas de contenido de Google Maps", href: "https://support.google.com/contributionpolicy/answer/7400114" },
    { text: ", que vetan el contenido incentivado. Google puede retirar esas reseñas y penalizar la ficha." },
  ]),
  li([
    { text: "Retribuir a tu equipo es una decisión interna de empresa. ", marks: ["strong"] },
    { text: "Google no regula tu plan de comisiones. Pagar a un comercial por hacer bien el proceso de pedir reseñas, con naturalidad y sin presionar, no infringe ninguna política." },
  ]),
  para([
    { text: "El matiz importante es que un incentivo interno mal diseñado empuja al equipo justo hacia lo prohibido: presionar al cliente, prometerle algo a cambio o filtrar a quién se le pide. Por eso los guardarraíles importan tanto como el importe. Si quieres el detalle completo de lo que Google permite y lo que no al pedir reseñas, lo tienes en " },
    { text: "cómo pedir reseñas sin saltarte las políticas", href: "/blog/pedir-resenas-google-sin-infringir-politicas" },
    { text: "." },
  ]),

  block("h2", "Sin atribución fiable no hay bono justo"),
  block("normal", "Aquí es donde la mayoría de los planes de incentivos se rompen. Pagar dinero exige un dato incontestable: qué reseña consiguió cada comercial. Con dos complicaciones que lo hacen difícil a mano:"),
  li([
    { text: "No puedes pedirle al cliente que nombre al comercial en la reseña. ", marks: ["strong"] },
    { text: "Pedir contenido que identifique a un empleado va contra las políticas de Google. La atribución tiene que resolverse por otra vía: cruzando cuándo se pidió la reseña y quién era el cliente." },
  ]),
  li([
    { text: "El Excel se queda corto en cuanto hay dinero en juego. ", marks: ["strong"] },
    { text: "Cruzar reseñas a mano cada semana funciona hasta que un comercial discute una asignación el día del cierre. Un nombre mal escrito o una fila pisada dejan de ser una anécdota cuando deciden un bono." },
  ]),
  block("normal", "La regla práctica: si el dato que decide el incentivo se puede discutir, el incentivo genera más conflicto que motivación. La verificación previa no es burocracia, es lo que hace el bono defendible delante del equipo."),

  block("h2", "Cuatro modelos de incentivo que funcionan"),
  block("normal", "No hay un único plan correcto. Estos cuatro modelos cubren la mayoría de los casos y se pueden combinar:"),
  num([
    { text: "Comisión fija por reseña verificada. ", marks: ["strong"] },
    { text: "Una cantidad razonable por cada reseña atribuida y confirmada. Es el modelo más directo: el comercial ve la relación entre su trabajo y su nómina. Funciona bien como base." },
  ]),
  num([
    { text: "Objetivo mensual con bonus. ", marks: ["strong"] },
    { text: "Un número de reseñas al mes por comercial y un premio al alcanzarlo. Sostiene el hábito y evita que el esfuerzo se concentre en rachas." },
  ]),
  num([
    { text: "Ranking con reconocimiento. ", marks: ["strong"] },
    { text: "No todo es dinero: un ranking visible, insignias por hitos y el reconocimiento en la reunión de equipo mueven más de lo que parece. Eso sí, hay que diseñarlo para que no enfrente al equipo; cómo hacerlo lo contamos en " },
    { text: "ranking de reseñas sin generar rivalidad", href: "/blog/ranking-resenas-comercial-sin-rivalidad" },
    { text: "." },
  ]),
  num([
    { text: "Modelo mixto. ", marks: ["strong"] },
    { text: "Comisión pequeña por reseña más premio por objetivo. Reparte la motivación entre el corto plazo (cada reseña cuenta) y la constancia (el mes completo)." },
  ]),
  block("normal", "Sea cual sea el modelo, tres reglas de diseño no se negocian:"),
  li([{ text: "Criterio único y transparente. ", marks: ["strong"] }, { text: "Todo el equipo sabe qué reseña cuenta, desde cuándo y cómo se verifica. Sin letra pequeña ni excepciones de última hora." }]),
  li([{ text: "Se paga la reseña verificada, no la promesa. ", marks: ["strong"] }, { text: "Cuenta lo que llega a Google y queda atribuido, no la actividad ni las intenciones." }]),
  li([{ text: "La calidad también cuenta. ", marks: ["strong"] }, { text: "Premiar solo el volumen invita a forzar la máquina. Añade la nota media o la mejora mensual al reconocimiento." }]),

  block("h2", "Cinco guardarraíles contra las trampas"),
  block("normal", "Todo incentivo crea la tentación de atajar. Estos cinco controles la neutralizan sin convertir el plan en un expediente:"),
  num([
    { text: "Verificación antes de pagar. ", marks: ["strong"] },
    { text: "Ninguna reseña entra en la liquidación sin estar atribuida y verificada. La mayoría se resuelven de forma automática; las dudosas se confirman con un clic antes del cierre." },
  ]),
  num([
    { text: "Detección de duplicados. ", marks: ["strong"] },
    { text: "El mismo cliente solo puede contar una vez. Si deja dos reseñas, o edita la que tenía, el sistema debe quedarse con una sola como válida." },
  ]),
  num([
    { text: "Tarifa congelada al cierre. ", marks: ["strong"] },
    { text: "Los cambios de comisión valen hacia adelante, nunca sobre el mes ya cerrado. Evita la sensación de que las reglas cambian cuando toca pagar." },
  ]),
  num([
    { text: "Las reseñas negativas también se miran. ", marks: ["strong"] },
    { text: "Un plan de incentivos no puede tapar los problemas. Las reseñas de una o dos estrellas necesitan alerta inmediata y gestión, no silencio." },
  ]),
  num([
    { text: "Nada de autoreseñas ni allegados. ", marks: ["strong"] },
    { text: "Además de romper la confianza interna, Google detecta y retira este tipo de reseñas, con riesgo para la ficha de todos." },
  ]),

  block("h2", "Los errores que más se repiten"),
  li([{ text: "Prometer algo al cliente a cambio de la reseña. ", marks: ["strong"] }, { text: "Es la infracción más común y la más cara: reseñas retiradas y ficha en riesgo." }]),
  li([{ text: "Pagar por volumen bruto sin verificar. ", marks: ["strong"] }, { text: "Al tercer mes aparecen reseñas dudosas, duplicados y discusiones de cierre." }]),
  li([{ text: "Pedir la reseña solo a los clientes contentos. ", marks: ["strong"] }, { text: "El filtrado selectivo también va contra las políticas de Google. Se pide a todos y se gestiona lo que llegue." }]),
  li([{ text: "Un bono que enfrenta al equipo. ", marks: ["strong"] }, { text: "Si solo gana el primero, los demás se descuelgan. Reconoce la mejora y la constancia, no solo el podio." }]),
  li([{ text: "Liquidar a mano con dinero en juego. ", marks: ["strong"] }, { text: "El Excel vale para arrancar; para pagar bonos necesitas un dato que nadie pueda discutir." }]),

  block("h2", "Cómo lo resuelve Atribuya"),
  block("normal", "Atribuya está construido justo para este caso: atribuye cada reseña de Google al comercial que la consiguió, sin pedirle nada raro al cliente, y convierte esa atribución en la base del incentivo:"),
  li([{ text: "Comisión en euros por reseña", marks: ["strong"] }, { text: " configurable por comercial, con ciclo de liquidación mensual y tarifa congelada en los meses cerrados." }]),
  li([{ text: "Verificación integrada: ", marks: ["strong"] }, { text: "la mayoría de las reseñas se atribuyen solas y las dudosas quedan en una cola para confirmar a un clic." }]),
  li([{ text: "Duplicados detectados de serie: ", marks: ["strong"] }, { text: "un mismo cliente cuenta una sola vez, aunque edite o repita su reseña." }]),
  li([{ text: "Ranking, objetivos mensuales e insignias", marks: ["strong"] }, { text: " para la parte de reconocimiento, y alertas inmediatas de reseñas de una o dos estrellas para la parte de gestión." }]),
  para([
    { text: "Si hoy lo llevas a mano, puedes empezar gratis con nuestra " },
    { text: "plantilla de atribución de reseñas", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " y dar el salto cuando el volumen o el dinero en juego lo pidan." },
  ]),

  block("h2", "Preguntas frecuentes"),
  block("h3", "¿Puedo pagar a mis comerciales por conseguir reseñas de Google?"),
  block("normal", "Sí. La retribución de tu equipo es una decisión interna de empresa y Google no la regula. Lo que prohíben las políticas de Google es incentivar a quien escribe la reseña (el cliente) o falsear contenido. Diseña el plan sobre reseñas verificadas y con reglas transparentes y no tendrás problema."),
  block("h3", "¿Puedo ofrecer un descuento al cliente a cambio de su reseña?"),
  para([
    { text: "No. Las " },
    { text: "políticas de contenido de Google", href: "https://support.google.com/contributionpolicy/answer/7400114" },
    { text: " prohíben el contenido incentivado: descuentos, regalos, sorteos o dinero a cambio de reseñas. Google puede retirar esas reseñas y penalizar la ficha del negocio." },
  ]),
  block("h3", "¿Cuánto pagar por cada reseña?"),
  block("normal", "No hay una cifra universal. Una referencia práctica es el valor que tiene para ti un lead orgánico: la reseña trabaja captando clientes mucho tiempo después de publicada. En la práctica funciona bien una cantidad fija modesta por reseña verificada, complementada con un bonus por objetivo mensual y con reconocimiento no monetario."),
  block("h3", "¿Cómo evito que el incentivo genere trampas?"),
  block("normal", "Con cuatro controles: verificación de cada reseña antes de liquidar, detección de duplicados por cliente, tarifa congelada en los meses cerrados y tolerancia cero con autoreseñas. Si el dato de partida es fiable, la trampa deja de compensar."),
  block("h3", "¿Me vale un Excel para liquidar los bonos?"),
  para([
    { text: "Para arrancar, sí: la " },
    { text: "plantilla de atribución de reseñas", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " te ordena el proceso gratis. El límite llega con el dinero: cuando el cruce manual decide una nómina, cualquier error o duda se convierte en conflicto. En ese punto conviene una verificación automática." },
  ]),

  block("h2", "En resumen"),
  block("normal", "Incentivar a tu equipo comercial por las reseñas de Google funciona y es perfectamente lícito, siempre que el incentivo mire hacia dentro (tu equipo) y nunca hacia fuera (el cliente que escribe). El plan se sostiene sobre tres patas: reseñas verificadas y atribuidas a su comercial, un criterio único que todo el mundo conoce, y guardarraíles que hagan que la trampa no compense. Con eso, el bono deja de ser una fuente de discusiones y se convierte en lo que debía ser: una forma justa de reconocer a quien cuida al cliente hasta el final."),
  para([
    { text: "¿Quieres pagar incentivos sobre datos que nadie pueda discutir? " },
    { text: "Pide una demo de Atribuya", href: "/demo" },
    { text: " y te enseñamos la atribución, las comisiones y el ranking funcionando con tu propia ficha." },
  ]),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.equipo-comercial";
const postId = "post.incentivos-comerciales-resenas-google-es";

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
  title: "Incentivos y bonos comerciales basados en reseñas de Google",
  slug: { _type: "slug", current: "incentivos-comerciales-resenas-google" },
  excerpt:
    "Sí puedes pagar bonos a tu equipo por conseguir reseñas de Google; lo que no puedes es incentivar al cliente. Cómo diseñar un plan justo, con qué modelos y con qué guardarraíles contra las trampas.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Incentivos comerciales por reseñas de Google: guía práctica",
  seoDescription:
    "Cómo diseñar incentivos y bonos para tu equipo comercial basados en reseñas de Google verificadas, sin incentivar al cliente ni infringir las políticas.",
};

async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/ranking.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "ranking.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Ranking de reseñas por comercial de Atribuya, base para pagar incentivos y bonos comerciales con datos verificados",
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
