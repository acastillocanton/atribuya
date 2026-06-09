"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GhostBtn } from "@/components/ui/GhostBtn";
import { inviteOfficeDirector } from "./actions";

type LocationOption = { id: string; name: string };

export function InviteDirectorButton({ locations }: { locations: LocationOption[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ link: string; email: string; emailSent: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function close() {
    const created = success !== null;
    setOpen(false);
    setError(null);
    setSuccess(null);
    setCopied(false);
    // Refresca la lista al cerrar (no durante la acción, que desmontaría el
    // modal si la página estaba en empty-state).
    if (created) router.refresh();
  }

  // onSubmit + preventDefault: React 19 resetea los campos no controlados al
  // terminar una <form action={fn}>, también al fallar. Así se conservan.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const input = {
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        locationId: String(formData.get("locationId") ?? ""),
        monthlyGoal: String(formData.get("monthlyGoal") ?? "5"),
        commissionRate: String(formData.get("commissionRate") ?? ""),
      };
      const result = await inviteOfficeDirector(input as never);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess({ link: result.inviteLink, email: result.email, emailSent: result.emailSent });
    });
  }

  return (
    <>
      <GhostBtn primary onClick={() => setOpen(true)}>
        + Invitar director
      </GhostBtn>

      {open && (
        <div
          style={modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div style={modalCard}>
            <div style={modalHeader}>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 500 }}>
                Nuevo director de oficina
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  marginTop: 2,
                }}
              >
                Invita a un director
              </div>
            </div>

            {success ? (
              <div style={{ padding: "18px 22px" }}>
                <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
                  {success.emailSent ? (
                    <>
                      Director invitado. Le hemos enviado el acceso por email a{" "}
                      <strong>{success.email}</strong>. Enlace de respaldo por si
                      no le llega (que revise spam):
                    </>
                  ) : (
                    <>
                      Director invitado, pero no pudimos enviarle el email.
                      Envíale este enlace de acceso de un solo uso a{" "}
                      <strong>{success.email}</strong>:
                    </>
                  )}
                </p>
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 9,
                    background: "var(--surface-2)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    wordBreak: "break-all",
                  }}
                >
                  {success.link}
                </div>
                <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <GhostBtn
                    onClick={() => {
                      navigator.clipboard?.writeText(success.link);
                      setCopied(true);
                    }}
                  >
                    {copied ? "Copiado" : "Copiar enlace"}
                  </GhostBtn>
                  <GhostBtn primary onClick={close}>
                    Hecho
                  </GhostBtn>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="Nombre completo">
                    <input name="fullName" required minLength={2} maxLength={120} autoFocus style={inputStyle} />
                  </Field>
                  <Field label="Email">
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={120}
                      autoComplete="off"
                      style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
                    />
                  </Field>
                  <Field label="Teléfono (opcional)">
                    <input name="phone" type="tel" maxLength={40} style={inputStyle} />
                  </Field>
                  <Field label="Ficha (oficina)">
                    <select name="locationId" required style={inputStyle} defaultValue="">
                      <option value="" disabled>
                        Selecciona…
                      </option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Objetivo mensual">
                    <input name="monthlyGoal" type="number" min={0} max={1000} defaultValue={5} required style={inputStyle} />
                  </Field>
                  <Field label="Tarifa por reseña (€, opcional)">
                    <input name="commissionRate" type="number" min={0} step="0.01" inputMode="decimal" placeholder="Sin tarifa" style={inputStyle} />
                  </Field>
                  {error && (
                    <div
                      role="alert"
                      style={{
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
                </div>
                <div
                  style={{
                    padding: "14px 22px",
                    borderTop: "1px solid var(--line)",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  <GhostBtn type="button" onClick={close} disabled={isPending}>
                    Cancelar
                  </GhostBtn>
                  <GhostBtn primary type="submit" disabled={isPending}>
                    {isPending ? "Invitando…" : "Invitar director"}
                  </GhostBtn>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const modalBackdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  background: "rgba(20,20,22,0.32)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const modalCard: React.CSSProperties = {
  width: 520,
  maxWidth: "100%",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 18,
  boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const modalHeader: React.CSSProperties = {
  padding: "20px 22px 14px",
  borderBottom: "1px solid var(--line)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--surface)",
  border: "1px solid var(--line-strong)",
  borderRadius: 9,
  fontSize: 13,
  color: "var(--ink)",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--ink-4)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
