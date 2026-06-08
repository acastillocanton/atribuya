"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Stars } from "@/components/ui/Stars";
import { claimReview } from "./actions";

type ClientOption = { id: string; full_name: string };

export type ClaimableReview = {
  id: string;
  author_name: string | null;
  rating: number;
  text: string | null;
  google_created_at: string;
  location_name: string | null;
};

/**
 * Fila "Es mía": el comercial reconoce una reseña huérfana de su ficha y la
 * reclama, opcionalmente vinculándola a un cliente suyo (existente o nuevo).
 */
export function SalesClaimRow({
  review,
  clients,
}: {
  review: ClaimableReview;
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [newClientName, setNewClientName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);

  const date = new Date(review.google_created_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  function onClaim() {
    setError(null);
    startTransition(async () => {
      const r = await claimReview({
        reviewId: review.id,
        clientId: creatingNew ? null : clientId || null,
        newClientName: creatingNew ? newClientName.trim() || null : null,
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: "1 1 320px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>
              {review.author_name ?? "Anónimo"}
            </span>
            <Stars value={review.rating} size={14} />
            <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{date}</span>
            <span style={{ fontSize: 12, color: "var(--ink-4)" }}>
              · {review.location_name ?? "Sin ficha"}
            </span>
          </div>
          {review.text && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13.5,
                color: "var(--ink-2)",
                lineHeight: 1.5,
                maxWidth: 620,
              }}
            >
              {review.text}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {creatingNew ? (
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            style={inputStyle}
          />
        ) : (
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Sin cliente (solo a mi nombre)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => {
            setCreatingNew((v) => !v);
            setError(null);
          }}
          style={linkBtnStyle}
        >
          {creatingNew ? "Elegir existente" : "+ Nuevo cliente"}
        </button>

        <button
          type="button"
          onClick={onClaim}
          disabled={isPending || (creatingNew && newClientName.trim().length < 2)}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            borderRadius: 9,
            border: "1px solid var(--ink)",
            background: "var(--ink)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: isPending ? "default" : "pointer",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? "Reclamando…" : "Es mía"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 10,
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
    </Card>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 9,
  border: "1px solid var(--line-strong)",
  background: "var(--surface)",
  fontSize: 13.5,
  minWidth: 220,
};

const linkBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--ink-3)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "underline",
  padding: 0,
};
