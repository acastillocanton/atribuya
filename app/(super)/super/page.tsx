import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CreateOrgForm } from "./CreateOrgForm";
import { OrgRowActions } from "./OrgRowActions";
import { planLabel } from "./plans";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: "trial" | "active" | "suspended" | "churned";
  plan: string;
  billing_email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  fiscal_data: Record<string, string> | null;
};

/** Required fields for a "fiscally complete" org (i.e. ready to invoice / sign a DPA). */
const FISCAL_REQUIRED: ReadonlyArray<string> = [
  "legal_name",
  "tax_id",
  "address",
  "postal_code",
  "city",
];

function fiscalCompleteness(fd: Record<string, string> | null): "complete" | "partial" | "empty" {
  if (!fd || Object.keys(fd).length === 0) return "empty";
  const present = FISCAL_REQUIRED.filter((k) => fd[k] && fd[k].trim() !== "");
  if (present.length === FISCAL_REQUIRED.length) return "complete";
  return "partial";
}

const FISCAL_BADGE: Record<ReturnType<typeof fiscalCompleteness>, { label: string; color: string; bg: string }> = {
  complete: { label: "Fiscales ✓", color: "#0b6a2f", bg: "#d6f3df" },
  partial: { label: "Fiscales parciales", color: "#7c5e00", bg: "#fff4cc" },
  empty: { label: "Fiscales pendientes", color: "#7a2929", bg: "#f8d7d7" },
};

const STATUS_STYLE: Record<OrgRow["status"], { label: string; color: string; bg: string }> = {
  trial: { label: "Trial", color: "#7c5e00", bg: "#fff4cc" },
  active: { label: "Activa", color: "#0b6a2f", bg: "#d6f3df" },
  suspended: { label: "Suspendida", color: "#7a2929", bg: "#f8d7d7" },
  churned: { label: "Baja", color: "#3f3f46", bg: "#e4e4e7" },
};

export default async function SuperPage() {
  let orgs: OrgRow[] = [];
  let totalCount = 0;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    // RLS: super_admin sees all orgs via the organizations_super_admin_all
    // policy. No need for the service-role client here.
    const { data, error } = await supabase
      .from("organizations")
      .select(
        "id, name, slug, status, plan, billing_email, contact_name, contact_phone, created_at, fiscal_data",
      )
      .order("created_at", { ascending: false })
      .returns<OrgRow[]>();
    if (error) {
      console.error("[super] list orgs failed:", error);
    }
    orgs = data ?? [];
    totalCount = orgs.length;
  }

  return (
    <section style={{ padding: "32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Organizaciones</h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "4px 0 0" }}>
            {totalCount} {totalCount === 1 ? "organización" : "organizaciones"}{" "}
            registradas. Alta manual desde aquí; sin self-service por diseño.
          </p>
        </div>
      </header>

      <details
        style={{
          marginBottom: 32,
          padding: "16px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
          + Crear nueva organización
        </summary>
        <div style={{ marginTop: 16 }}>
          <CreateOrgForm />
        </div>
      </details>

      {orgs.length === 0 ? (
        <p style={{ padding: 24, textAlign: "center", color: "var(--ink-muted)" }}>
          No hay organizaciones todavía. Crea la primera arriba.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "var(--bg)", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Nombre</th>
              <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Slug</th>
              <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Estado</th>
              <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Plan</th>
              <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Contacto</th>
              <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Creada</th>
              <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => {
              const st = STATUS_STYLE[o.status];
              return (
                <tr key={o.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px", fontSize: 14, fontWeight: 500 }}>{o.name}</td>
                  <td style={{ padding: "12px", fontSize: 13, color: "var(--ink-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                    {o.slug}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: st.color,
                        background: st.bg,
                        borderRadius: 4,
                      }}
                    >
                      {st.label}
                    </span>
                    {(() => {
                      const fc = fiscalCompleteness(o.fiscal_data);
                      const fb = FISCAL_BADGE[fc];
                      return (
                        <span
                          title={
                            fc === "complete"
                              ? "Datos fiscales completos"
                              : fc === "partial"
                                ? `Faltan ${FISCAL_REQUIRED.filter(
                                    (k) =>
                                      !o.fiscal_data?.[k] ||
                                      o.fiscal_data[k].trim() === "",
                                  ).join(", ")}`
                                : "Sin datos fiscales — pendiente de completar"
                          }
                          style={{
                            display: "inline-block",
                            marginLeft: 6,
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: fb.color,
                            background: fb.bg,
                            borderRadius: 4,
                          }}
                        >
                          {fb.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: "12px", fontSize: 13 }}>{planLabel(o.plan)}</td>
                  <td style={{ padding: "12px", fontSize: 13 }}>
                    {o.contact_name ?? <span style={{ color: "var(--ink-muted)" }}>—</span>}
                    {o.billing_email && (
                      <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                        {o.billing_email}
                      </div>
                    )}
                    {o.fiscal_data?.legal_name && (
                      <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>
                        {o.fiscal_data.legal_name}
                        {o.fiscal_data.tax_id && ` · ${o.fiscal_data.tax_id}`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px", fontSize: 13, color: "var(--ink-muted)" }}>
                    {new Date(o.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <OrgRowActions org={o} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
