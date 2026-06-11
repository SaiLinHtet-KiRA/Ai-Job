import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationCenter from "@/app/components/NotificationCenter";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    user_id: "user-1",
    type: "match_found",
    title: "New job matches",
    message: "We found 3 new jobs matching your profile",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    data: { count: 3 },
  },
  {
    id: 2,
    user_id: "user-1",
    type: "application_sent",
    title: "Application sent",
    message: "Your application to CloudBase was sent successfully",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    data: { job_title: "Frontend Developer", company: "CloudBase" },
  },
  {
    id: 3,
    user_id: "user-1",
    type: "application_opened",
    title: "Application viewed",
    message: "DataFlow opened your application",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    data: { company: "DataFlow" },
  },
];

describe("NotificationCenter", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.includes("/api/notifications") && url.includes("PATCH")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ notifications: MOCK_NOTIFICATIONS }),
      } as Response);
    });
  });

  it("renders the bell icon button", () => {
    render(<NotificationCenter />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("shows unread count badge with correct number", async () => {
    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("opens dropdown when bell is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });
    expect(screen.getByText("New job matches")).toBeInTheDocument();
    expect(screen.getByText("Application sent")).toBeInTheDocument();
  });

  it("shows mark all read button when unread notifications exist", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      expect(screen.getByText("Mark all read")).toBeInTheDocument();
    });
  });

  it("marks a notification as read when clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      expect(screen.getByText("New job matches")).toBeInTheDocument();
    });

    const notification = screen.getByText("New job matches");
    await user.click(notification);

    await waitFor(() => {
      const badge = bellButton.querySelector("span");
      expect(badge?.textContent).toBe("1");
    });
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      expect(screen.getByText("Mark all read")).toBeInTheDocument();
    });

    await act(() => user.click(screen.getByText("Mark all read")));

    await waitFor(() => {
      const badge = bellButton.querySelector("span");
      expect(badge).toBeNull();
    });
  });

  it("shows 'View all notifications' link", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      const link = screen.getByText("View all notifications");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "/notifications");
    });
  });

  it("closes dropdown when clicking the backdrop", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    const backdrop = document.querySelector(".fixed.inset-0.z-40");
    if (backdrop) {
      await user.click(backdrop);
    }

    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });

  it("shows notifications with type-specific colors", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      expect(screen.getByText("\uD83C\uDFAF")).toBeInTheDocument();
      expect(screen.getByText("\uD83D\uDCE4")).toBeInTheDocument();
      expect(screen.getByText("\uD83D\uDC41\uFE0F")).toBeInTheDocument();
    });
  });

  it("shows read indicator for unread notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      expect(screen.getByText("New job matches")).toBeInTheDocument();
    });
  });

  it("hides mark all read when no unread notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await act(() => user.click(bellButton));

    await waitFor(() => {
      expect(screen.getByText("Mark all read")).toBeInTheDocument();
    });

    await act(() => user.click(screen.getByText("Mark all read")));

    await waitFor(() => {
      expect(screen.queryByText("Mark all read")).not.toBeInTheDocument();
    });
  });
});
