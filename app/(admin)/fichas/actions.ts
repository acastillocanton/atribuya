"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireOrgContext } from "@/lib/supabase/org";
import {
  findPlaceCandidates,
  PlacesApiError,
  type PlaceCandidate,
} from "@/lib/google/places";

/**
 * Comprueba que el caller es admin y devuelve su org_id. Las acciones de
 * fichas usan service-role (saltan RLS) para esquivar el unique constraint de
 * google_place_id y los edge cases de OAuth; por eso el aislamiento de org NO
 * puede delegarse en RLS y debe imponerse aquí filtrando por este org_id.
 * El middleware ya gatea /fichas, pero el server action es una superficie HTTP
 * aparte: lo verificamos también.
 */
async function assertCanManageLocations(): Promise<
  { ok: true; orgId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const { data: actor } = await supabase
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .maybeSingle<{ role: string; org_id: string | null }>();
  if (actor?.role !== "admin") return { ok: false, error: "No autorizado." };
  if (!actor.org_id) return { ok: false, error: "Tu perfil no tiene organización asignada." };
  return { ok: true, orgId: actor.org_id };
}

const searchSchema = z.object({
  query: z.string().trim().min(3, "Escribe al menos 3 caracteres.").max(160),
});

/**
 * Busca el negocio del admin en Google (Text Search legacy) para autorrellenar
 * el Place ID en el alta de ficha. La API key vive solo en el servidor: esta
 * action es el único punto que la usa de cara al asistente. Admin-only.
 */
export async function searchPlaces(
  input: z.input<typeof searchSchema>,
): Promise<
  | { ok: true; candidates: PlaceCandidate[] }
  | { ok: false; error: string }
> {
  const auth = await assertCanManageLocations();
  if (!auth.ok) return { ok: false, error: auth.error };
  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  try {
    const candidates = await findPlaceCandidates(parsed.data.query);
    return { ok: true, candidates };
  } catch (err) {
    if (err instanceof PlacesApiError) {
      console.error("[fichas] searchPlaces Places API error:", err.code, err.message);
      return {
        ok: false,
        error: "No se pudo buscar en Google ahora mismo. Inténtalo de nuevo en un momento.",
      };
    }
    console.error("[fichas] searchPlaces failed:", err);
    return { ok: false, error: "No se pudo completar la búsqueda." };
  }
}

const createSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto.").max(120, "Demasiado largo."),
  googlePlaceId: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

export type CreateLocationInput = z.infer<typeof createSchema>;

export async function createLocation(input: CreateLocationInput) {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  // Defense in depth: stamp org_id explicitly so the RLS with_check passes
  // even if the policy expression changes shape in the future.
  let orgCtx;
  try {
    orgCtx = await requireOrgContext(supabase);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No autorizado." };
  }
  const payload = {
    name: parsed.data.name.trim(),
    google_place_id: parsed.data.googlePlaceId,
    org_id: orgCtx.orgId,
  };
  const { data: created, error } = await supabase
    .from("locations")
    .insert(payload as never)
    .select("id")
    .single<{ id: string }>();
  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una ficha con ese Google Place ID." };
    }
    console.error("[fichas] createLocation failed:", error);
    return { error: "No se pudo crear la ficha." };
  }
  revalidatePath("/fichas");
  return { ok: true, id: created?.id ?? null };
}

const linkSchema = z.object({
  locationId: z.string().uuid(),
  googleAccountId: z.string().min(1), // "accounts/123"
  googleLocationResource: z.string().min(1), // "accounts/123/locations/456"
  googlePlaceId: z.string().optional().nullable(),
});

/**
 * Vincula una ficha de nuestra DB con una ficha concreta de Google Business
 * Profile. Persiste los IDs en `locations` y marca oauth_status='connected'.
 * Tras esto, el cron de sync ya puede pedir reseñas para esta ficha.
 */
export async function linkGoogleLocation(input: z.input<typeof linkSchema>) {
  const auth = await assertCanManageLocations();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  // Service client para esquivar RLS, pero filtrando por org_id del actor:
  // sin ese filtro un admin podría conectar OAuth a una ficha de otra org.
  const admin = createServiceClient();
  const update: Record<string, unknown> = {
    google_account_id: parsed.data.googleAccountId,
    google_location_resource: parsed.data.googleLocationResource,
    oauth_status: "connected",
    oauth_last_sync_error: null,
  };
  if (parsed.data.googlePlaceId) {
    update.google_place_id = parsed.data.googlePlaceId;
  }
  const { data: updated, error } = await admin
    .from("locations")
    .update(update as never)
    .eq("id", parsed.data.locationId)
    .eq("org_id", auth.orgId)
    .select("id");
  if (error) {
    console.error("[fichas] linkGoogleLocation failed:", error);
    return { ok: false as const, error: error.message };
  }
  if (!updated || updated.length === 0) {
    return { ok: false as const, error: "Ficha no encontrada." };
  }
  revalidatePath("/fichas");
  return { ok: true as const };
}

