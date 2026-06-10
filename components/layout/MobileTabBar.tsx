"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  type LucideIcon,
  LayoutDashboard,
  Link2,
  Star,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { pickActiveId } from "./active-item";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

const TABS: Tab[] = [
  { id: "panel", label: "Panel", href: "/panel", icon: LayoutDashboard },
  { id: "link", label: "Enlace", href: "/panel/enlace", icon: Link2 },
  { id: "reviews", label: "Reseñas", href: "/panel/resenas", icon: Star },
  { id: "ranking", label: "Ranking", href: "/panel/ranking", icon: Trophy },
  { id: "support", label: "Soporte", href: "/soporte", icon: MessageCircle },
];

/**
 * Tab bar fija inferior — solo se ve en mobile (viewport ≤767px) gracias al
 * wrapper `.sales-hide-desktop` que el (sales)/layout pone alrededor.
 *
 * Items del rol comercial + Soporte (única vía a /soporte en mobile, donde no
 * hay sidebar). "Clientes" intencionalmente no está aquí: se accede desde el
 * Panel (card "Mis clientes" mobile-only) o por URL directa.
 */
export function MobileTabBar({ supportUnreadCount = 0 }: { supportUnreadCount?: number } = {}) {
  const pathname = usePathname() ?? "";
  const activeId = useMemo(() => pickActiveId(TABS, pathname), [pathname]);

  return (
    <nav
      aria-label="Navegación principal"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        paddingTop: 8,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "stretch",
        boxShadow: "0 -1px 0 rgba(0, 0, 0, 0.02)",
      }}
    >
      {TABS.map((t) => {
        const on = t.id === activeId;
        const Icon = t.icon;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={on ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 4px",
              color: on ? "var(--ink)" : "var(--ink-4)",
              fontWeight: on ? 600 : 500,
              textDecoration: "none",
              minHeight: 44,
            }}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <Icon
                aria-hidden="true"
                size={20}
                strokeWidth={on ? 2 : 1.75}
                style={{ color: on ? "var(--ink)" : "var(--ink-4)" }}
              />
              {t.id === "support" && supportUnreadCount > 0 && (
                <span
                  aria-label={`${supportUnreadCount} sin leer`}
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -8,
                    minWidth: 15,
                    height: 15,
                    padding: "0 4px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: "#fff",
                    background: "#2563eb",
                    borderRadius: 8,
                  }}
                >
                  {supportUnreadCount > 9 ? "9+" : supportUnreadCount}
                </span>
              )}
            </span>
            <span style={{ fontSize: 10.5, letterSpacing: "-0.005em" }}>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
