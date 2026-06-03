"use client";

import { useState } from "react";
import NotificationBell from "./NotificationBell";
import NotificationDropdown from "./NotificationDropdown";

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

  return (
    <div className="relative">
      <NotificationBell
        unreadCount={unreadCount}
        onClick={() => setOpen(!open)}
      />
      <NotificationDropdown
        open={open}
        notifications={notifications}
        onClose={() => setOpen(false)}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
      />
    </div>
  );
}
