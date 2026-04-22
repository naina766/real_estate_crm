"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Bell, Search, Plus, Menu, Check, AlertCircle } from "lucide-react";
import { cn } from "@/components/ui";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Lead Management",
  "/properties": "Properties",
  "/clients": "Clients",
  "/deals": "Deal Pipeline",
  "/communications": "Activity Timeline",
  "/agents": "Agent Management",
  "/reports": "Reports & Analytics",
};

const createHref: Record<string, string> = {
  "/leads": "/leads/new",
  "/properties": "/properties/new",
  "/clients": "/clients/new",
  "/deals": "/deals/new",
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const basePath = "/" + pathname.split("/")[1];
  const title = pageTitles[basePath] || "RealCRM";
  const newHref = createHref[basePath];
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch notifications
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.data?.items || []);
        setUnreadCount(data.data?.items?.filter((n: Notification) => !n.isRead).length || 0);
      })
      .catch(() => {});
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LEAD_ASSIGNED":
        return <AlertCircle size={14} className="text-blue-400" />;
      case "FOLLOW_UP_DUE":
        return <AlertCircle size={14} className="text-amber-400" />;
      case "DEAL_STAGE_CHANGE":
        return <AlertCircle size={14} className="text-emerald-400" />;
      default:
        return <Bell size={14} className="text-violet-400" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#0f1117]/80 backdrop-blur-sm border-b border-[#1e2a44] sticky top-0 z-30">
      {/* Left: Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1a2035] transition-all"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-[#f1f5ff]">{title}</h1>
          <p className="text-[11px] text-[#4a5a80] hidden sm:block">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search shortcut */}
        <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#161b27] border border-[#2a3356] rounded-xl text-xs text-[#4a5a80] hover:border-[#3a4366] hover:text-[#8892b0] transition-all">
          <Search size={13} />
          <span>Search...</span>
          <kbd className="px-1.5 py-0.5 bg-[#2a3356] rounded text-[10px]">⌘K</kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1a2035] border border-transparent hover:border-[#2a3356] transition-all"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 min-w-4 h-4 flex items-center justify-center bg-blue-500 rounded-full text-[10px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-12 w-80 bg-[#1a2035] border border-[#2a3356] rounded-2xl shadow-2xl z-20 animate-scale-in">
                <div className="flex items-center justify-between p-3 border-b border-[#1e2a44]">
                  <h3 className="text-sm font-semibold text-[#f1f5ff]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#4a5a80]">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "flex items-start gap-3 p-3 border-b border-[#1e2a44] cursor-pointer transition-all hover:bg-[#1e2640]",
                          !n.isRead && "bg-blue-500/5"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-xs font-medium truncate",
                              !n.isRead
                                ? "text-[#f1f5ff]"
                                : "text-[#8892b0]"
                            )}
                          >
                            {n.title}
                          </p>
                          <p className="text-[11px] text-[#4a5a80] truncate mt-0.5">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-[#3d5080] mt-1">
                            {getTimeAgo(n.createdAt)}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-[#1e2a44]">
                  <Link
                    href="/settings#notifications"
                    className="flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-300 py-1"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Create button */}
        {newHref && (
          <Link
            href={newHref}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl text-sm font-medium text-white hover:from-blue-600 hover:to-violet-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New</span>
          </Link>
        )}
      </div>
    </header>
  );
}
