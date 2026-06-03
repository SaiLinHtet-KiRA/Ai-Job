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
  application_sent: "\uD83D\uDCE4",
  match_found: "\uD83C\uDFAF",
  application_opened: "\uD83D\uDC41\uFE0F",
  system: "\uD83D\uDCE2",
};

const typeColors: Record<string, string> = {
  application_sent: "bg-blue-500/10 text-blue-400",
  match_found: "bg-emerald-500/10 text-emerald-400",
  application_opened: "bg-purple-500/10 text-purple-400",
  system: "bg-amber-500/10 text-amber-400",
};

function formatTime(date: string) {
  const now = new Date();
  const notif = new Date(date);
  const diff = now.getTime() - notif.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationDropdown({
  open,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: {
  open: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#0a2540] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-primary hover:text-primary-dark"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-[#8898aa]">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onMarkRead(notification.id)}
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
  );
}
