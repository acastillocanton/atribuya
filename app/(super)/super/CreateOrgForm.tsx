"use client";

import { useState, useTransition } from "react";
import { createOrg, inviteOrgAdmin } from "./actions";
import { PLAN_OPTIONS, DEFAULT_PLAN } from "./plans";

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

export function CreateOrgForm() {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    | { kind: "idle" }
    | { kind: "error"; message: string }
    | { kind: "created"; orgId: string; orgSlug: string }
    | { kind: "invited"; inviteLink: string; email: string }
  >({ kind: "idle" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      setFeedback({ kind: "idle" });
      const res = await createOrg({
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
        billingEmail: String(formData.get("billingEmail") ?? ""),
        contactName: String(formData.get("contactName") ?? ""),
        contactPhone: String(formData.get("contactPhone") ?? ""),
        status: (formData.get("status") as never) ?? "trial",
        plan: String(formData.get("plan") ?? "standard"),
        legalName: String(formData.get("legalName") ?? ""),
        taxId: String(formData.get("taxId") ?? ""),
        address: String(formData.get("address") ?? ""),
        postalCode: String(formData.get("postalCode") ?? ""),
        city: String(formData.get("city") ?? ""),
        province: String(formData.get("province") ?? ""),
        country: String(formData.get("country") ?? ""),
      });
      if (!res.ok) {
        setFeedback({ kind: "error", message: res.error });
        return;
      }
      setFeedback({ kind: "created", orgId: res.orgId, orgSlug: res.slug });
    });
  }

  function handleInvite() {
    if (feedback.kind !== "created") return;
    const orgId = feedback.orgId;
    if (!inviteEmail || !inviteFullName) {
      setFeedback({ kind: "error", message: "Email y nombre del admin son obligatorios." });
      return;
    }
    startTransition(async () => {
      const res = await inviteOrgAdmin({
        orgId,
        email: inviteEmail,
        fullName: inviteFullName,
      });
      if (!res.ok) {
        setFeedback({ kind: "error", message: res.error });
        return;
      }
      setFeedback({ kind: "invited", inviteLink: res.inviteLink, email: res.email });
    });
  }

  if (feedback.kind === "invited") {
    return (
      <div style={{ padding: 16, background: "#d6f3df", border: "1px solid #0b6a2f", borderRadius: 6 }}>
        <p style={{ margin: 0, fontWeight: 600, color: "#0b6a2f" }}>
          ✓ Invitación generada para {feedback.email}
        </p>
        <p style={{ marginTop: 12, marginBottom: 4, fontSize: 12, color: "var(--ink-muted)" }}>
          Pásale este enlace al nuevo admin (no se manda email automáticamente):
        </p>
        <textarea
          readOnly
          value={feedback.inviteLink}
          style={{ ...inputStyle, fontFamily: "var(--font-mono, monospace)", minHeight: 60, fontSize: 12 }}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
        <button
          type="button"
          onClick={() => setFeedback({ kind: "idle" })}
          style={{
            marginTop: 12,
            padding: "6px 12px",
            fontSize: 13,
            border: "1px solid var(--border)",
            borderRadius: 6,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Crear otra organización
        </button>
      </div>
    );
  }

  if (feedback.kind === "created") {
    return (
      <div>
        <p
          style={{
            padding: 12,
            background: "#d6f3df",
            color: "#0b6a2f",
            borderRadius: 6,
            margin: "0 0 16px",
          }}
        >
          ✓ Organización <strong>{feedback.orgSlug}</strong> creada. Invita al primer admin:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Nombre completo</label>
            <input
              type="text"
              value={inviteFullName}
              onChange={(e) => setInviteFullName(e.target.value)}
              placeholder="Ana Pérez"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="ana@empresa.com"
              style={inputStyle}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleInvite}
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
          {pending ? "Enviando…" : "Generar invitación"}
        </button>
      </div>
    );
  }

  return (
    <form action={handleCreate}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Nombre comercial *</label>
          <input name="name" required style={inputStyle} placeholder="Acme Promotora" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Slug *</label>
          <input
            name="slug"
            required
            style={inputStyle}
            placeholder="acme-promotora"
            pattern="[a-z0-9-]+"
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Contacto</label>
          <input name="contactName" style={inputStyle} placeholder="Ana Pérez" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Email facturación</label>
          <input type="email" name="billingEmail" style={inputStyle} placeholder="admin@acme.com" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Teléfono</label>
          <input name="contactPhone" style={inputStyle} placeholder="+34 600 000 000" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Estado inicial</label>
          <select name="status" defaultValue="trial" style={inputStyle}>
            <option value="trial">Trial</option>
            <option value="active">Activa</option>
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Plan</label>
          <select name="plan" defaultValue={DEFAULT_PLAN} style={inputStyle}>
            {PLAN_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <details
        style={{
          margin: "8px 0 16px",
          padding: "10px 12px",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 6,
        }}
      >
        <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          Datos fiscales y de facturación{" "}
          <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
            (opcionales al crear — completables después)
          </span>
        </summary>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Razón social / Nombre legal</label>
            <input name="legalName" style={inputStyle} placeholder="Acme Promotora, S.L." />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>CIF / NIF</label>
            <input name="taxId" style={inputStyle} placeholder="B12345678" />
          </div>
          <div style={{ ...fieldStyle, gridColumn: "1 / span 2" }}>
            <label style={labelStyle}>Dirección</label>
            <input name="address" style={inputStyle} placeholder="Calle Ejemplo 1, 2º A" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Código postal</label>
            <input name="postalCode" style={inputStyle} placeholder="28001" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Ciudad</label>
            <input name="city" style={inputStyle} placeholder="Madrid" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Provincia</label>
            <input name="province" style={inputStyle} placeholder="Madrid" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>País</label>
            <input name="country" defaultValue="España" style={inputStyle} />
          </div>
        </div>
      </details>

      {feedback.kind === "error" && (
        <p style={{ color: "#7a2929", fontSize: 13, marginBottom: 8 }}>{feedback.message}</p>
      )}
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
        {pending ? "Creando…" : "Crear organización"}
      </button>
    </form>
  );
}