/**
 * Desconecta Google de una ficha: borra tokens, vacía resource y baja
 * oauth_status a 'disconnected'. El cron deja de pedir reseñas para ella.
 */
export async function disconnectGoogleLocation(locationId: string) {
  if (!locationId) return { error: "Id inválido." };
  const auth = await assertCanManageLocations();
  if (!auth.ok) return { error: auth.error };
  const admin = createServiceClient();
  // Verificamos que la ficha es de la org del actor ANTES de borrar nada:
  // location_secrets se borra por location_id (no lleva org_id propio), así
  // que esta comprobación es lo que impide desconectar/borrar tokens de una
  // ficha de otra org.
  const { data: owned } = await admin
    .from("locations")
    .select("id")
    .eq("id", locationId)
    .eq("org_id", auth.orgId)
    .maybeSingle<{ id: string }>();
  if (!owned) return { error: "Ficha no encontrada." };
  // Tokens fuera. Si falla aquí abortamos: dejar la location en
  // disconnected con un refresh_token vivo en location_secrets sería un
  // estado inconsistente (el cron no la procesaría pero el secreto
  // seguiría en BD).
  const { error: secretsErr } = await admin
    .from("location_secrets")
    .delete()
    .eq("location_id", locationId);
  if (secretsErr) {
    console.error(
      "[fichas] disconnectGoogleLocation failed deleting secrets:",
      secretsErr,
    );
    return { error: `No se pudieron borrar los tokens: ${secretsErr.message}` };
  }
  // Estado a disconnected y campos OAuth a null.
  const { error } = await admin
    .from("locations")
    .update({
      google_account_id: null,
      google_location_resource: null,
      google_account_email: null,
      oauth_status: "disconnected",
      oauth_last_sync_at: null,
      oauth_last_sync_error: null,
    } as never)
    .eq("id", locationId)
    .eq("org_id", auth.orgId);
  if (error) {
    console.error("[fichas] disconnectGoogleLocation failed:", error);
    return { error: error.message };
  }
  revalidatePath("/fichas");
  return { ok: true };
}

const placeIdSchema = z.object({
  locationId: z.string().uuid("Id inválido."),
  googlePlaceId: z
    .string()
    .max(250)
    .nullable()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null))
    .refine(
      (v) => v === null || /^[A-Za-z0-9_\-]{10,250}$/.test(v),
      "Place ID inválido. Debe tener 10-250 caracteres alfanuméricos, '_' o '-'.",
    ),
});

/**
 * Permite al admin editar el `google_place_id` de una ficha después de
 * crearla. Útil para fichas creadas antes de que la cuota oficial de
 * Business Profile estuviera disponible: el Place ID se rellena a mano y
 * habilita el cron de Places API (que solo necesita esto, no OAuth).
 */
export async function updateLocationPlaceId(input: z.input<typeof placeIdSchema>) {
  const auth = await assertCanManageLocations();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = placeIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  // Service client: /fichas es admin-only por middleware, pero el unique
  // constraint sobre google_place_id puede chocar con RLS de update. Mejor
  // bypasear y dejar que la unique decida. Filtramos por org_id para que el
  // bypass de RLS no permita editar el Place ID de una ficha de otra org.
  const admin = createServiceClient();
  const { data: updated, error } = await admin
    .from("locations")
    .update({ google_place_id: parsed.data.googlePlaceId } as never)
    .eq("id", parsed.data.locationId)
    .eq("org_id", auth.orgId)
    .select("id");
  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, error: "Ya existe otra ficha con ese Place ID." };
    }
    console.error("[fichas] updateLocationPlaceId failed:", error);
    return { ok: false as const, error: error.message };
  }
  if (!updated || updated.length === 0) {
    return { ok: false as const, error: "Ficha no encontrada." };
  }
  revalidatePath("/fichas");
  return { ok: true as const };
}

export async function deleteLocation(id: string) {
  if (!id || typeof id !== "string") {
    return { error: "Id inválido." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) {
    console.error("[fichas] deleteLocation failed:", error);
    return { error: "No se pudo eliminar." };
  }
  revalidatePath("/fichas");
  return { ok: true };
}
