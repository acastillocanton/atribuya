"use client";

import { useEffect, useState, useTransition } from "react";
import { updateOrg } from "./actions";
import { PLAN_OPTIONS } from "./plans";

type OrgStatus = "trial" | "active" | "suspended" | "churned";

export type EditableOrg = {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  plan: string;
  billing_email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  fiscal_data: Record<string, string> | null;
};

type Props = {
  org: EditableOrg;
  onClose: () => void;
};

const FISCAL_REQUIRED = ["legal_name", "tax_id", "address", "postal_code", "city"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 14,
  border: "1px solid var(--border)",
  borderRadius: 6,
  background: "var(--bg)",
  color: "var(--ink)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--ink-muted)",
  marginBottom: 4,
};

const fieldStyle: React.CSSProperties = { marginBottom: 12 };

export function EditOrgForm({ org, onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fd = org.fiscal_data ?? {};
  const fiscalIncomplete = FISCAL_REQUIRED.some((k) => !fd[k] || fd[k].trim() === "");
  // Legacy plan values (e.g. "standard") that aren't in PLAN_OPTIONS still need
  // to be selectable so we don't silently change them on save.
  const planInList = PLAN_OPTIONS.some((p) => p.value === org.plan);

  // onSubmit + preventDefault: React 19 resetea los campos no controlados al
  // terminar una <form action={fn}>, también al fallar (aquí volverían a los
  // valores originales, perdiendo las ediciones). Así se conservan.
  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      setError(null);
      const res = await updateOrg({
        orgId: org.id,
        name: String(formData.get("name") ?? ""),
        billingEmail: String(formData.get("billingEmail") ?? ""),
        contactName: String(formData.get("contactName") ?? ""),
        contactPhone: String(formData.get("contactPhone") ?? ""),
        status: (formData.get("status") as never) ?? "trial",
        plan: String(formData.get("plan") ?? ""),
        legalName: String(formData.get("legalName") ?? ""),
        taxId: String(formData.get("taxId") ?? ""),
        address: String(formData.get("address") ?? ""),
        postalCode: String(formData.get("postalCode") ?? ""),
        city: String(formData.get("city") ?? ""),
        province: String(formData.get("province") ?? ""),
        country: String(formData.get("country") ?? ""),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "5vh 16px",
        zIndex: 1000,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 640,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>
          Editar organización
        </h2>

        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Nombre comercial *</label>
              <input name="name" required defaultValue={org.name} style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Slug (no editable)</label>
              <input
                value={org.slug}
                disabled
                style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Contacto</label>
              <input
                name="contactName"
                defaultValue={org.contact_name ?? ""}
                style={inputStyle}
                placeholder="Ana Pérez"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email facturación</label>
              <input
                type="email"
                name="billingEmail"
                defaultValue={org.billing_email ?? ""}
                style={inputStyle}
                placeholder="admin@acme.com"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Teléfono</label>
              <input
                name="contactPhone"
                defaultValue={org.contact_phone ?? ""}
                style={inputStyle}
                placeholder="+34 600 000 000"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Estado</label>
              <select name="status" defaultValue={org.status} style={inputStyle}>
                <option value="trial">Trial</option>
                <option value="active">Activa</option>
                <option value="suspended">Suspendida</option>
                <option value="churned">Baja</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Plan</label>
              <select name="plan" defaultValue={org.plan} style={inputStyle}>
                {!planInList && <option value={org.plan}>{org.plan} (actual)</option>}
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <details
            open={fiscalIncomplete}
            style={{
              margin: "8px 0 16px",
              padding: "10px 12px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 6,
            }}
          >
            <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Datos fiscales y de facturación
            </summary>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Razón social / Nombre legal</label>
                <input
                  name="legalName"
                  defaultValue={fd.legal_name ?? ""}
                  style={inputStyle}
                  placeholder="Acme Promotora, S.L."
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>CIF / NIF</label>
                <input
                  name="taxId"
                  defaultValue={fd.tax_id ?? ""}
                  style={inputStyle}
                  placeholder="B12345678"
                />
              </div>
              <div style={{ ...fieldStyle, gridColumn: "1 / span 2" }}>
                <label style={labelStyle}>Dirección</label>
                <input
                  name="address"
                  defaultValue={fd.address ?? ""}
                  style={inputStyle}
                  placeholder="Calle Ejemplo 1, 2º A"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Código postal</label>
                <input
                  name="postalCode"
                  defaultValue={fd.postal_code ?? ""}
                  style={inputStyle}
                  placeholder="28001"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Ciudad</label>
                <input
                  name="city"
                  defaultValue={fd.city ?? ""}
                  style={inputStyle}
                  placeholder="Madrid"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Provincia</label>
                <input
                  name="province"
                  defaultValue={fd.province ?? ""}
                  style={inputStyle}
                  placeholder="Madrid"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>País</label>
                <input
                  name="country"
                  defaultValue={fd.country ?? "España"}
                  style={inputStyle}
                />
              </div>
            </div>
          </details>

          {error && (
            <p style={{ color: "#7a2929", fontSize: 13, marginBottom: 8 }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                padding: "8px 16px",
                background: "var(--ink)",
                color: "var(--bg)",
                border: 0,
                borderRadius: 6,
                cursor: pending ? "wait" : "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: "var(--ink)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
