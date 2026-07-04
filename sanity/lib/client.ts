import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

let client: SanityClient | null = null;

/** Cliente de lectura (CDN, solo publicados). `null` si Sanity no está configurado. */
export function getClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;
  client ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: "published",
  });
  return client;
}
