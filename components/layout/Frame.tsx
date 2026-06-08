import type { ReactNode } from "react";

export function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        background: "var(--bg)",
        color: "var(--ink)",
        display: "flex",
        fontFamily: "var(--font-text)",
        letterSpacing: "-0.01em",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
