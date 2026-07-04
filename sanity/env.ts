// Config de Sanity (blog de marketing). Con fallback "" para que el build
// pase sin env vars: la app degrada a /blog vacío y /studio con aviso.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-07-01";

/** Guard del modo degradado: sin projectId no se crea cliente ni Studio. */
export function isSanityConfigured(): boolean {
  return Boolean(projectId);
}
