import { Frame } from "@/components/layout/Frame";
import {
  Sidebar,
  ADMIN_SIDEBAR_GROUPS,
  MANAGER_SIDEBAR_GROUPS,
  OFFICE_DIRECTOR_SIDEBAR_GROUPS,
} from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupportUnreadCount } from "@/lib/support/unread";

/**
 * Layout del grupo (admin). El gestor de reseñas comparte casi todas las
 * pantallas con el admin (Dashboard, /comerciales, /comerciales/[slug]) y
 * ahora con plenos permisos de administración sobre comerciales (ver
 * migración 005). Lo que sigue siendo solo-admin es /gestores, /fichas y
 * /resenas/verificacion. Este layout detecta el rol y pinta el
 * sidebar correcto: admin o gestor — misma URL, distinto chrome.
 */
export default async function AdminLayout({
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

  const role = profile?.role;
  const groups =
    role === "reviews_manager"
      ? MANAGER_SIDEBAR_GROUPS
      : role === "office_director"
        ? OFFICE_DIRECTOR_SIDEBAR_GROUPS
        : ADMIN_SIDEBAR_GROUPS;
  const user =
    role === "reviews_manager"
      ? {
          name: profile?.full_name ?? "Gestor de reseñas",
          subtitle: "Gestor · Atribuya",
          avatarUrl: profile?.avatar_url,
        }
      : role === "office_director"
        ? {
            name: profile?.full_name ?? "Director",
            subtitle: "Director · Atribuya",
            avatarUrl: profile?.avatar_url,
          }
        : {
            name: profile?.full_name ?? "Administrador",
            subtitle: "Admin · Atribuya",
            avatarUrl: profile?.avatar_url,
          };

  return (
    <Frame>
      <Sidebar groups={groups} user={user} supportUnreadCount={supportUnread} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" }}>
        {children}
      </main>
    </Frame>
  );
}
