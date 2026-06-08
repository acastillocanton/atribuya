"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { GhostBtn } from "@/components/ui/GhostBtn";
import { deleteClientRecord, findOrphanReviewsForClient, type ClientRow } from "./actions";
import { ClientLinkDialog } from "./ClientLinkDialog";
import { OrphanReviewsModal } from "@/components/clients/OrphanReviewsModal";
import type { OrphanReviewCandidate } from "@/lib/clients/orphan-reviews";

type ClientRowItemProps = {
  client: ClientRow;
  last: boolean;
  appBase: string;
  orgSlug: string;
  salesName: string;
  salesSlug: string;
};

export function ClientRowItem({
  client,
  last,
  appBase,
  orgSlug,
  salesName,
  salesSlug,
}: ClientRowItemProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [scanning, setScanning] = useState(false);
  const [orphanOpen, setOrphanOpen] = useState(false);
  const [orphanCandidates, setOrphanCandidates] = useState<OrphanReviewCandidate[]>([]);
  const [orphanAutoLinked, setOrphanAutoLinked] = useState(0);

  function onDelete() {
    const ok = window.confirm(
      `¿Eliminar a ${client.full_name}?\n\nSu enlace dejará de funcionar para nuevas reseñas; las reseñas ya atribuidas se conservan.`,
    );
    if (!ok) return;
    startTransition(async () => {
      const r = await deleteClientRecord(client.id);
      if (!r.ok) alert(r.error);
    });
  }

  // Re-escanea reseñas sueltas del comercial que se parezcan a este cliente:
  // vincula las casi-exactas y abre el modal con las dudosas.
  async function onScan() {
    setScanning(true);
    const r = await findOrphanReviewsForClient(client.id);
    setScanning(false);
    if (!r.ok) {
      alert(r.error);
      return;
    }
    if (r.autoLinked === 0 && r.candidates.length === 0) {
      alert("No se encontraron reseñas sueltas que se parezcan a este cliente.");
      return;
    }
    setOrphanAutoLinked(r.autoLinked);
    setOrphanCandidates(r.candidates);
    setOrphanOpen(true);
  }

  const altaLabel = new Date(client.created_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      {/* Desktop: fila tabular de 5 columnas */}
      <div
        className="sales-hide-mobile"
        style={{
          padding: "14px 22px",
          borderBottom: last ? "none" : "1px solid var(--line)",
          display: "grid",
          gridTemplateColumns: "1.6fr 1.4fr 1fr 1fr 200px",
          gap: 14,
          alignItems: "center",
          fontSize: 13.5,
        }}
      >
        <Link
          href={`/clientes/${client.slug}`}
          style={{
            minWidth: 0,
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "var(--ink)",
            }}
          >
            {client.full_name}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--ink-4)",
              fontFamily: "var(--font-mono)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            /o/{orgSlug}/c/{salesSlug}/{client.slug}
          </div>
        </Link>
        <span
          style={{
            fontSize: 12.5,
            color: client.email ? "var(--ink-3)" : "var(--ink-4)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {client.email ?? "—"}
        </span>
        <span
          style={{
            fontSize: 12.5,
            color: client.phone ? "var(--ink-3)" : "var(--ink-4)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {client.phone ?? "—"}
        </span>
        <span style={{ fontSize: 12.5, color: "var(--ink-4)" }}>{altaLabel}</span>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <GhostBtn onClick={() => setOpen(true)}>Ver enlace</GhostBtn>
          <button type="button" onClick={onScan} disabled={scanning} style={secondaryBtn(scanning)}>
            {scanning ? "…" : "Buscar reseñas"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            style={{
              padding: "5px 10px",
              background: "transparent",
              border: "1px solid var(--line-strong)",
              borderRadius: 7,
              fontSize: 12,
              color: "var(--ink-3)",
              cursor: isPending ? "wait" : "pointer",
            }}
          >
            {isPending ? "…" : "Eliminar"}
          </button>
        </div>
      </div>

      {/* Mobile: card vertical */}
      <div
        className="sales-mobile-only"
        style={{
          padding: "14px 16px",
          borderBottom: last ? "none" : "1px solid var(--line)",
        }}
      >
        <Link
          href={`/clientes/${client.slug}`}
          style={{
            display: "block",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--ink)",
            }}
          >
            {client.full_name}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--ink-4)",
              fontFamily: "var(--font-mono)",
              marginTop: 2,
              wordBreak: "break-all",
            }}
          >
            /o/{orgSlug}/c/{salesSlug}/{client.slug}
          </div>
        </Link>
        <div
          style={{
            marginTop: 10,
            display: "grid",
            gap: 4,
            fontSize: 12.5,
            color: "var(--ink-3)",
          }}
        >
          <div>
            <span style={{ color: "var(--ink-4)", marginRight: 6 }}>Email</span>
            {client.email ?? "—"}
          </div>
          <div>
            <span style={{ color: "var(--ink-4)", marginRight: 6 }}>Teléfono</span>
            {client.phone ?? "—"}
          </div>
          <div>
            <span style={{ color: "var(--ink-4)", marginRight: 6 }}>Alta</span>
            {altaLabel}
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GhostBtn onClick={() => setOpen(true)}>Ver enlace</GhostBtn>
          <button type="button" onClick={onScan} disabled={scanning} style={secondaryBtn(scanning)}>
            {scanning ? "…" : "Buscar reseñas"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            style={{
              padding: "6px 12px",
              background: "transparent",
              border: "1px solid var(--line-strong)",
              borderRadius: 7,
              fontSize: 12.5,
              color: "var(--ink-3)",
              cursor: isPending ? "wait" : "pointer",
            }}
          >
            {isPending ? "…" : "Eliminar"}
          </button>
        </div>
      </div>

      <ClientLinkDialog
        open={open}
        onClose={() => setOpen(false)}
        appBase={appBase}
        orgSlug={orgSlug}
        salesName={salesName}
        salesSlug={salesSlug}
        clientName={client.full_name}
        clientSlug={client.slug}
        clientEmail={client.email}
        clientPhone={client.phone}
      />

      {orphanOpen && (
        <OrphanReviewsModal
          open={true}
          onClose={() => setOrphanOpen(false)}
          clientId={client.id}
          clientName={client.full_name}
          candidates={orphanCandidates}
          autoLinkedCount={orphanAutoLinked}
        />
      )}
    </>
  );
}

function secondaryBtn(busy: boolean): React.CSSProperties {
  return {
    padding: "5px 10px",
    background: "transparent",
    border: "1px solid var(--line-strong)",
    borderRadius: 7,
    fontSize: 12,
    color: "var(--ink-3)",
    cursor: busy ? "wait" : "pointer",
  };
}
