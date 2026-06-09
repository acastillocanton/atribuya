"use client";

import { useEffect, useState, useTransition } from "react";
import { inviteOrgAdmin } from "./actions";

type Props = {
  orgId: string;
  orgName: string;
  onClose: () => void;
};

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

export function InviteAdminForm({ orgId, orgName, onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<
    | { kind: "form"; error: string | null }
    | { kind: "done"; inviteLink: string; email: string; emailSent: boolean }
  >({ kind: "form", error: null });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleInvite() {
    if (!email || !fullName) {
      setFeedback({ kind: "form", error: "Email y nombre del admin son obligatorios." });
      return;
    }
    startTransition(async () => {
      const res = await inviteOrgAdmin({ orgId, email, fullName });
      if (!res.ok) {
        setFeedback({ kind: "form", error: res.error });
        return;
      }
      setFeedback({
        kind: "done",
        inviteLink: res.inviteLink,
        email: res.email,
        emailSent: res.emailSent,
      });
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
        padding: "8vh 16px",
        zIndex: 1000,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Invitar admin</h2>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 16px" }}>
          Organización: <strong>{orgName}</strong>
        </p>

        {feedback.kind === "done" ? (
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "#0b6a2f" }}>
              {feedback.emailSent
                ? `✓ Invitación enviada por email a ${feedback.email}`
                : `✓ Invitación generada para ${feedback.email}`}
            </p>
            <p style={{ marginTop: 12, marginBottom: 4, fontSize: 12, color: "var(--ink-muted)" }}>
              {feedback.emailSent
                ? "Ya le ha llegado el email con el acceso. Enlace de respaldo por si no lo recibe (revisar spam):"
                : "No se pudo enviar el email automático. Pásale este enlace al nuevo admin a mano:"}
            </p>
            <textarea
              readOnly
              value={feedback.inviteLink}
              style={{
                ...inputStyle,
                fontFamily: "var(--font-mono, monospace)",
                minHeight: 60,
                fontSize: 12,
              }}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 12,
                padding: "8px 16px",
                background: "var(--ink)",
                color: "var(--bg)",
                border: 0,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ana Pérez"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana@empresa.com"
                style={inputStyle}
              />
            </div>
            {feedback.error && (
              <p style={{ color: "#7a2929", fontSize: 13, marginBottom: 8 }}>{feedback.error}</p>
            )}
            <div style={{ display: "flex", gap: 8 }}>
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
                {pending ? "Enviando…" : "Generar y enviar invitación"}
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
          </div>
        )}
      </div>
    </div>
  );
}
