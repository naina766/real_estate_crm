"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/components/ui";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Handshake,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Zap,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/clients", label: "Clients", icon: UserCheck },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/communications", label: "Activity", icon: MessageSquare },
  { href: "/agents", label: "Agents", icon: ShieldCheck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-[#0f1117] border-r border-[#1e2a44] transition-all duration-300 ease-in-out flex-shrink-0 z-40",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* ── Logo ── */}
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-[#1e2a44]", collapsed && "justify-center px-0")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-sm text-[#f1f5ff] tracking-tight">RealCRM</span>
            <p className="text-[10px] text-[#4a5a80] -mt-0.5">Real Estate CRM</p>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#1a2035] border border-[#2a3356] flex items-center justify-center text-[#8892b0] hover:text-[#f1f5ff] hover:border-[#4f8ef7] transition-all z-50 shadow-md"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-gradient-to-r from-blue-500/15 to-violet-500/10 text-[#4f8ef7] border border-blue-500/20"
                  : "text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1a2035]"
              )}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-[#4f8ef7]" : "text-[#4a5a80] group-hover:text-[#8892b0]"
                )}
                size={18}
              />
              {!collapsed && <span>{label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom user area ── */}
      <div className={cn("p-3 border-t border-[#1e2a44]", collapsed && "flex flex-col items-center gap-2")}>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1a2035] transition-all group",
            collapsed && "justify-center"
          )}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            AD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#f1f5ff] truncate">Admin User</p>
              <p className="text-[10px] text-[#4a5a80] truncate">admin@realcrm.com</p>
            </div>
          )}
        </Link>
        <button
          onClick={() => fetch("/api/auth/refresh", { method: "DELETE" }).then(() => (window.location.href = "/login"))}
          className={cn(
            "flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={14} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
