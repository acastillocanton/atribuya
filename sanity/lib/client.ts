import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

let client: SanityClient | null = null;

/**
 * Cliente de lectura (solo publicados). `null` si Sanity no está configurado.
 *
 * Usa `SANITY_API_READ_TOKEN` (permiso Viewer, server-only) porque el dataset
 * público del proyecto no sirve lecturas anónimas por la API. El token nunca
 * llega al navegador: este cliente solo se usa en Server Components y route
 * handlers. Sin token, degrada a lectura anónima por CDN (comportamiento
 * previo), útil para builds/preview sin el secreto.
 */
export function getClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;
  const token = process.env.SANITY_API_READ_TOKEN || undefined;
  client ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: !token,
    perspective: "published",
    token,
  });
  return client;
}
