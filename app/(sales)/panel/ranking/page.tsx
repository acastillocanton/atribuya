import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { RangePicker } from "@/components/ui/RangePicker";
import { LeaderboardCardList } from "@/components/ranking/LeaderboardCardList";
import { getLeaderboard, demoLeaderboardRows } from "@/lib/leaderboard";
import { parseRange, defaultShortcuts } from "@/lib/date-range";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrgContext } from "@/lib/supabase/org";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// El ranking depende del rango temporal y del usuario logueado.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ from?: string; to?: string }>;

export default async function SalesRankingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const now = new Date();
  const range = parseRange(params.from, params.to, now);
  const shortcuts = defaultShortcuts(now);

  if (!isSupabaseConfigured()) {
    // El nombre coincide con el del DEMO_DATA del panel ("Mateo Salgado") para
    // que se destaque su propia card en el ranking de ejemplo.
    const demoRows = demoLeaderboardRows("Mateo Salgado");
    return (
      <>
        <Topbar
          title="Ranking"
          subtitle="Tu posición en el equipo · datos de ejemplo"
          breadcrumb="Mi panel"
          range={null}
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
          style={{ flex: 1, padding: "24px 32px 32px", display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div style={{ fontSize: 12.5, color: "var(--ink-4)", padding: "0 2px" }}>
            {demoRows.length} comerciales en tu organización · datos de ejemplo
          </div>
          <LeaderboardCardList rows={demoRows} />
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle<{ id: string; role: string }>();

  // Esta pantalla es para el rol sales. Admin / reviews_manager tienen su
  // propio /ranking con RangePicker desktop.
  if (!profile || profile.role !== "sales") {
    redirect("/ranking");
  }

  const orgCtx = await getCurrentOrgContext(supabase);
  if (!orgCtx?.orgId) redirect("/login?error=no-org");

  // Ranking GLOBAL de la org (Atribuya no tiene equipos/director). El rol sales
  // no puede leer los perfiles de sus compañeros vía RLS → `privileged: true`
  // usa service-role filtrado por el `org_id` derivado del servidor.
  const rows = await getLeaderboard({
    orgId: orgCtx.orgId,
    startIso: range.startIso,
    endIso: range.endIso,
    currentUserId: profile.id,
    // Ranking por reseñas VERIFICADAS (abonables) — coherente con la comisión.
    metric: "counted",
    privileged: true,
  });

  const teamSize = rows.length;

  return (
    <>
      <Topbar
        title="Ranking"
        subtitle="Tu posición en el equipo"
        breadcrumb="Mi panel"
        range={null}
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
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {teamSize <= 1 ? (
          <Card padding={24}>
            <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
              Equipo de 1
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginTop: 4,
                letterSpacing: "-0.02em",
              }}
            >
              Aún no hay más comerciales en tu organización
            </div>
            <p
              style={{
                margin: "10px 0 0",
                color: "var(--ink-3)",
                fontSize: 13.5,
                lineHeight: 1.55,
              }}
            >
              En cuanto haya más comerciales en tu organización verás aquí su
              posición. Mientras tanto, aquí tienes tu producción del periodo.
            </p>
            <div style={{ marginTop: 16 }}>
              <LeaderboardCardList rows={rows} />
            </div>
          </Card>
        ) : (
          <>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--ink-4)",
                padding: "0 2px",
              }}
            >
              {teamSize} comerciales en tu organización · ordenados por reseñas verificadas
            </div>
            <LeaderboardCardList rows={rows} />
          </>
        )}
      </div>
    </>
  );
}
