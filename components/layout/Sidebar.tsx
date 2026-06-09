"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  type LucideIcon,
  LayoutDashboard,
  Users,
  UserCog,
  MapPin,
  ListChecks,
  Star,
  Download,
  Reply,
  Link2,
  LifeBuoy,
  MessageCircle,
  Trophy,
  Building2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { pickActiveId } from "./active-item";

export type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Item deshabilitado (sin enlace), para funciones aún no disponibles. */
  disabled?: boolean;
  /** Etiqueta corta a la derecha del item. Ej. "PRONTO". */
  badge?: string;
};

export type SidebarGroup = {
  id: string;
  /** Si se omite, el grupo se renderiza sin header (útil para sidebars cortos). */
  label?: string;
  items: SidebarItem[];
};

type SidebarProps = {
  groups: SidebarGroup[];
  user: { name: string; subtitle: string; avatarUrl?: string | null };
};

export function Sidebar({ groups, user }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const allItems = useMemo(
    // Los items deshabilitados (ej. "Respuestas · PRONTO", href "#") quedan
    // fuera: su basePath vacío haría prefix-match con cualquier ruta.
    () => groups.flatMap((g) => g.items).filter((it) => !it.disabled),
    [groups],
  );
  const activeId = useMemo(() => pickActiveId(allItems, pathname), [allItems, pathname]);

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        background: "var(--bg)",
        borderRight: "1px solid var(--line)",
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 8px",
        }}
      >
        <img
          src="/brand/logo-cuadrado.png"
          alt=""
          aria-hidden="true"
          width={26}
          height={26}
          style={{ display: "block", borderRadius: 6 }}
        />
        <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.015em" }}>
          Atribuya
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {groups.map((group) => (
          <div key={group.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {group.label && (
              <div
                style={{
                  padding: "2px 12px 4px",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--ink-4)",
                  fontWeight: 600,
                }}
              >
                {group.label}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.map((it) => {
                const on = it.id === activeId;
                const Icon = it.icon;

                const iconEl = (
                  <Icon
                    aria-hidden="true"
                    size={16}
                    strokeWidth={on ? 2 : 1.75}
                    style={{
                      color: on ? "var(--ink)" : "var(--ink-4)",
                      flexShrink: 0,
                    }}
                  />
                );
                const badgeEl = it.badge && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "var(--ink-4)",
                      border: "1px solid var(--line-strong)",
                      borderRadius: 5,
                      padding: "1px 5px",
                    }}
                  >
                    {it.badge}
                  </span>
                );

                // Item deshabilitado: sin enlace, atenuado, no enfocable.
                if (it.disabled) {
                  return (
                    <div
                      key={it.id}
                      aria-disabled="true"
                      title="Disponible próximamente"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "7px 10px",
                        borderRadius: 8,
                        color: "var(--ink-4)",
                        fontSize: 13.5,
                        fontWeight: 500,
                        opacity: 0.6,
                        cursor: "default",
                      }}
                    >
                      {iconEl}
                      <span>{it.label}</span>
                      {badgeEl}
                    </div>
                  );
                }

                return (
                  <Link
                    key={it.id}
                    href={it.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 10px",
                      borderRadius: 8,
                      background: on ? "rgba(0,0,0,0.05)" : "transparent",
                      color: on ? "var(--ink)" : "var(--ink-3)",
                      fontSize: 13.5,
                      fontWeight: on ? 600 : 500,
                      textDecoration: "none",
                    }}
                    aria-current={on ? "page" : undefined}
                  >
                    {iconEl}
                    <span>{it.label}</span>
                    {badgeEl}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          padding: "8px 8px",
          borderTop: "1px solid var(--line)",
          paddingTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Soporte interno (helpdesk) — accesible a los tres roles. Sin badge
            de no-leídos por ahora (requeriría llamar a support_unread_count()
            en el layout; se añade cuando la migración 016 esté aplicada). */}
        <Link
          href="/soporte"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 10px",
            borderRadius: 8,
            background: pathname.startsWith("/soporte") ? "rgba(0,0,0,0.05)" : "transparent",
            color: pathname.startsWith("/soporte") ? "var(--ink)" : "var(--ink-3)",
            fontSize: 13.5,
            fontWeight: pathname.startsWith("/soporte") ? 600 : 500,
            textDecoration: "none",
          }}
        >
          <MessageCircle
            aria-hidden="true"
            size={16}
            strokeWidth={pathname.startsWith("/soporte") ? 2 : 1.75}
            style={{
              color: pathname.startsWith("/soporte") ? "var(--ink)" : "var(--ink-4)",
              flexShrink: 0,
            }}
          />
          <span>Soporte</span>
        </Link>

        {/* Centro de ayuda — accesible a los tres roles. Pintado justo
            encima del avatar de perfil para que esté visible siempre sin
            ocupar espacio de la navegación principal. */}
        <Link
          href="/ayuda"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 10px",
            borderRadius: 8,
            background: pathname.startsWith("/ayuda") ? "rgba(0,0,0,0.05)" : "transparent",
            color: pathname.startsWith("/ayuda") ? "var(--ink)" : "var(--ink-3)",
            fontSize: 13.5,
            fontWeight: pathname.startsWith("/ayuda") ? 600 : 500,
            textDecoration: "none",
          }}
        >
          <LifeBuoy
            aria-hidden="true"
            size={16}
            strokeWidth={pathname.startsWith("/ayuda") ? 2 : 1.75}
            style={{
              color: pathname.startsWith("/ayuda") ? "var(--ink)" : "var(--ink-4)",
              flexShrink: 0,
            }}
          />
          <span>Ayuda</span>
        </Link>
        <Link
          href="/perfil"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
            textDecoration: "none",
            color: "inherit",
            padding: "6px 8px",
            borderRadius: 8,
          }}
          aria-label="Ver mi perfil"
        >
          <Avatar name={user.name} size={28} src={user.avatarUrl} />
          <div style={{ lineHeight: 1.15, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{user.subtitle}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export const ADMIN_SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: "home",
    label: "Inicio",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "ranking", label: "Ranking", href: "/ranking", icon: Trophy },
    ],
  },
  {
    id: "reviews",
    label: "Reseñas",
    items: [
      { id: "review-list", label: "Lista de reseñas", href: "/manager/resenas", icon: Star },
      { id: "verification", label: "Verificación", href: "/resenas/verificacion", icon: ListChecks },
      { id: "replies", label: "Respuestas", href: "#", icon: Reply, disabled: true, badge: "PRONTO" },
    ],
  },
  {
    id: "team",
    label: "Equipo",
    items: [
      { id: "directors", label: "Directores", href: "/directores", icon: Building2 },
      { id: "sales", label: "Comerciales", href: "/comerciales", icon: Users },
      { id: "managers", label: "Gestores", href: "/gestores", icon: UserCog },
    ],
  },
  {
    id: "config",
    label: "Configuración",
    items: [
      { id: "branches", label: "Fichas Google", href: "/fichas", icon: MapPin },
    ],
  },
];

