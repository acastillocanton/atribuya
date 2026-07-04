import type { MetadataRoute } from "next";

// Superficie pública indexable (landing comercial + legales + blog) y rutas
// privadas de la app que NO deben rastrearse. Se reutiliza en la regla general
// y en la de cada bot de IA para no duplicar.
const ALLOW = ["/", "/en", "/terminos", "/privacidad", "/blog"];
const DISALLOW = [
  "/studio",
  "/login",
  "/accept-invite",
  "/auth/",
  "/dashboard",
  "/panel",
  "/clientes",
  "/comerciales",
  "/gestores",
  "/fichas",
  "/manager",
  "/ranking",
  "/perfil",
  "/ayuda",
  "/soporte",
  "/resenas",
  "/super",
  "/o/",
  "/c/",
  "/api/",
];

// Bots de LLMs/IA a los que damos permiso EXPLÍCITO para rastrear, citar y
// compartir el contenido público (búsqueda con IA, respuestas citadas,
// resúmenes, entrenamiento). Muchos de estos rastreadores son opt-in por
// User-Agent: sin una regla propia, algunos no rastrean o asumen bloqueo.
// Reciben el mismo permiso que el resto (público sí, app interna no).
const LLM_BOTS = [
  "GPTBot", // OpenAI (entrenamiento)
  "OAI-SearchBot", // OpenAI (búsqueda / citas en ChatGPT)
  "ChatGPT-User", // OpenAI (navegación a petición del usuario)
  "ClaudeBot", // Anthropic
  "Claude-User", // Anthropic (navegación a petición del usuario)
  "Claude-SearchBot", // Anthropic (búsqueda)
  "anthropic-ai", // Anthropic (legado)
  "PerplexityBot", // Perplexity (índice)
  "Perplexity-User", // Perplexity (a petición del usuario)
  "Google-Extended", // Google (Gemini / Vertex AI)
  "Applebot-Extended", // Apple Intelligence
  "CCBot", // Common Crawl (base de muchos LLMs)
  "Meta-ExternalAgent", // Meta AI
  "Amazonbot", // Amazon
  "Bytespider", // ByteDance
];

// Atribuya: la landing comercial y las páginas legales son públicas e
// indexables; el resto de la app NO debe aparecer en buscadores ni en LLMs.
// Las rutas privadas además están protegidas por el filtro de User-Agent del
// middleware, así que esto es defensa en profundidad.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      ...LLM_BOTS.map((userAgent) => ({
        userAgent,
        allow: ALLOW,
        disallow: DISALLOW,
      })),
    ],
    sitemap: "https://atribuya.com/sitemap.xml",
  };
}
