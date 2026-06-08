import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ProfileStatus } from "@/lib/supabase/types";
import { InviteDirectorButton } from "./InviteDirectorButton";
import { DeleteDirectorButton } from "./DeleteDirectorButton";
import { ResendAccessButton } from "@/components/ui/ResendAccessButton";
import { resendDirectorAccess } from "./actions";

type DirectorRow = {
  id: string;
  full_name: string;
  email: string | null;
  status: ProfileStatus;
  location: { id: string; name: string } | null;
};

type LocationOption = { id: string; name: string };

export default async function DirectoresPage() {
  let directors: DirectorRow[] = [];
  let teamCounts: Record<string, number> = {};
  let locations: LocationOption[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [dirRes, salesRes, locRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, status, location:locations(id, name)")
        .eq("role", "office_director")
        .order("full_name"),
      supabase.from("profiles").select("director_id").eq("role", "sales"),
      supabase.from("locations").select("id, name").order("name"),
    ]);
    directors = ((dirRes.data ?? []) as unknown) as DirectorRow[];
    for (const s of (salesRes.data ?? []) as { director_id: string | null }[]) {
      if (s.director_id) teamCounts[s.director_id] = (teamCounts[s.director_id] ?? 0) + 1;
    }
    if (locRes.data) locations = locRes.data as LocationOption[];
  }

  const stats = {
    total: directors.length,
    active: directors.filter((d) => d.status === "active").length,
    invited: directors.filter((d) => d.status === "invited").length,
    paused: directors.filter((d) => d.status === "paused").length,
  };

  return (
    <>
      <Topbar
        title="Directores"
        subtitle="Directores de oficina y sus equipos"
        range={`${stats.total} directores`}
        breadcrumb="Atribuya"
        right={<InviteDirectorButton locations={locations} />}
      />

      <div style={{ flex: 1, padding: "24px 32px 32px", overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
          <MiniStat label="Total" value={stats.total} sub="directores de oficina" />
          <MiniStat label="Activos" value={stats.active} sub="operativos" />
          <MiniStat label="Invitados" value={stats.invited} sub="pendientes de aceptar" />
          <MiniStat label="Pausados" value={stats.paused} sub="sin actividad" />
        </div>

        {directors.length === 0 ? (
          <Card padding={32}>
            <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
              Sin directores todavía
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, letterSpacing: "-0.02em" }}>
              Invita a tu primer director de oficina
            </div>
            <p style={{ margin: "10px 0 16px", color: "var(--ink-3)", fontSize: 13.5, lineHeight: 1.55, maxWidth: 560 }}>
              Un director gestiona a un equipo de comerciales sobre una ficha. Tras
              invitarlo, asigna sus comerciales desde la ficha de cada comercial
              (campo «Director responsable»).
            </p>
            <InviteDirectorButton locations={locations} />
          </Card>
        ) : (
          <Card padding={0}>
            <div
              style={{
                padding: "12px 22px",
                borderBottom: "1px solid var(--line)",
                display: "grid",
                gridTemplateColumns: "2fr 1.4fr 0.8fr 1.2fr 0.8fr 160px",
                gap: 14,
                fontSize: 11,
                color: "var(--ink-4)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <span>Director</span>
              <span>Ficha</span>
              <span style={{ textAlign: "right" }}>Equipo</span>
              <span>Email</span>
              <span>Estado</span>
              <span></span>
            </div>
            {directors.map((d, i) => (
              <DirectorRowItem
                key={d.id}
                d={d}
                team={teamCounts[d.id] ?? 0}
                last={i === directors.length - 1}
              />
            ))}
          </Card>
        )}
      </div>
    </>
  );
}

function DirectorRowItem({ d, team, last }: { d: DirectorRow; team: number; last: boolean }) {
  const tone = d.status === "active" ? "ok" : d.status === "paused" ? "warn" : "neutral";
  const label = d.status === "active" ? "Activo" : d.status === "paused" ? "Pausado" : "Invitado";
  return (
    <div
      style={{
        padding: "14px 22px",
        borderBottom: last ? "none" : "1px solid var(--line)",
        display: "grid",
        gridTemplateColumns: "2fr 1.4fr 0.8fr 1.2fr 0.8fr 160px",
        gap: 14,
        alignItems: "center",
        fontSize: 13.5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <Avatar name={d.full_name} size={32} />
        <span
          style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {d.full_name}
        </span>
      </div>
      <span style={{ fontSize: 13, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {d.location?.name ?? "—"}
      </span>
      <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--ink-3)" }}>
        {team}
      </span>
      <span style={{ fontSize: 12.5, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {d.email ?? "—"}
      </span>
      <span>
        <Pill tone={tone} withDot>
          {label}
        </Pill>
      </span>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <ResendAccessButton id={d.id} name={d.full_name} action={resendDirectorAccess} />
        <DeleteDirectorButton id={d.id} name={d.full_name} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <Card padding={16}>
      <div style={{ fontSize: 11.5, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          letterSpacing: "-0.025em",
          fontSize: 24,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-4)" }}>{sub}</div>
    </Card>
  );
}
