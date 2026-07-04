import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncPlaces } from "@/lib/google/sync-places";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Sincronización manual de reseñas vía Places API, disparada por un usuario
 * autenticado (no por Vercel Cron).
 *
 *   POST /api/sync/now
 *     body opcional: { location_id?: string }
 *
 * Reglas por rol:
 *   - admin / reviews_manager: sin body → todas las fichas con place_id.
 *                              con location_id → solo esa.
 *   - sales: ignora body; sincroniza únicamente su `profiles.location_id`
 *            (la ficha que tiene asignada).
 *   - resto: 403.
 *
 * El lock optimista de 60s ya está dentro de `syncPlaces()` por location,
 * así que dos clicks rápidos seguidos devuelven `skipped_concurrent_run`
 * para las afectadas — no hay flooding posible.
 */

type Payload = { location_id?: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, location_id")
    .eq("id", user.id)
    .maybeSingle<{ role: string; location_id: string | null }>();
  if (!profile) {
    return NextResponse.json({ error: "no_profile" }, { status: 403 });
  }

  let body: Payload = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") body = parsed as Payload;
  } catch {
    // body vacío o no-JSON → equivalente a sin filtro
  }

  // Multi-tenant (§5.1): NUNCA confiar en el location_id del cliente ni dejar
  // que `syncPlaces` barra todas las orgs. Acotamos SIEMPRE a las fichas de la
  // org del llamante. El cookie-client + RLS solo devuelve locations de su org,
  // así que la propia lectura hace de control de pertenencia.
  let locationIds: string[];

  if (profile.role === "admin" || profile.role === "reviews_manager") {
    if (typeof body.location_id === "string" && body.location_id.length > 0) {
      if (!UUID_RE.test(body.location_id)) {
        return NextResponse.json({ error: "bad_location_id" }, { status: 400 });
      }
      // Verificar pertenencia: RLS solo devuelve la ficha si es de su org.
      const { data: owned } = await supabase
        .from("locations")
        .select("id")
        .eq("id", body.location_id)
        .maybeSingle<{ id: string }>();
      if (!owned) {
        return NextResponse.json({ error: "location_not_found" }, { status: 404 });
      }
      locationIds = [owned.id];
    } else {
      // Sin location_id → todas las fichas DE SU ORG (no de todas las orgs).
      const { data: locs } = await supabase
        .from("locations")
        .select("id")
        .returns<{ id: string }[]>();
      locationIds = (locs ?? []).map((l) => l.id);
    }
  } else if (profile.role === "sales") {
    if (!profile.location_id) {
      return NextResponse.json(
        { error: "sales_without_location" },
        { status: 400 },
      );
    }
    locationIds = [profile.location_id];
  } else {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Sin fichas propias → nada que sincronizar. IMPORTANTE devolver aquí: pasar
  // un array vacío a syncPlaces desactivaría el filtro y barrería todas las orgs.
  if (locationIds.length === 0) {
    return NextResponse.json({
      ok: true,
      locations_processed: 0,
      notify_attempted: 0,
      notify_failed: 0,
      removed: 0,
      restored: 0,
      summary: [],
    });
  }

  const result = await syncPlaces({ locationIds });
  return NextResponse.json({ ok: true, ...result });
}
