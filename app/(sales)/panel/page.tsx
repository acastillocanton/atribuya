import Link from "next/link";
import { Users } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { SyncNowButton } from "@/components/ui/SyncNowButton";

// Forzamos render dinámico: la página usa `new Date()` para proyección ETA
// y deltas vs mes pasado. Si Next cachea la respuesta, los relativos
// quedan stale.
export const dynamic = "force-dynamic";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Ring } from "@/components/charts/Ring";
import { RangePicker } from "@/components/ui/RangePicker";
import { BadgesCard } from "@/components/panel/BadgesCard";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrgContext } from "@/lib/supabase/org";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { buildShareDisplay, buildShareUrl } from "@/lib/share-link";
import { getLeaderboard } from "@/lib/leaderboard";
import { computePanelBadges, type PanelBadge } from "@/lib/panel-badges";
import { formatEuro } from "@/lib/utils";
import {
  parseRange,
  commissionShortcuts,
  commissionPeriodRange,
  previousCommissionPeriodRange,
  isCommissionPeriod,
  isFullNaturalMonth,
  lastMonthRange,
  thisMonthRange,
  bucketByMonth,
  type DateRange,
} from "@/lib/date-range";
import { CopyLinkButton } from "./CopyLinkButton";

const MONTH_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Formatea el `to` (yyyy-mm-dd) de un periodo como "19 jun". */
function formatCloseDate(toYmd: string): string {
  const [, m, d] = toYmd.split("-").map(Number);
  return `${d} ${MONTH_ABBR[(m ?? 1) - 1] ?? ""}`;
}

type PanelData = {
  name: string;
  slug: string;
  /** Slug of the sales' org — required to build the path-prefix landing URL. */
  orgSlug: string;
  /** Reseñas contabilizadas (abonables) en el rango. */
  counted: number;
  /** Reseñas pendientes de verificar en el rango. */
  pending: number;
  goal: number;
  /** Reseñas contabilizadas del periodo anterior. null si no aplica comparativa. */
  prevCounted: number | null;
  links: number;
  avgRating: number | null;
  /** Tarifa €/reseña del comercial. null = sin configurar. */
  commissionRate: number | null;
};

type PanelSearchParams = Promise<{ from?: string; to?: string }>;

const DEMO_DATA: PanelData = {
  name: "Mateo Salgado",
  slug: "mateo-salgado",
  orgSlug: "demo",
  counted: 74,
  pending: 3,
  goal: 80,
  prevCounted: 65,
  links: 96,
  avgRating: 4.8,
  commissionRate: 20,
};

async function loadPanelData(
  range: DateRange,
  prevRange: DateRange | null,
): Promise<PanelData> {
  if (!isSupabaseConfigured()) return DEMO_DATA;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEMO_DATA;

  const profileRes = await supabase
    .from("profiles")
    .select("full_name, slug, monthly_goal, commission_rate, organizations:organizations(slug)")
    .eq("id", user.id)
    .maybeSingle<{
      full_name: string;
      slug: string;
      monthly_goal: number;
      commission_rate: number | null;
      organizations: { slug: string } | null;
    }>();

  if (!profileRes.data || !profileRes.data.organizations?.slug) return DEMO_DATA;

  const baseQueries = [
    // Reseñas del rango con su estado para separar counted (abonables) de pending.
    supabase
      .from("reviews")
      .select("rating, match_state")
      .eq("sales_id", user.id)
      .is("removed_at", null)
      .eq("is_duplicate", false)
      .in("match_state", ["counted", "pending"])
      .gte("google_created_at", range.startIso)
      .lt("google_created_at", range.endIso)
      .returns<{ rating: number; match_state: string }[]>(),
    supabase
      .from("share_links")
      .select("id", { count: "exact", head: true })
      .eq("sales_id", user.id)
      .gte("opened_at", range.startIso)
      .lt("opened_at", range.endIso),
  ] as const;

  // Comparativa con el periodo anterior (mismo tipo de rango): solo counted.
  const prevQuery = prevRange
    ? supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("sales_id", user.id)
        .is("removed_at", null)
        .eq("is_duplicate", false)
        .eq("match_state", "counted")
        .gte("google_created_at", prevRange.startIso)
        .lt("google_created_at", prevRange.endIso)
    : null;

  const [reviewsRange, links, reviewsPrev] = await Promise.all([
    baseQueries[0],
    baseQueries[1],
    prevQuery ?? Promise.resolve(null),
  ]);

  const rows = reviewsRange.data ?? [];
  const counted = rows.filter((r) => r.match_state === "counted").length;
  const pending = rows.filter((r) => r.match_state === "pending").length;
  const avgRating =
    rows.length === 0
      ? null
      : rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;

  return {
    name: profileRes.data.full_name,
    slug: profileRes.data.slug,
    orgSlug: profileRes.data.organizations.slug,
    counted,
    pending,
    prevCounted: reviewsPrev ? reviewsPrev.count ?? 0 : null,
    links: links.count ?? 0,
    goal: profileRes.data.monthly_goal,
    avgRating,
    commissionRate: profileRes.data.commission_rate,
  };
}

