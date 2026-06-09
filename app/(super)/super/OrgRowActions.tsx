"use client";

import { useState, useTransition } from "react";
import { setOrgStatus, deleteOrg } from "./actions";
import { EditOrgForm, type EditableOrg } from "./EditOrgForm";

type OrgStatus = "trial" | "active" | "suspended" | "churned";

type Props = {
  org: EditableOrg;
};

const buttonStyle: React.CSSProperties = {
  padding: "4px 8px",
  fontSize: 12,
  border: "1px solid var(--border)",
  borderRadius: 4,
  background: "transparent",
  color: "var(--ink)",
  cursor: "pointer",
};

export function OrgRowActions({ org }: Props) {
  const { id: orgId, name: orgName, status: orgStatus } = org;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  function changeStatus(next: OrgStatus) {
    if (next === orgStatus) return;
    setError(null);
    startTransition(async () => {
      const res = await setOrgStatus({ orgId, status: next });
      if (!res.ok) setError(res.error);
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente la organización "${orgName}"?\n\n` +
        "Esto borrará en cascada TODAS sus locations, comerciales, clientes, " +
        "reseñas y audit log de esa org. No es recuperable. Considera primero " +
        'cambiar el estado a "Suspendida" o "Baja".',
    );
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteOrg(orgId);
      if (!res.ok) setError(res.error);
    });
  }

  // Next status follows the natural lifecycle: trial → active → suspended → churned.
  // Reactivation goes suspended → active.
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <button type="button" style={buttonStyle} disabled={pending} onClick={() => setEditing(true)}>
          Editar
        </button>
        {orgStatus === "trial" && (
          <button type="button" style={buttonStyle} disabled={pending} onClick={() => changeStatus("active")}>
            → Activar
          </button>
        )}
        {orgStatus === "active" && (
          <button type="button" style={buttonStyle} disabled={pending} onClick={() => changeStatus("suspended")}>
            → Suspender
          </button>
        )}
        {orgStatus === "suspended" && (
          <>
            <button type="button" style={buttonStyle} disabled={pending} onClick={() => changeStatus("active")}>
              → Reactivar
            </button>
            <button type="button" style={buttonStyle} disabled={pending} onClick={() => changeStatus("churned")}>
              → Marcar baja
            </button>
          </>
        )}
        {orgStatus === "churned" && (
          <button type="button" style={buttonStyle} disabled={pending} onClick={() => changeStatus("active")}>
            → Reactivar
          </button>
        )}
        <button
          type="button"
          style={{ ...buttonStyle, color: "#7a2929", borderColor: "#f8d7d7" }}
          disabled={pending}
          onClick={handleDelete}
        >
          Eliminar
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: "#7a2929", margin: 0 }}>{error}</p>}
      {editing && <EditOrgForm org={org} onClose={() => setEditing(false)} />}
    </div>
  );
}
