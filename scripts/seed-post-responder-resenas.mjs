// Publica el artículo #7 "Cómo responder reseñas de Google (guía con plantillas)"
// (Pilar C, personas Marta+Laura, keyword «responder reseñas negativas Google»)
// vía API de escritura de Sanity. Reutiliza el autor existente
// (author.castillo-canton) y crea la categoría "Reputación local".
//
// Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
// SANITY_API_WRITE_TOKEN (Editor).
//
// Uso:
//   node scripts/seed-post-responder-resenas.mjs          # crea si no existe
//   node scripts/seed-post-responder-resenas.mjs --force  # reescribe el cuerpo
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
const quote = (text) => block("blockquote", text);

// --- Cuerpo ------------------------------------------------------------------
const body = [
  para([
    { text: "En corto: ", marks: ["strong"] },
    { text: "responde a todas las reseñas de Google, buenas y malas, rápido y sin sonar a robot. La respuesta no la escribes para quien opinó: la escribes para las decenas de personas que leerán esa conversación antes de decidir si te compran. En esta guía tienes el método completo y plantillas listas para adaptar a cada situación, incluida la más difícil: la reseña negativa injusta. Con una advertencia desde el principio: la plantilla es el punto de partida, no la respuesta. Copiarla tal cual se nota, y se paga." },
  ]),

  block("h2", "Por qué responder a todas, con datos"),
  para([
    { text: "La " },
    { text: "Local Consumer Review Survey de BrightLocal", href: "https://www.brightlocal.com/research/local-consumer-review-survey/" },
    { text: " de 2026 deja el argumento hecho: el 80% de los consumidores se declara dispuesto a usar un negocio que responde a todas sus reseñas, el 42% descarta a los que no responden nunca y, atención a esta, las respuestas genéricas de plantilla echan para atrás al 50%. Responder solo a las buenas, o solo a las malas, tampoco funciona: el lector percibe el sesgo." },
  ]),
  para([
    { text: "Google, por su parte, recomienda responder y lo facilita desde el propio " },
    { text: "Perfil de Empresa", href: "https://support.google.com/business/answer/3474050" },
    { text: ". La respuesta aparece pública, justo debajo de la reseña, firmada por el negocio. Ese es el escenario: un escaparate, no un buzón de quejas." },
  ]),

  block("h2", "Los cuatro principios antes de tocar una plantilla"),
  num([
    { text: "Escribe para el próximo cliente, no para el que opina. ", marks: ["strong"] },
    { text: "El cliente enfadado quizá no vuelva; el que está decidiendo esta noche dónde gastar su dinero leerá tu respuesta entera. Cada respuesta a una reseña negativa es una demostración pública de cómo tratas a la gente cuando algo sale mal." },
  ]),
  num([
    { text: "Responde pronto. ", marks: ["strong"] },
    { text: "Una respuesta la primera semana vale el doble que la misma respuesta al mes. Para las reseñas de una o dos estrellas, el plazo se mide en horas, no en días; ahí es donde una alerta inmediata marca la diferencia." },
  ]),
  num([
    { text: "Sé concreto o no parecerás humano. ", marks: ["strong"] },
    { text: "Un detalle real (el día, el servicio, lo que has cambiado desde entonces) convierte una respuesta corporativa en una conversación creíble. La concreción es lo que separa tu respuesta de la del 50% que aburre con frases hechas." },
  ]),
  num([
    { text: "Nunca discutas ni desveles datos. ", marks: ["strong"] },
    { text: "Sin sarcasmo, sin acusaciones, sin detalles de la relación comercial del cliente. En sectores sensibles como clínicas, ni siquiera confirmes que la persona es paciente: agradece, responde en general e invita al canal privado. La confidencialidad va antes que la razón." },
  ]),

  block("h2", "Plantillas para reseñas positivas"),
  block("normal", "La tentación es no responderlas. Error: son la mitad del escaparate y cuestan un minuto. Tres situaciones típicas; sustituye los corchetes y añade siempre un detalle propio:"),
  block("h3", "Reseña positiva con detalle"),
  quote("Mil gracias, [nombre]. Nos alegra especialmente que destaques [el detalle que menciona], porque es justo donde el equipo pone más cuidado. Te esperamos pronto."),
  block("h3", "Reseña positiva escueta (el clásico «todo bien»)"),
  quote("Gracias por la confianza, [nombre]. Si la próxima vez hay algo que podamos hacer aún mejor, nos encantará saberlo. Un saludo del equipo de [negocio]."),
  block("h3", "Reseña que menciona a una persona del equipo"),
  quote("Gracias, [nombre]. Le pasamos tu comentario a [nombre del empleado], que se va a alegrar mucho: reconocer el trabajo bien hecho también se nota dentro del equipo."),
  para([
    { text: "Ese último caso, cuando el cliente menciona por iniciativa propia a quien le atendió, es oro interno: permite reconocer al empleado y reforzar la cultura de servicio. Lo que no puedes hacer es pedirle al cliente que incluya ese nombre, como explicamos en " },
    { text: "cómo pedir reseñas sin saltarte las políticas", href: "/blog/pedir-resenas-google-sin-infringir-politicas" },
    { text: "." },
  ]),

  block("h2", "Plantillas para reseñas negativas"),
  block("normal", "El método en cuatro movimientos: reconoce sin excusas, da el contexto en una frase, cuenta qué has cambiado y ofrece un canal privado para rematar. Cuatro situaciones:"),
  block("h3", "Queja con razón"),
  quote("Tienes razón, [nombre], y te pedimos disculpas. [Una frase de contexto honesto: ese día faltaba parte del equipo / el pedido salió tarde]. Desde entonces [qué has cambiado en concreto]. Nos encantaría poder contártelo en persona: escríbenos a [email o teléfono] y lo arreglamos."),
  block("h3", "Queja por un malentendido"),
  quote("Gracias por contárnoslo, [nombre]. Creemos que hubo un malentendido con [el punto concreto]: [aclaración en una frase, sin tono de reproche]. Aun así, sentimos que la experiencia no fuera buena. Si nos escribes a [contacto], lo revisamos contigo encantados."),
  block("h3", "Reseña de alguien que no consta como cliente"),
  quote("Gracias por el mensaje. No encontramos ninguna visita ni pedido con estos datos, así que nos gustaría entender qué ha pasado. Si has sido cliente nuestro, escríbenos a [contacto] y lo revisamos de inmediato."),
  para([
    { text: "Esta respuesta neutra hace dos cosas sin acusar a nadie: le dice al lector que tienes registros y deja constancia pública de que has intentado verificar. Si sospechas que la reseña incumple las políticas, denúnciala además por el cauce oficial; el porqué de que Google borre menos de lo que crees lo contamos en " },
    { text: "por qué tus reseñas de Google no aparecen", href: "/blog/resenas-google-no-aparecen" },
    { text: "." },
  ]),
  block("h3", "Una estrella sin texto"),
  quote("Hola, [nombre]. Vemos tu valoración pero no sabemos qué ha fallado, y nos gustaría arreglarlo. ¿Nos escribes a [contacto] y nos lo cuentas? Lo revisamos personalmente."),
  para([
    { text: "Estas siete plantillas cubren lo esencial. Si quieres la biblioteca completa, hemos preparado un ", marks: [] },
    { text: "pack gratuito con 20 plantillas de respuesta en Word", href: "/recursos/plantillas-respuesta-resenas", marks: ["strong"] },
    { text: ": positivas, negativas, casos delicados (reseñas falsas, exempleados, amenazas de reclamación) y sectores con confidencialidad como clínicas o asesorías." },
  ]),

  block("h2", "Lo que no debes hacer jamás"),
  li([
    { text: "Ofrecer algo a cambio de que retiren o suavicen la reseña. ", marks: ["strong"] },
    { text: "Las políticas de Google lo prohíben igual que comprar reseñas. Lo correcto es resolver el problema de verdad; si después el cliente decide actualizar su reseña por iniciativa propia, estupendo, pero la iniciativa tiene que ser suya." },
  ]),
  li([
    { text: "Discutir los hechos en público. ", marks: ["strong"] },
    { text: "Aunque tengas toda la razón. El lector no ve un negocio con razón, ve un negocio a la defensiva. El sitio para los matices es el canal privado." },
  ]),
  li([
    { text: "Revelar información del cliente. ", marks: ["strong"] },
    { text: "Nada de fechas de tratamiento, importes, historial ni circunstancias personales. Además de feo, puede ser una infracción de protección de datos." },
  ]),
  li([
    { text: "Responder en caliente. ", marks: ["strong"] },
    { text: "La reseña injusta duele. Escribe el borrador, déjalo reposar una hora y quítale todo lo que no leería con orgullo tu próximo cliente." },
  ]),

  block("h2", "Cómo organizarlo en equipo sin que se escape ninguna"),
  para([
    { text: "En un negocio con volumen, el problema no es redactar: es enterarse a tiempo y saber quién responde. Tres piezas bastan. Primera, un responsable claro por ficha (una sola voz pública, aunque varias personas preparen borradores). Segunda, alertas inmediatas para las reseñas de una o dos estrellas, que son las que no pueden esperar al repaso semanal. Tercera, contexto: saber qué cliente es y quién le atendió convierte una respuesta genérica en una concreta. Ahí es donde Atribuya ayuda más de lo que parece: como cada reseña queda " },
    { text: "atribuida al comercial que la consiguió", href: "/blog/atribuir-resenas-google-comerciales" },
    { text: ", quien responde sabe de qué venta viene, quién atendió y qué pasó, sin preguntar por tres canales. Las alertas de reseñas negativas llegan por email en cuanto se detectan." },
  ]),

  block("h2", "Preguntas frecuentes"),
  block("h3", "¿Hay que responder a todas las reseñas, también a las positivas?"),
  block("normal", "Sí. Los datos de BrightLocal muestran que responder solo a una parte convence menos que responder a todas, y el lector nota el sesgo. Las positivas se despachan en un minuto con agradecimiento y un detalle propio; las negativas llevan más cuidado y más recompensa."),
  block("h3", "¿Cuánto puedo tardar en responder?"),
  block("normal", "Cuanto antes, mejor. Como regla práctica: las reseñas de una o dos estrellas, en el día; el resto, dentro de la semana. Una respuesta tardía pierde gran parte de su efecto sobre quien está leyendo la ficha hoy."),
  block("h3", "¿Puedo pedirle al cliente que borre o cambie su reseña negativa?"),
  block("normal", "No a cambio de nada, nunca: ofrecer una compensación por retirar o mejorar una reseña infringe las políticas de Google. Lo correcto es resolver el problema por el canal privado; si el cliente, ya satisfecho, decide actualizar su reseña por su cuenta, es legítimo y ocurre más a menudo de lo que se piensa."),
  block("h3", "¿Qué hago si la reseña es falsa o de alguien que nunca fue cliente?"),
  block("normal", "Responde en público con la plantilla neutra de esta guía (no encontramos ningún registro con estos datos, escríbenos y lo revisamos) y denúnciala por el cauce oficial indicando la política concreta que incumple. No acuses a nadie en público: el lector no puede verificar tu acusación, pero sí tu tono."),
  block("h3", "¿Responder a las reseñas mejora el posicionamiento local?"),
  block("normal", "Google recomienda responder e indica que la interacción con las reseñas forma parte de una ficha bien gestionada. El efecto directo sobre el ranking no está cuantificado públicamente, así que la razón principal sigue siendo la conversión: el 80% de los consumidores prefiere negocios que responden a todo."),

  block("h2", "En resumen"),
  block("normal", "Responder reseñas es de las pocas acciones de marketing que son gratis, públicas y acumulativas. El método cabe en una frase: responde a todas, pronto, con un detalle concreto y sin discutir jamás en público. Las plantillas de esta guía te quitan el folio en blanco; la personalización la pones tú, porque la mitad de los consumidores detecta y castiga la respuesta enlatada. Para llegar a tiempo a las que importan, las de una y dos estrellas, necesitas enterarte en horas: eso ya no es cuestión de redacción sino de sistema."),
  para([
    { text: "Si quieres las alertas de reseñas negativas y el contexto de cada reseña (qué cliente, qué comercial, qué venta) funcionando sin trabajo manual, " },
    { text: "pide una demo de Atribuya", href: "/demo" },
    { text: " y te lo enseñamos con tu propia ficha." },
  ]),
];

