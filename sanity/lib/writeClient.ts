import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/**
 * Cliente de ESCRITURA de Sanity. Solo para código server-only (scripts de
 * seed, tareas de mantenimiento). Requiere `SANITY_API_WRITE_TOKEN` con
 * permisos de Editor. Nunca importar desde un componente cliente ni exponer
 * el token al navegador.
 */
export function getWriteClient(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
  if (!token) throw new Error("Falta SANITY_API_WRITE_TOKEN.");
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}
