import type { MetadataRoute } from "next";

// Atribuya: la landing comercial y las páginas legales son públicas e
// indexables; el resto de la app (dashboard, panel, /o/.../c/..., login,
// auth, accept-invite) NO debe aparecer en buscadores. Las rutas privadas
// además están protegidas por el filtro de User-Agent del middleware, así
// que esto es defensa en profundidad.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/en", "/terminos", "/privacidad", "/blog"],
        disallow: [
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
        ],
      },
    ],
  };
}