// --- Documentos --------------------------------------------------------------
const authorId = "author.castillo-canton";
const categoryId = "category.reputacion-local";
const postId = "post.responder-resenas-google-es";

const category = {
  _id: categoryId,
  _type: "category",
  title: "Reputación local",
  slug: { _type: "slug", current: "reputacion-local" },
};

const post = {
  _id: postId,
  _type: "post",
  language: "es",
  title: "Cómo responder reseñas de Google: guía con plantillas listas para adaptar",
  slug: { _type: "slug", current: "responder-resenas-google" },
  excerpt:
    "Responde a todas, pronto y sin sonar a robot: el método en cuatro principios y plantillas para cada situación, de la reseña positiva escueta a la negativa injusta.",
  author: { _type: "reference", _ref: authorId },
  categories: [{ _type: "reference", _ref: categoryId, _key: key() }],
  seoTitle: "Cómo responder reseñas de Google: guía y plantillas",
  seoDescription:
    "Guía práctica para responder reseñas de Google: método en cuatro principios, plantillas para positivas y negativas, errores prohibidos y cómo organizarlo en equipo.",
};

async function uploadCover() {
  const buffer = readFileSync(new URL("../public/landing/dashboard.png", import.meta.url));
  const asset = await client.assets.upload("image", buffer, { filename: "dashboard.png" });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Dashboard de Atribuya con las reseñas de Google del equipo, punto de partida para responder a tiempo a cada reseña",
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
