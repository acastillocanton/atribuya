import type { NextConfig } from "next";

// Content-Security-Policy permisivo pero efectivo. Lo que se permite:
//  - default-src 'self': nada de terceros por defecto.
//  - img-src https: + data: + blob: para avatares de Storage público
//    (app.atribuya.es/storage/...), QR generados in-line,
//    placeholders, etc.
//  - script-src con 'unsafe-inline' + 'unsafe-eval': Next.js 15 necesita
//    ambos en producción para hidratación de Server Components y RSC payload.
//    No se puede apretar más sin migrar a nonce-based (Next no lo soporta
//    aún para todo el árbol). Aceptable porque no aceptamos input HTML.
//  - style-src 'unsafe-inline': la app usa style={{...}} extensivamente.
//  - connect-src: Supabase (REST + Realtime WS), Google APIs (mybusiness*).
//  - frame-ancestors 'none' equivale a X-Frame-Options: DENY moderno.
//  - form-action 'self' impide secuestros de form submit.
const CSP = [
  "default-src 'self'",
  "img-src 'self' https: data: blob:",
  // googletagmanager.com sirve el gtag.js de Google Analytics 4. Solo se carga
  // tras el consentimiento del usuario (banner) y en páginas públicas.
  // core.sanity-cdn.com sirve el bridge.js del Studio embebido de Sanity.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://core.sanity-cdn.com",
  // fonts.googleapis.com es el CSS de Google Fonts (Inter); fonts.gstatic.com
  // sirve los .woff2 reales.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Google APIs (mybusiness*) + endpoints de recogida de GA4 (g/collect, que
  // usa subdominios regionales como region1.google-analytics.com).
  // Sanity: el Studio embebido en /studio habla con <projectId>.api.sanity.io
  // (REST + login + listeners WebSocket), apicdn.sanity.io (CDN de datos),
  // cdn.sanity.io (assets/imágenes vía fetch) y sanity-cdn.com (auto-update de
  // los módulos del Studio).
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.sanity.io https://*.api.sanity.io wss://*.api.sanity.io https://*.apicdn.sanity.io https://cdn.sanity.io https://sanity-cdn.com https://*.sanity-cdn.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

// Defensa en profundidad contra indexación. El meta tag en app/layout.tsx
// solo viaja en respuestas HTML; este header cubre redirects 302 (/c/...),
// JSON de las API routes y cualquier respuesta no-HTML.
//
// IMPORTANTE: NO puede aplicarse a `/:path*`. Las páginas públicas indexables
// (landing ES `/` y EN `/en`, legales ES `/terminos`+`/privacidad` y EN
// `/en/terms`+`/en/privacy`, y el blog `/blog`+`/en/blog` con sus posts)
// llevan el meta `robots: { index: true }`, pero el header HTTP X-Robots-Tag
// gana sobre el meta tag (Google aplica la directiva más restrictiva), así
// que ponerlo global las marcaba como noindex → "Excluida por noindex" en
// Search Console. Lo aplicamos a todo MENOS esas páginas + los ficheros de
// crawl, con el mismo negative-lookahead que usa el matcher del middleware.
const NOINDEX_HEADERS = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
];
const INDEXABLE_PATHS_NEGATIVE_LOOKAHEAD =
  "/((?!$|en$|en/terms$|en/privacy$|terminos$|privacidad$|producto$|precios$|casos$|demo$|como-funciona$|en/product$|en/pricing$|en/case-studies$|en/demo$|en/how-it-works$|blog$|blog/.*|en/blog$|en/blog/.*|sitemap\\.xml$|robots\\.txt$).*)";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fija el workspace root del proyecto. Sin esto, Next >=15.5 detecta el
  // package-lock.json huérfano del home del usuario y elige /Users/...
  // como root, lo que rompe tanto el dev server (Turbopack pide leer
  // ~/Documents y macOS responde permiso denegado de TCC) como el build
  // (Cannot find module for page: /_document). Apuntar a __dirname
  // restaura el comportamiento correcto en ambos modos.
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  // Imágenes del blog: Sanity las sirve desde su CDN.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: INDEXABLE_PATHS_NEGATIVE_LOOKAHEAD,
        headers: NOINDEX_HEADERS,
      },
    ];
  },
};

export default nextConfig;
