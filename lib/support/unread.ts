import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Conteo de conversaciones de soporte con mensajes no leídos para el usuario
 * actual, scopeado a su org y su rol por la propia función Postgres
 * (`support_unread_count()`, migración 016, SECURITY DEFINER).
 *
 * Best-effort: si Supabase no está configurado, el RPC falla o no hay sesión,
 * devuelve 0 — el badge simplemente no se pinta. Nunca lanza: se llama desde
 * los layouts y un fallo del helpdesk no debe tumbar la navegación.
 */
export async function getSupportUnreadCount(
  supabase: ServerSupabaseClient,
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc("support_unread_count");
    if (error) return 0;
    return typeof data === "number" ? data : 0;
  } catch {
    return 0;
  }
}
