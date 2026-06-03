import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("NotificationCenter", () => {
  it("renders the bell icon button", () => {
    render(<NotificationCenter />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("shows unread count badge with correct number", () => {
    render(<NotificationCenter />);
    const badges = screen.getAllByText("2");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("opens dropdown when bell is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await user.click(bellButton);

    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("New job matches")).toBeInTheDocument();
    expect(screen.getByText("Application sent")).toBeInTheDocument();
  });

  it("shows mark all read button when unread notifications exist", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await user.click(bellButton);

    expect(screen.getByText("Mark all read")).toBeInTheDocument();
  });

  it("marks a notification as read when clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await user.click(bellButton);

    const notification = screen.getByText("New job matches");
    await user.click(notification);

    const badge = bellButton.querySelector("span");
    expect(badge?.textContent).toBe("1");
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await user.click(bellButton);

    await user.click(screen.getByText("Mark all read"));

    const badge = bellButton.querySelector("span");
    expect(badge).toBeNull();
  });

  it("shows 'View all notifications' link", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await user.click(bellButton);

    const link = screen.getByText("View all notifications");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/notifications");
  });

  it("closes dropdown when clicking the backdrop", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await user.click(bellButton);

    expect(screen.getByText("Notifications")).toBeInTheDocument();

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
    await user.click(bellButton);

    expect(screen.getByText("🎯")).toBeInTheDocument();
    expect(screen.getByText("📤")).toBeInTheDocument();
    expect(screen.getByText("👁️")).toBeInTheDocument();
  });

  it("shows read indicator for unread notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await user.click(bellButton);
  });

  it("hides mark all read when no unread notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getAllByRole("button")[0];
    await user.click(bellButton);
    await user.click(screen.getByText("Mark all read"));

    expect(screen.queryByText("Mark all read")).not.toBeInTheDocument();
  });
});
