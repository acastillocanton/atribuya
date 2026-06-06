import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentOrgContext } from "@/lib/supabase/org";
import { parseRange } from "@/lib/date-range";
import {
  buildSalesReport,
  buildSalesReportFilename,
  type SalesReportReview,
} from "@/lib/reports/sales-report";
import type { Role } from "@/lib/supabase/types";

/**
 * Excel propio de un comercial: cabecera (nombre, fecha incorporación,
 * ficha, periodo, total) + tabla con sus reseñas `counted` no duplicadas
 * del rango.
 *
 * Query params:
 *   • from / to (yyyy-mm-dd, default mes en curso).
 *
 * Acceso (multi-tenant — Atribuya no tiene rol office_director):
 *   • admin, reviews_manager → cualquier sales_id DE SU PROPIA ORG.
 *   • sales → solo self (autoservicio desde /panel/resenas).
 *
 * Las reseñas y el perfil destino se cargan vía service-client (bypassa RLS),
 * así que el aislamiento cross-org se garantiza filtrando EXPLÍCITAMENTE por
 * `org_id` (derivado del servidor, nunca del cliente): un admin de la org A no
 * puede exportar el Excel de un comercial de la org B aunque fuerce el UUID.
 */

export const runtime = "nodejs";

const idSchema = z.string().uuid();

type ProfileRow = {
  id: string;
  full_name: string;
  joined_at: string | null;
  role: Role;
  location: { name: string } | null;
};

type ReviewRow = {
  google_created_at: string;
  rating: number;
  author_name: string;
  client: { full_name: string } | null;
  location: { google_place_id: string | null } | null;
};

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const salesId = parsed.data;

  const url = new URL(request.url);
  const range = parseRange(
    url.searchParams.get("from"),
    url.searchParams.get("to"),
    new Date(),
  );

  // Auth + contexto de org del usuario actual (cookie-client).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const orgCtx = await getCurrentOrgContext(supabase);
  if (!orgCtx?.orgId) {
    return NextResponse.json({ error: "no_org" }, { status: 403 });
  }
  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: Role }>();
  const actorRole = actorProfile?.role ?? null;
  if (
    actorRole !== "admin" &&
    actorRole !== "reviews_manager" &&
    actorRole !== "sales"
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  // Sales: solo puede exportar su propio Excel.
  if (actorRole === "sales" && salesId !== user.id) {
    return NextResponse.json({ error: "forbidden_scope" }, { status: 403 });
  }

  // Service-client desde aquí (bypassa RLS) → filtramos por org_id en código
  // como única línea de defensa contra fugas cross-org.
  const admin = createServiceClient();
  const { data: target } = await admin
    .from("profiles")
    .select("id, full_name, joined_at, role, location:locations(name)")
    .eq("id", salesId)
    .eq("org_id", orgCtx.orgId)
    .eq("role", "sales")
    .maybeSingle<ProfileRow>();
  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Reviews del comercial filtradas (anti-fraude mig 015):
  //   counted + no duplicada + no eliminada + en rango + de su org.
  const { data: reviewsRaw, error: reviewsErr } = await admin
    .from("reviews")
    .select(
      "google_created_at, rating, author_name, client:clients(full_name), location:locations(google_place_id)",
    )
    .eq("sales_id", salesId)
    .eq("org_id", orgCtx.orgId)
    .eq("match_state", "counted")
    .eq("is_duplicate", false)
    .is("removed_at", null)
    .gte("google_created_at", range.startIso)
    .lt("google_created_at", range.endIso)
    .order("google_created_at", { ascending: false })
    .returns<ReviewRow[]>();

  if (reviewsErr) {
    console.error("[export/sales] reviews query failed:", reviewsErr);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const reviews: SalesReportReview[] = (reviewsRaw ?? []).map((r) => ({
    google_created_at: r.google_created_at,
    rating: r.rating,
    author_name: r.author_name,
    client_name: r.client?.full_name ?? null,
    place_id: r.location?.google_place_id ?? null,
  }));

  const buffer = await buildSalesReport({
    profile: {
      full_name: target.full_name,
      joined_at: target.joined_at,
      location_name: target.location?.name ?? null,
    },
    range,
    reviews,
  });

  const filename = buildSalesReportFilename(target.full_name, range);
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
