"use client";

import { useState } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "application_sent" | "match_found" | "application_opened" | "system";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: {
    job_title?: string;
    company?: string;
    count?: number;
  };
}

const typeIcons: Record<string, string> = {
  application_sent: "📤",
  match_found: "🎯",
  application_opened: "👁️",
  system: "📢",
};

const typeColors: Record<string, string> = {
  application_sent: "bg-blue-500/10 text-blue-400",
  match_found: "bg-emerald-500/10 text-emerald-400",
  application_opened: "bg-purple-500/10 text-purple-400",
  system: "bg-amber-500/10 text-amber-400",
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "match_found",
    title: "New job matches",
    message: "We found 3 new jobs matching your profile",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    data: { count: 3 },
  },
  {
    id: "2",
    type: "application_sent",
    title: "Application sent",
    message: "Your application to CloudBase was sent successfully",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    data: { job_title: "Frontend Developer", company: "CloudBase" },
  },
  {
    id: "3",
    type: "application_opened",
    title: "Application viewed",
    message: "DataFlow opened your application",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    data: { company: "DataFlow" },
  },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notif = new Date(date);
    const diff = now.getTime() - notif.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-[#8898aa] transition-colors hover:bg-white/5 hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#0a2540] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary-dark"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[13px] text-[#8898aa]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`cursor-pointer border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5 ${
                      !notification.read ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                          typeColors[notification.type]
                        }`}
                      >
                        {typeIcons[notification.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#8898aa] line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[11px] text-[#8898aa]/60">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-4 py-2">
              <Link
                href="/notifications"
                className="block text-center text-xs text-[#8898aa] hover:text-white"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
