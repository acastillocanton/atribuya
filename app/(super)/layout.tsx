import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrgContext } from "@/lib/supabase/org";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Frame } from "@/components/layout/Frame";

/**
 * Super-admin layout. Defense-in-depth on top of the middleware: even if
 * something slipped past the URL allowlist, this layout re-checks
 * `is_super_admin` server-side and redirects otherwise.
 *
 * No sidebar — super-admins only have /super for now. A simple top bar with
 * the brand + signout is enough.
 */
export default async function SuperLayout({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const ctx = await getCurrentOrgContext(supabase);
    if (!ctx) redirect("/login");
    if (!ctx.isSuperAdmin) redirect("/login?error=not-super-admin");
  }

  return (
    <Frame>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 32px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <Link
            href="/super"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            <img
              src="/brand/logo-horizontal.png"
              alt="Atribuya"
              width={132}
              height={42}
              style={{ display: "block", height: "auto" }}
            />
            <span
              style={{
                fontSize: 13,
                color: "var(--ink-muted)",
                fontWeight: 500,
              }}
            >
              · Super-admin
            </span>
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                padding: "6px 12px",
                fontSize: 13,
                color: "var(--ink-muted)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </form>
        </header>
        {children}
      </main>
    </Frame>
  );
}
