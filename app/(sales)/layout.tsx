import { Frame } from "@/components/layout/Frame";
import {
  Sidebar,
  SALES_SIDEBAR_GROUPS,
  OFFICE_DIRECTOR_SIDEBAR_GROUPS,
} from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { MobileProfileAvatar } from "@/components/layout/MobileProfileAvatar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupportUnreadCount } from "@/lib/support/unread";

export default async function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile: { full_name: string; role: string; avatar_url: string | null } | null = null;
  let supportUnread = 0;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const res = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url")
        .eq("id", user.id)
        .maybeSingle<{ full_name: string; role: string; avatar_url: string | null }>();
      profile = res.data;
      supportUnread = await getSupportUnreadCount(supabase);
    }
  }

  // El director también produce (usa /panel, /clientes…): cuando entra por el
  // grupo (sales) le pintamos su sidebar dual, no el del comercial.
  const isDirector = profile?.role === "office_director";
  const groups = isDirector ? OFFICE_DIRECTOR_SIDEBAR_GROUPS : SALES_SIDEBAR_GROUPS;
  const subtitle = isDirector ? "Director · Atribuya" : "Comercial";

  return (
    <Frame>
      {/* Sidebar desktop: visible ≥768px, oculto en mobile (CSS) */}
      <div className="sales-hide-mobile" style={{ display: "contents" }}>
        <Sidebar
          groups={groups}
          user={{
            name: profile?.full_name ?? (isDirector ? "Director" : "Comercial"),
            subtitle,
            avatarUrl: profile?.avatar_url,
          }}
          supportUnreadCount={supportUnread}
        />
      </div>
      <main
        className="sales-main"
        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" }}
      >
        {children}
      </main>
      {/* Chrome mobile: oculto en desktop (CSS), fixed en mobile */}
      <div className="sales-hide-desktop">
        <MobileProfileAvatar
          name={profile?.full_name ?? "Comercial"}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <MobileTabBar supportUnreadCount={supportUnread} />
      </div>
    </Frame>
  );
}
