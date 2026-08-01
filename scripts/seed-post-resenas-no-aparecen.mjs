// Publica el artículo #6 "Por qué tus reseñas de Google no aparecen (y cómo
// saber si te están filtrando)" (Pilar D, personas Laura+Carlos, keyword
// «mis reseñas de Google no aparecen») vía API de escritura de Sanity.
// Reutiliza el autor existente (author.castillo-canton) y la categoría
// "Cumplimiento y políticas de Google" del artículo #3.
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-resenas-no-aparecen.mjs          # crea si no existe
//   node scripts/seed-post-resenas-no-aparecen.mjs --force  # reescribe el cuerpo
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
    { text: "si las reseñas de tus clientes no aparecen en tu ficha de Google, lo más probable es que el filtro automático de Google las esté reteniendo o eliminando. La parte que casi nadie sabe es que Google no avisa cuando lo hace: no hay email, no hay notificación, la reseña simplemente no se publica. El negocio piensa que sus clientes no las dejan, cuando en realidad las dejan y desaparecen. En este artículo repasamos las causas más frecuentes, un diagnóstico en seis pasos para confirmar si te están filtrando y qué hacer para recuperar el ritmo sin arriesgar la ficha." },
  ]),

  block("h2", "Primero, descarta lo normal: el retraso"),
  para([
    { text: "No toda reseña que no ves es una reseña filtrada. Todas las reseñas pasan controles automáticos antes de publicarse y, en algunos casos, ese proceso tarda unos días. Google lo reconoce en su página de ayuda sobre " },
    { text: "reseñas que faltan o se han retrasado", href: "https://support.google.com/business/answer/10313341?hl=es" },
    { text: ": la demora es normal, sobre todo en fichas nuevas, en fichas fusionadas recientemente o cuando la reseña incluye foto o texto largo." },
  ]),
  block("normal", "La regla práctica: una reseña que lleva menos de una semana sin aparecer todavía puede estar en revisión. Si pasan dos semanas, o si el problema se repite con varios clientes, ya no es un retraso. Es momento de diagnosticar."),

  block("h2", "Google elimina reseñas sin avisar"),
  para([
    { text: "Aquí está el dato que cambia la conversación. Según el " },
    { text: "informe oficial de Google sobre protección de contenido en Maps", href: "https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/" },
    { text: " publicado en abril de 2026, sus sistemas bloquearon o retiraron más de 292 millones de reseñas que infringían las políticas durante 2025. La mayoría se elimina antes de que nadie la vea." },
  ]),
  block("normal", "A ese proceso no le acompaña ningún aviso al negocio. Nadie te escribe para decirte que una reseña no pasó el filtro ni por qué. El resultado es un problema silencioso: el dueño ve que el ritmo de reseñas cae y saca conclusiones equivocadas. Piensa que los clientes son desagradecidos, que la campaña no funciona o que el algoritmo está raro. Mientras tanto, la causa real (casi siempre un fallo en el proceso de pedirlas) sigue activa y el daño se acumula."),

  block("h2", "Las seis causas más frecuentes"),
  block("normal", "Cuando las reseñas legítimas de clientes reales no se publican, el filtro suele estar reaccionando a alguno de estos patrones:"),
  num([
    { text: "Contenido incentivado. ", marks: ["strong"] },
    { text: "Descuentos, regalos, sorteos o cualquier contraprestación a cambio de la reseña. Las " },
    { text: "políticas de contenido de Google", href: "https://support.google.com/contributionpolicy/answer/7400114" },
    { text: " lo consideran interacción falsa y es de lo primero que los sistemas aprenden a detectar." },
  ]),
  num([
    { text: "Review gating. ", marks: ["strong"] },
    { text: "Preguntar antes si el cliente está contento y enviar a Google solo a los satisfechos, desviando al resto a un formulario privado. Está prohibido y algunos proveedores de reputación todavía lo venden como servicio. Si tu agencia lo hace por ti, el riesgo lo corre tu ficha." },
  ]),
  num([
    { text: "Ráfagas y patrones artificiales. ", marks: ["strong"] },
    { text: "Muchas reseñas en muy poco tiempo tras meses de silencio, o varias reseñas escritas desde la misma red wifi del local. El caso típico: el cliente escanea el QR en el mostrador conectado al wifi del negocio y su reseña llega a Google desde la misma dirección que las diez anteriores." },
  ]),
  num([
    { text: "El perfil de quien escribe. ", marks: ["strong"] },
    { text: "Cuentas recién creadas, sin historial de contribuciones ni actividad previa, tienen más papeletas de que su reseña se retenga. Las reseñas de empleados o familiares directos, además de filtrarse, infringen las políticas por conflicto de interés." },
  ]),
  num([
    { text: "El texto de la reseña. ", marks: ["strong"] },
    { text: "Enlaces, números de teléfono, contenido fuera de tema o texto que parece plantilla. Aquí entra también una práctica que parece inofensiva: pedir al cliente que escriba el nombre del comercial que le atendió. Va contra las políticas y lo explicamos en detalle en " },
    { text: "cómo pedir reseñas sin saltarte las políticas", href: "/blog/pedir-resenas-google-sin-infringir-politicas" },
    { text: "." },
  ]),
  num([
    { text: "El estado de la ficha. ", marks: ["strong"] },
    { text: "Suspensiones, cambios grandes recientes (nombre, categoría, dirección) o fusiones de fichas duplicadas pueden retener las reseñas nuevas durante días. En este caso el problema no es el filtro de reseñas sino la propia ficha." },
  ]),

  block("h2", "Diagnóstico en seis pasos"),
  block("normal", "Antes de cambiar nada, confirma qué está pasando. Este diagnóstico se hace en menos de una hora:"),
  num([
    { text: "Pide al cliente que compruebe su reseña. ", marks: ["strong"] },
    { text: "Desde su cuenta de Google (Maps, menú Tus contribuciones) el autor siempre ve su propia reseña. Si él la ve publicada y tú no la encuentras en la ficha desde una ventana de incógnito, la reseña está retenida o filtrada. Esa es la prueba definitiva." },
  ]),
  num([
    { text: "Cuenta las que faltan. ", marks: ["strong"] },
    { text: "Compara cuántas reseñas ha pedido tu equipo con cuántas se han publicado. Si no llevas ese registro, empieza hoy: nuestra " },
    { text: "plantilla de atribución de reseñas", href: "/recursos/plantilla-atribucion-resenas" },
    { text: " te sirve para anotar cada petición y cruzarla con lo que llega a la ficha." },
  ]),
  num([
    { text: "Busca el patrón temporal. ", marks: ["strong"] },
    { text: "¿Dejaron de publicarse a partir de una fecha concreta? Cruza esa fecha con lo que cambió: una campaña nueva, un QR en el mostrador, una agencia contratada, un incentivo que alguien improvisó." },
  ]),
  num([
    { text: "Audita cómo se está pidiendo. ", marks: ["strong"] },
    { text: "Pregunta a tu equipo qué dice exactamente al pedir la reseña y revisa los emails o mensajes que se envían. Buscas tres cosas: promesas a cambio de la reseña, encuestas previas que filtran y peticiones de contenido concreto." },
  ]),
  num([
    { text: "Revisa el estado de la ficha. ", marks: ["strong"] },
    { text: "Entra en tu Perfil de Empresa y comprueba que no hay avisos de suspensión ni verificaciones pendientes, y que no has hecho cambios grandes en los últimos días." },
  ]),
  num([
    { text: "Contacta con soporte solo al final. ", marks: ["strong"] },
    { text: "Si todo lo anterior está limpio y las reseñas siguen sin aparecer pasadas dos semanas, abre un caso con el soporte de Perfil de Empresa desde el " },
    { text: "centro de ayuda", href: "https://support.google.com/business/answer/10313341?hl=es" },
    { text: ". Ten a mano los datos: fecha de la reseña, nombre del autor y captura desde la cuenta del cliente si la tienes." },
  ]),

  block("h2", "Qué hacer si el filtro te está penalizando"),
  block("normal", "Si el diagnóstico apunta a alguna de las causas anteriores, el plan de recuperación es más sencillo de lo que parece, aunque exige paciencia:"),
  li([
    { text: "Corta la práctica prohibida hoy. ", marks: ["strong"] },
    { text: "Cada semana que el incentivo o el filtrado sigue activo, el patrón se refuerza. Lo primero es dejar de alimentarlo, también si lo hace una agencia en tu nombre." },
  ]),
  li([
    { text: "Pide a todos y sin condiciones. ", marks: ["strong"] },
    { text: "La invitación tiene que ser la misma para cada cliente, contento o no, sin encuesta previa ni contraprestación. Es lo que exige la política y, además, lo que genera reseñas creíbles." },
  ]),
  li([
    { text: "Pide en el momento y con enlace directo. ", marks: ["strong"] },
    { text: "La petición funciona cuando llega justo después de la buena experiencia y con un enlace que deja al cliente a un clic de escribir. El cliente reseña desde su móvil y su red, con su cuenta de siempre: exactamente el patrón natural que el filtro espera." },
  ]),
  li([
    { text: "Acepta el ritmo natural. ", marks: ["strong"] },
    { text: "Las reseñas deben llegar al ritmo de tu negocio real. Si vendes diez pisos al mes, veinte reseñas semanales no son una buena señal, son una bandera roja." },
  ]),
  li([
    { text: "No insistas sobre la misma reseña. ", marks: ["strong"] },
    { text: "Pedir al cliente que la borre y la vuelva a escribir suele empeorar las cosas. Las reseñas retiradas por infringir políticas no se recuperan; las retenidas por error a veces sí, vía soporte." },
  ]),

  block("h2", "El registro que te avisa a tiempo"),
  para([
    { text: "Fíjate en que todo el diagnóstico descansa sobre un dato: cuántas reseñas se pidieron y cuántas llegaron. El negocio que no lleva ese registro tarda meses en enterarse de que le están filtrando; el que lo lleva lo detecta la primera semana. Esa es una de las razones por las que en Atribuya registramos cada petición: cada comercial comparte su enlace personalizado con cada cliente, el sistema anota el momento y cruza a diario lo que se publica en la ficha con lo que se pidió. Si una reseña esperada no llega, se ve. Si llega, queda " },
    { text: "atribuida al comercial que la consiguió", href: "/blog/atribuir-resenas-google-comerciales" },
    { text: " por ventana temporal y nombre del cliente, sin pedirle a nadie que escriba nada especial en el texto." },
  ]),
  block("normal", "El mismo mecanismo protege la ficha: como la atribución se resuelve por proceso y no por el contenido de la reseña, el equipo no tiene ningún motivo para pedir menciones, ofrecer incentivos ni tocar ninguna de las líneas rojas que activan el filtro. Las alertas de reseñas de una o dos estrellas completan el circuito: te enteras de lo malo a tiempo, en lugar de descubrirlo en el informe del trimestre."),

  block("h2", "Preguntas frecuentes"),
  block("h3", "¿Por qué la reseña de mi cliente no aparece en mi ficha?"),
  block("normal", "Las tres explicaciones más probables, por orden: la reseña está en revisión (los controles automáticos pueden tardar unos días), el filtro antispam la ha retenido por algún patrón sospechoso (cuenta nueva, misma red wifi, ráfaga de reseñas) o infringe alguna política de contenido (incentivo, conflicto de interés, texto con enlaces). Pide al cliente que confirme desde su cuenta que sigue publicada y compárala con lo que ves en incógnito."),
  block("h3", "¿Google avisa cuando elimina una reseña?"),
  block("normal", "No. Google no notifica al negocio ni al autor cuando retiene o retira una reseña. La única forma de detectarlo es llevar un registro propio de reseñas pedidas frente a reseñas publicadas y revisarlo con frecuencia."),
  block("h3", "¿Cuánto tarda en aparecer una reseña de Google?"),
  block("normal", "Lo habitual es que se publique en unas horas. Puede tardar varios días si pasa una revisión adicional, algo más frecuente en fichas nuevas, tras fusiones de fichas o cuando la reseña incluye fotos. A partir de dos semanas sin aparecer, trátalo como una reseña filtrada y diagnostica."),
  block("h3", "¿Se pueden recuperar las reseñas eliminadas?"),
  block("normal", "Depende de la causa. Si Google la retiró por infringir sus políticas, no hay proceso de recuperación. Si se perdió por un error técnico o durante un cambio en la ficha, el soporte de Perfil de Empresa puede restaurarla en algunos casos. Por eso conviene agotar el diagnóstico antes de abrir el caso: si la causa es una práctica prohibida, reclamar no sirve de nada."),
  block("h3", "¿Pedir reseñas con un QR hace que se filtren?"),
  block("normal", "El QR en sí no es el problema; es una forma legítima de acercar el enlace. El riesgo está en el patrón que lo rodea: si todos los clientes reseñan desde el mismo mostrador conectados al wifi del local, las reseñas llegan desde la misma red y el filtro lo nota. Mejor que el cliente escanee y reseñe después desde su propia conexión, o que reciba el enlace por mensaje y lo abra donde quiera."),

  block("h2", "En resumen"),
  block("normal", "Si tus reseñas de Google no aparecen, no asumas que tus clientes no las dejan: lo más probable es que las dejen y el filtro las retenga. Google elimina cientos de millones de reseñas al año y no avisa a nadie. El diagnóstico empieza por confirmar con el cliente que su reseña existe, sigue por el registro de pedidas frente a publicadas y termina casi siempre en el proceso de petición: incentivos, filtrados o patrones artificiales que alguien introdujo con buena intención. La salida es pedir bien (a todos, en el momento, con enlace directo) y llevar un registro que te avise la primera semana, no el primer trimestre."),
  para([
    { text: "¿Quieres ese registro funcionando sin trabajo manual? " },
    { text: "Pide una demo de Atribuya", href: "/demo" },
    { text: " y te enseñamos cómo cruzamos a diario las reseñas de tu ficha con las peticiones de tu equipo, con cada reseña atribuida a su comercial." },
  ]),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.cumplimiento-politicas-google";
const postId = "post.resenas-google-no-aparecen-es";

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
  title: "Por qué tus reseñas de Google no aparecen (y cómo saber si te están filtrando)",
  slug: { _type: "slug", current: "resenas-google-no-aparecen" },
  excerpt:
    "Google retira reseñas sin avisar: ni email ni notificación. Las causas por las que las reseñas de tus clientes no aparecen, un diagnóstico en seis pasos y cómo recuperar el ritmo.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Reseñas de Google que no aparecen: causas y solución",
  seoDescription:
    "Google elimina reseñas sin avisar. Las causas por las que tus reseñas no aparecen, cómo diagnosticar si te están filtrando y cómo recuperar el ritmo.",
};

async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/mis-resenas.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "mis-resenas.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Panel de reseñas verificadas de Atribuya, el registro que permite detectar a tiempo si las reseñas de Google dejan de publicarse",
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