/**
 * Insignias del comercial — calculadas al vuelo (sin tabla). Devuelve null en
 * modo demo o sin sesión. Las queries de reseñas propias pasan por RLS; el
 * ranking org-global usa `getLeaderboard(privileged)` porque el rol sales no
 * puede leer perfiles de sus compañeros.
 */
async function loadPanelBadges(now: Date): Promise<PanelBadge[] | null> {
  if (!isSupabaseConfigured()) {
    // Modo demo: insignias de ejemplo coherentes con DEMO_DATA (Mateo Salgado:
    // 74 reseñas del mes, objetivo 80, 2º del equipo de 6).
    return computePanelBadges({
      lifetimeCounted: 312,
      reviewsThisPeriod: 74,
      goal: 80,
      monthBuckets: [58, 66, 71, 80, 83, 74],
      fiveStarCount: 41,
      rankIndex: 1,
      teamSize: 6,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profileRes = await supabase
    .from("profiles")
    .select("monthly_goal")
    .eq("id", user.id)
    .maybeSingle<{ monthly_goal: number }>();
  const orgCtx = await getCurrentOrgContext(supabase);
  if (!profileRes.data || !orgCtx?.orgId) return null;

  // Reseñas verificadas (counted) históricas del comercial — propias, RLS OK.
  const countedRes = await supabase
    .from("reviews")
    .select("rating, google_created_at")
    .eq("sales_id", user.id)
    .is("removed_at", null)
    .eq("is_duplicate", false)
    .eq("match_state", "counted")
    .returns<{ rating: number; google_created_at: string }[]>();
  const counted = countedRes.data ?? [];

  const monthBuckets = bucketByMonth(
    counted.map((r) => r.google_created_at),
    6,
    now,
  );

  // Posición en el ranking org-global del mes en curso (métrica counted).
  const month = thisMonthRange(now);
  const rows = await getLeaderboard({
    orgId: orgCtx.orgId,
    startIso: month.startIso,
    endIso: month.endIso,
    currentUserId: user.id,
    metric: "counted",
    privileged: true,
  });
  const rankIndex = rows.findIndex((r) => r.id === user.id);

  return computePanelBadges({
    lifetimeCounted: counted.length,
    reviewsThisPeriod: monthBuckets[monthBuckets.length - 1] ?? 0,
    goal: profileRes.data.monthly_goal,
    monthBuckets,
    fiveStarCount: counted.filter((r) => r.rating >= 5).length,
    rankIndex: rankIndex >= 0 ? rankIndex : null,
    teamSize: rows.length,
  });
}

function formatRating(value: number | null): string {
  if (value === null) return "—";
  return value.toFixed(1).replace(".", ",");
}

function deltaPill(current: number, previous: number | null, label: string) {
  if (previous === null) return null;
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  if (diff === 0) return <Pill withDot>=0 {label}</Pill>;
  const sign = diff > 0 ? "+" : "";
  return (
    <Pill tone={diff > 0 ? "ok" : "warn"} withDot>
      {sign}
      {diff} {label}
    </Pill>
  );
}

const MS_DAY = 1000 * 60 * 60 * 24;

/**
 * Proyección al objetivo dentro del periodo activo (ciclo de comisión o mes).
 * `daysLeft` se calcula hasta el cierre del periodo (range.endIso es exclusivo,
 * el primer instante FUERA del rango) y el ETA se corta en ese cierre.
 */
function projection({
  counted,
  goal,
  range,
  now,
}: {
  counted: number;
  goal: number;
  range: DateRange;
  now: Date;
}): { remaining: number; daysLeft: number; etaLabel: string | null } {
  const remaining = Math.max(goal - counted, 0);
  const periodEnd = new Date(range.endIso); // exclusivo (día siguiente al `to`)
  const periodStart = new Date(range.startIso);
  const daysLeft = Math.max(
    Math.ceil((periodEnd.getTime() - now.getTime()) / MS_DAY),
    0,
  );
  const daysSoFar = Math.max(
    Math.ceil((now.getTime() - periodStart.getTime()) / MS_DAY),
    1,
  );
  const ratePerDay = counted / daysSoFar;
  if (remaining === 0) {
    return { remaining: 0, daysLeft, etaLabel: "Objetivo cumplido" };
  }
  if (ratePerDay <= 0) {
    return { remaining, daysLeft, etaLabel: null };
  }
  const daysToReach = Math.ceil(remaining / ratePerDay);
  const eta = new Date(now);
  eta.setDate(now.getDate() + daysToReach);
  if (eta.getTime() >= periodEnd.getTime()) {
    return { remaining, daysLeft, etaLabel: null };
  }
  const label = eta.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  return { remaining, daysLeft, etaLabel: label };
}

export default async function PanelPage({
  searchParams,
}: {
  searchParams: PanelSearchParams;
}) {
  const params = await searchParams;
  const now = new Date();
  // El panel del comercial arranca en el periodo de comisión vigente (20→19).
  const range = parseRange(params.from, params.to, now, commissionPeriodRange);
  const shortcuts = commissionShortcuts(now);
  const isMonth = isFullNaturalMonth(range);
  const isCommission = isCommissionPeriod(range, now);
  // La proyección al objetivo solo tiene sentido cuando seguimos dentro del
  // rango activo (es decir, el rango incluye hoy). Para periodos pasados o
  // futuros mostramos `counted / goal` sin ETA.
  const isCurrentPeriod =
    new Date(range.startIso).getTime() <= now.getTime() &&
    now.getTime() < new Date(range.endIso).getTime();

  // Comparativa con el periodo anterior del mismo tipo.
  const prevRange = isCommission
    ? previousCommissionPeriodRange(now)
    : isMonth
      ? lastMonthRange(new Date(range.startIso))
      : null;
  const prevLabel = isCommission ? "vs. periodo anterior" : "vs. mes pasado";

  const data = await loadPanelData(range, prevRange);
  const badges = await loadPanelBadges(now);
  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? "https://atribuya.com";
  const link = buildShareDisplay(appBase, data.orgSlug, data.slug);
  const fullUrl = buildShareUrl(appBase, data.orgSlug, data.slug);

  const totalReviews = data.counted + data.pending;
  const conversion = data.links > 0 ? Math.round((totalReviews / data.links) * 100) : null;
  const { remaining, daysLeft, etaLabel } = projection({
    counted: data.counted,
    goal: data.goal,
    range,
    now,
  });

  // Comisión estimada: € = reseñas counted × tarifa. null = tarifa sin configurar.
  const rate = data.commissionRate;
  const earnedEuro = rate !== null ? rate * data.counted : null;
  const pendingEuro = rate !== null ? rate * data.pending : null;
  const closeDate = formatCloseDate(range.to);

  // Etiqueta corta para el lead-in: "Llevas en <rango>".
  const periodLabel = isMonth
    ? range.label.split(" ")[0] // "mayo 2026" → "mayo"
    : range.label;

  return (
    <>
      <Topbar
        title="Mi panel"
        subtitle={`Buenos días, ${data.name.split(" ")[0]}`}
        range={null}
        breadcrumb="Atribuya"
        compact
        right={
          <>
            <SyncNowButton label="Buscar mis reseñas" size="sm" variant="ghost" />
            <RangePicker
              from={range.from}
              to={range.to}
              label={range.label}
              shortcuts={shortcuts}
            />
            <CopyLinkButton url={fullUrl} label="Compartir mi enlace" primary />
          </>
        }
      />

      <div className="sales-page-pad" style={{ flex: 1, padding: "24px 32px 32px", overflow: "auto" }}>
        <Card padding={28}>
          <div
            className="sales-grid-hero"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 32,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                Llevas en {periodLabel}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  marginTop: 6,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 64,
                    fontWeight: 600,
                    letterSpacing: "-0.035em",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {data.counted}
                </span>
                <span style={{ fontSize: 16, color: "var(--ink-3)" }}>
                  reseñas abonables
                </span>
                {deltaPill(data.counted, data.prevCounted, prevLabel)}
              </div>

              {/* Comisión estimada del periodo (€ = counted × tarifa). */}
              <div style={{ marginTop: 8, fontSize: 14, color: "var(--ink-2)" }}>
                {earnedEuro !== null ? (
                  <>
                    ≈{" "}
                    <strong style={{ color: "var(--ink)" }}>
                      {formatEuro(earnedEuro)}
                    </strong>{" "}
                    en comisión
                    {data.pending > 0 && pendingEuro !== null && (
                      <span style={{ color: "var(--ink-4)" }}>
                        {" "}· +{formatEuro(pendingEuro)} si se verifican las{" "}
                        {data.pending} pendientes
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ color: "var(--ink-4)" }}>
                    Tu tarifa por reseña aún no está configurada.
                  </span>
                )}
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  gap: 28,
                  color: "var(--ink-3)",
                  fontSize: 13,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  <span style={{ color: "var(--ink-4)" }}>Por verificar</span>{" "}
                  <strong style={{ color: "var(--ink)" }}>{data.pending}</strong>
                </span>
                <span>
                  <span style={{ color: "var(--ink-4)" }}>Conversión</span>{" "}
                  <strong style={{ color: "var(--ink)" }}>
                    {conversion === null ? "—" : `${conversion}%`}
                  </strong>
                </span>
                <span>
                  <span style={{ color: "var(--ink-4)" }}>Estrellas</span>{" "}
                  <strong style={{ color: "var(--ink)" }}>
                    {formatRating(data.avgRating)}
                  </strong>
                </span>
                {isCurrentPeriod && (
                  <span>
                    <span style={{ color: "var(--ink-4)" }}>Cierra el</span>{" "}
                    <strong style={{ color: "var(--ink)" }}>{closeDate}</strong>
                    <span style={{ color: "var(--ink-4)" }}> · faltan {daysLeft} días</span>
                  </span>
                )}
              </div>
            </div>

            <div className="sales-ring-row" style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Ring value={data.counted} max={data.goal} size={140} />
              <div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Objetivo del periodo</div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    marginTop: 4,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {data.counted} / {data.goal}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12.5,
                    color: "var(--ink-4)",
                    lineHeight: 1.5,
                    maxWidth: 240,
                  }}
                >
                  {!isCurrentPeriod ? (
                    <>
                      Vista del rango {range.label}. La proyección al objetivo solo se calcula sobre el periodo en curso.
                    </>
                  ) : remaining === 0 ? (
                    <>
                      <strong style={{ color: "var(--ok)" }}>Objetivo conseguido.</strong>{" "}
                      Quedan {daysLeft} días para sumar más.
                    </>
                  ) : etaLabel ? (
                    <>
                      Faltan{" "}
                      <strong style={{ color: "var(--ink)" }}>
                        {remaining} reseñas
                      </strong>{" "}
                      en {daysLeft} días. Con tu ritmo actual cierras objetivo el{" "}
                      <strong style={{ color: "var(--ink)" }}>{etaLabel}</strong>.
                    </>
                  ) : (
                    <>
                      Faltan{" "}
                      <strong style={{ color: "var(--ink)" }}>
                        {remaining} reseñas
                      </strong>{" "}
                      en {daysLeft} días. Necesitas acelerar para llegar.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Card "Mis clientes" — solo mobile (en desktop el sidebar ya lo cubre). */}
        <div className="sales-mobile-only" style={{ marginTop: 16 }}>
          <Link
            href="/clientes"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              textDecoration: "none",
              color: "var(--ink)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--surface-2)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink-2)",
                flexShrink: 0,
              }}
            >
              <Users size={20} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
                Mis clientes
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-4)", marginTop: 2 }}>
                Da de alta antes de pedir una reseña
              </div>
            </div>
            <span aria-hidden="true" style={{ color: "var(--ink-4)", fontSize: 18 }}>
              ›
            </span>
          </Link>
        </div>

        <div style={{ marginTop: 16 }}>
          <Card padding={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
                  Tu enlace personal
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginTop: 4,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Para QR impreso o enlace genérico
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 12.5,
                    color: "var(--ink-4)",
                    lineHeight: 1.55,
                    maxWidth: 540,
                  }}
                >
                  Si vas a enviárselo a un cliente concreto, da de alta su nombre en{" "}
                  <strong style={{ color: "var(--ink-3)" }}>Mis clientes</strong>: el
                  enlace personalizado mejora la atribución automática.
                </p>
              </div>
              <Pill tone="ok" withDot>
                Activo
              </Pill>
            </div>

            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  padding: "14px 14px",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 10,
                  background: "var(--surface-2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13.5,
                    color: "var(--ink-2)",
                    wordBreak: "break-all",
                    minWidth: 0,
                    flex: "1 1 200px",
                  }}
                >
                  {link}
                </span>
                <CopyLinkButton url={fullUrl} label="Copiar" />
              </div>
              <div style={{ marginTop: 12 }}>
                <a
                  href="/clientes"
                  style={{
                    display: "inline-block",
                    padding: "7px 12px",
                    border: "1px solid var(--line-strong)",
                    background: "var(--ink)",
                    color: "#fff",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Generar enlace por cliente →
                </a>
              </div>
            </div>
          </Card>
        </div>

        {badges && badges.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <BadgesCard badges={badges} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Link
                href="/panel/ranking"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink-3)",
                  textDecoration: "none",
                }}
              >
                Ver el ranking del equipo →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
