"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GhostBtn } from "@/components/ui/GhostBtn";
import { Pill } from "@/components/ui/Pill";
import { updateSales, type UpdateSalesInput } from "../actions";
import type { ProfileStatus } from "@/lib/supabase/types";

export type SalesEditCardProps = {
  id: string;
  email: string | null;
  phone: string | null;
  slug: string;
  /** Slug of the org the sales belongs to — used in the read-only landing
   *  URL display row. Optional only because of fallback in some legacy
   *  callers; new code should always provide it. */
  orgSlug?: string | null;
  joinedAt: string;
  locations: { id: string; name: string }[];
  directors?: { id: string; full_name: string }[];
  initial: {
    locationId: string | null;
    monthlyGoal: number;
    commissionRate: number | null;
    directorId: string | null;
    status: ProfileStatus;
  };
};

export function SalesEditCard({
  id,
  email,
  phone,
  slug,
  orgSlug,
  joinedAt,
  locations,
  directors = [],
  initial,
}: SalesEditCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [locationId, setLocationId] = useState(
    initial.locationId ?? locations[0]?.id ?? "",
  );
  const [monthlyGoal, setMonthlyGoal] = useState(initial.monthlyGoal);
  const [commissionRate, setCommissionRate] = useState(
    initial.commissionRate === null ? "" : String(initial.commissionRate),
  );
  const [directorId, setDirectorId] = useState(initial.directorId ?? "");
  const [status, setStatus] = useState<ProfileStatus>(initial.status);

  const currentLocation = locations.find((l) => l.id === locationId);
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  function onCancel() {
    setLocationId(initial.locationId ?? locations[0]?.id ?? "");
    setMonthlyGoal(initial.monthlyGoal);
    setCommissionRate(
      initial.commissionRate === null ? "" : String(initial.commissionRate),
    );
    setDirectorId(initial.directorId ?? "");
    setStatus(initial.status);
    setError(null);
    setEditing(false);
  }

  function onSave() {
    setError(null);
    const payload: UpdateSalesInput = {
      id,
      locationId,
      monthlyGoal,
      commissionRate,
      directorId,
      status,
    };
    startTransition(async () => {
      const r = await updateSales(payload);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={sectionLabel}>Datos del comercial</div>
        {!editing && (
          <GhostBtn onClick={() => setEditing(true)}>Editar</GhostBtn>
        )}
      </div>

      <dl style={{ margin: 0, display: "grid", rowGap: 12 }}>
        <DataRow label="Email" value={email ?? "—"} />
        <DataRow label="Teléfono" value={phone ?? "—"} />
        <DataRow label="Slug" mono value={`/o/${orgSlug ?? "[org]"}/c/${slug}`} />
        <DataRow label="Alta" value={fmtDate(joinedAt)} />

        {/* Ficha */}
        <div style={rowGrid}>
          <dt style={dtStyle}>Ficha asignada</dt>
          <dd style={{ margin: 0 }}>
            {editing ? (
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                style={inputStyle}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: 13.5 }}>
                {currentLocation?.name ?? "—"}
              </span>
            )}
          </dd>
        </div>

        {/* Meta */}
        <div style={rowGrid}>
          <dt style={dtStyle}>Meta mensual</dt>
          <dd style={{ margin: 0 }}>
            {editing ? (
              <input
                type="number"
                min={0}
                max={1000}
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                style={{ ...inputStyle, width: 100 }}
              />
            ) : (
              <span style={{ fontSize: 13.5 }}>{monthlyGoal} reseñas/mes</span>
            )}
          </dd>
        </div>

        {/* Tarifa de comisión (€ por reseña abonable) */}
        <div style={rowGrid}>
          <dt style={dtStyle}>Tarifa por reseña</dt>
          <dd style={{ margin: 0 }}>
            {editing ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Sin tarifa"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  style={{ ...inputStyle, width: 120 }}
                />
                <span style={{ fontSize: 13.5, color: "var(--ink-4)" }}>€/reseña</span>
              </span>
            ) : (
              <span style={{ fontSize: 13.5 }}>
                {commissionRate === "" ? "Sin tarifa" : `${commissionRate} €/reseña`}
              </span>
            )}
          </dd>
        </div>

        {/* Director responsable */}
        {directors.length > 0 && (
          <div style={rowGrid}>
            <dt style={dtStyle}>Director responsable</dt>
            <dd style={{ margin: 0 }}>
              {editing ? (
                <select
                  value={directorId}
                  onChange={(e) => setDirectorId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Sin director (pool del admin)</option>
                  {directors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: 13.5 }}>
                  {directors.find((d) => d.id === directorId)?.full_name ?? "Sin director"}
                </span>
              )}
            </dd>
          </div>
        )}

        {/* Estado */}
        <div style={rowGrid}>
          <dt style={dtStyle}>Estado</dt>
          <dd style={{ margin: 0 }}>
            {editing ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProfileStatus)}
                style={inputStyle}
              >
                <option value="invited">Invitado (no ha entrado)</option>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
              </select>
            ) : (
              <Pill
                tone={
                  status === "active" ? "ok" : status === "paused" ? "warn" : "neutral"
                }
                withDot
              >
                {status === "active"
                  ? "Activo"
                  : status === "paused"
                    ? "Pausado"
                    : "Invitado"}
              </Pill>
            )}
          </dd>
        </div>
      </dl>

      {editing && (
        <>
          {error && (
            <div
              role="alert"
              style={{
                marginTop: 14,
                padding: "8px 10px",
                background: "var(--warn-bg)",
                color: "var(--warn)",
                borderRadius: 8,
                fontSize: 12.5,
              }}
            >
              {error}
            </div>
          )}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <GhostBtn onClick={onCancel} disabled={isPending}>
              Cancelar
            </GhostBtn>
            <GhostBtn primary onClick={onSave} disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar cambios"}
            </GhostBtn>
          </div>
        </>
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11.5,
  color: "var(--ink-4)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  fontWeight: 600,
};

const rowGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "130px 1fr",
  alignItems: "center",
  gap: 12,
};

const dtStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--ink-4)",
};

const inputStyle: React.CSSProperties = {
  padding: "7px 10px",
  border: "1px solid var(--line-strong)",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  background: "var(--surface)",
  color: "var(--ink)",
};

function DataRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={rowGrid}>
      <dt style={dtStyle}>{label}</dt>
      <dd
        style={{
          margin: 0,
          fontSize: 13.5,
          color: "var(--ink)",
          fontFamily: mono ? "var(--font-mono)" : "inherit",
          wordBreak: mono ? "break-all" : "normal",
        }}
      >
        {value}
      </dd>
    </div>
  );
}
