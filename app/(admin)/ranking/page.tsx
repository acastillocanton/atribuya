import Link from "next/link";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { RangePicker } from "@/components/ui/RangePicker";
import { LeaderboardTable } from "@/components/ranking/LeaderboardTable";
import { getLeaderboard, demoLeaderboardRows } from "@/lib/leaderboard";
import { parseRange, commissionShortcuts, commissionPeriodRange } from "@/lib/date-range";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrgContext } from "@/lib/supabase/org";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// El ranking depende del rango temporal en la query string, así que
// no se puede cachear estáticamente entre usuarios.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ from?: string; to?: string }>;

export default async function RankingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const now = new Date();
  const range = parseRange(params.from, params.to, now, commissionPeriodRange);
  const shortcuts = commissionShortcuts(now);

  if (!isSupabaseConfigured()) {
    const demoRows = demoLeaderboardRows();
    return (
      <>
        <Topbar
          title="Ranking"
          subtitle="Producción del equipo · datos de ejemplo"
          range={null}
          breadcrumb="Atribuya"
          compact
          right={
            <RangePicker
              from={range.from}
              to={range.to}
              label={range.label}
              shortcuts={shortcuts}
            />
          }
        />
        <div
          className="m-page-pad"
          style={{ flex: 1, padding: "24px 32px 32px", overflow: "auto" }}
        >
          <Card padding={0}>
            <div style={{ padding: "18px 22px 6px" }}>
              <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
                Ranking completo
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4, letterSpacing: "-0.02em" }}>
                {demoRows.length} comerciales · ordenados por reseñas
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "var(--ink-4)", lineHeight: 1.5 }}>
                Datos de ejemplo (modo demo, sin base de datos conectada).
              </p>
            </div>
            <LeaderboardTable rows={demoRows} />
          </Card>
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const orgCtx = await getCurrentOrgContext(supabase);
  if (!orgCtx?.orgId) redirect("/login?error=no-org");

  // Admin / reviews_manager pueden leer todos los perfiles de su org vía RLS;
  // pasamos `orgId` igualmente como defensa en profundidad.
  const rows = await getLeaderboard({
    orgId: orgCtx.orgId,
    startIso: range.startIso,
    endIso: range.endIso,
  });

  // Empty si nadie ha producido nada en el rango. Distinto a no haber
  // comerciales en BD: aquí siempre hay perfiles, pero pueden estar a 0
  // si el rango está fuera de su actividad.
  const hasActivity = rows.some((r) => r.reviews > 0);

  return (
    <>
      <Topbar
        title="Ranking"
        subtitle="Producción del equipo"
        range={null}
        breadcrumb="Atribuya"
        compact
        right={
          <RangePicker
            from={range.from}
            to={range.to}
            label={range.label}
            shortcuts={shortcuts}
          />
        }
      />

      <div
        className="m-page-pad"
        style={{
          flex: 1,
          padding: "24px 32px 32px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {rows.length === 0 ? (
          <Card padding={32}>
            <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
              Sin comerciales
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginTop: 4,
                letterSpacing: "-0.02em",
              }}
            >
              Aún no hay comerciales en plantilla
            </div>
            <p style={{ margin: "10px 0 0", color: "var(--ink-3)", fontSize: 13.5, lineHeight: 1.55, maxWidth: 560 }}>
              Invita comerciales desde{" "}
              <Link href="/comerciales" style={{ color: "var(--ink)" }}>Comerciales</Link>.
            </p>
          </Card>
        ) : !hasActivity ? (
          <Card padding={32}>
            <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
              Sin actividad en este periodo
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginTop: 4,
                letterSpacing: "-0.02em",
              }}
            >
              Cambia el rango o espera a la próxima sincronización
            </div>
            <p style={{ margin: "10px 0 0", color: "var(--ink-3)", fontSize: 13.5, lineHeight: 1.55, maxWidth: 560 }}>
              Ningún comercial ha tenido reseñas atribuidas en el periodo seleccionado. Usa los atajos del calendario para ir al mes pasado o al último trimestre.
            </p>
          </Card>
        ) : (
          <Card padding={0}>
            <div style={{ padding: "18px 22px 6px" }}>
              <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
                Ranking completo
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginTop: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                {rows.length} {rows.length === 1 ? "comercial" : "comerciales"} · ordenados por reseñas
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "var(--ink-4)", lineHeight: 1.5 }}>
                Ordenados por reseñas atribuidas. Los comerciales sin actividad quedan al final ordenados alfabéticamente.
              </p>
            </div>
            <LeaderboardTable rows={rows} />
          </Card>
        )}
      </div>
    </>
  );
}