export const SALES_SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: "main",
    items: [
      { id: "panel", label: "Mi panel", href: "/panel", icon: LayoutDashboard },
      { id: "link", label: "Mi enlace", href: "/panel/enlace", icon: Link2 },
      { id: "clients", label: "Mis clientes", href: "/clientes", icon: Users },
      { id: "reviews", label: "Mis reseñas", href: "/panel/resenas", icon: Star },
      { id: "verification", label: "Verificación", href: "/resenas/verificacion", icon: ListChecks },
    ],
  },
];

export const MANAGER_SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: "main",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "team", label: "Comerciales", href: "/comerciales", icon: Users },
      { id: "ranking", label: "Ranking", href: "/ranking", icon: Trophy },
      { id: "reviews", label: "Reseñas", href: "/manager/resenas", icon: Star },
      { id: "export", label: "Exportar Excel", href: "/manager/export", icon: Download },
    ],
  },
];

// El director de oficina es DUAL: produce (su panel/enlace/clientes/reseñas) y
// gestiona su equipo (dashboard, comerciales, ranking, verificación, su ficha),
// todo scopeado por RLS a su equipo y su org (mig 021).
export const OFFICE_DIRECTOR_SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: "home",
    label: "Inicio",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "panel",
    label: "Mi panel",
    items: [
      { id: "panel", label: "Mi panel", href: "/panel", icon: LayoutDashboard },
      { id: "link", label: "Mi enlace", href: "/panel/enlace", icon: Link2 },
      { id: "myclients", label: "Mis clientes", href: "/clientes", icon: Users },
      { id: "myreviews", label: "Mis reseñas", href: "/panel/resenas", icon: Star },
    ],
  },
  {
    id: "team",
    label: "Mi oficina",
    items: [
      { id: "verification", label: "Verificación", href: "/resenas/verificacion", icon: ListChecks },
      { id: "sales", label: "Comerciales", href: "/comerciales", icon: Users },
      { id: "branch", label: "Mi ficha", href: "/fichas", icon: MapPin },
      { id: "team-ranking", label: "Ranking", href: "/ranking", icon: Trophy },
    ],
  },
];
