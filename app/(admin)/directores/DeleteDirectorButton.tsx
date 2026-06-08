"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDirector } from "./actions";

export function DeleteDirectorButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  function onClick() {
    const ok = window.confirm(
      `¿Eliminar al director ${name}?\n\nSus comerciales NO se borran: quedan sin director asignado (en el pool del admin).`,
    );
    if (!ok) return;
    startTransition(async () => {
      const r = await deleteDirector(id);
      if (!r.ok) {
        alert(r.error);
        return;
      }
      router.refresh();
    });
  }
  return (
    <button
      type="button"
      onClick={onClick}
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
      {isPending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
