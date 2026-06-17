import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TopNav from "@/app/components/TopNav";

const mockSignOut = vi.fn();
const mockUseSession = vi.fn();
const mockSupabaseSignOut = vi.fn().mockResolvedValue(undefined);
const mockRouterPush = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/lib/supabase-browser", () => ({
  getSupabaseBrowser: () => ({ auth: { signOut: mockSupabaseSignOut } }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => <a href={href} className={className}>{children}</a>,
}));

vi.mock("@/app/components/NotificationCenter", () => ({
  default: () => <div data-testid="notification-center">Notifications</div>,
}));

describe("TopNav", () => {
  beforeEach(() => {
    mockUseSession.mockReset();
    mockSignOut.mockReset();
  });

  describe("unauthenticated state", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    it("renders the logo linking to home", () => {
      render(<TopNav />);
      const links = screen.getAllByText("easy2apply");
      expect(links.length).toBeGreaterThan(0);
    });

    it("renders Sign in link", () => {
      render(<TopNav />);
      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });

    it("renders Get Started button", () => {
      render(<TopNav />);
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("renders CV Score link", () => {
      render(<TopNav />);
      expect(screen.getByText("CV Score")).toBeInTheDocument();
    });

    it("does not render dashboard nav links", () => {
      render(<TopNav />);
      expect(screen.queryByText("Browse Jobs")).toBeNull();
      expect(screen.queryByText("Applications")).toBeNull();
      expect(screen.queryByText("Profile")).toBeNull();
    });

    it("does not render notification center", () => {
      render(<TopNav />);
      expect(
        screen.queryByTestId("notification-center"),
      ).not.toBeInTheDocument();
    });
  });

  describe("authenticated state", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "user-1",
            email: "john@example.com",
          },
        },
        status: "authenticated",
      });
    });

    it("shows user email prefix", () => {
      render(<TopNav />);
      expect(screen.getByText("john")).toBeInTheDocument();
    });

    it("renders Sign out button", () => {
      render(<TopNav />);
      expect(screen.getByText("Sign out")).toBeInTheDocument();
    });

    it("calls signOut when clicking Sign out", async () => {
      const user = userEvent.setup();
      render(<TopNav />);

      await user.click(screen.getByText("Sign out"));
      expect(mockSignOut).toHaveBeenCalledWith({
        redirect: false,
      });
    });

    it("renders Dashboard nav link", () => {
      render(<TopNav />);
      const dashLinks = screen.getAllByText("Dashboard");
      expect(dashLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("renders notification center", () => {
      render(<TopNav />);
      expect(screen.getByTestId("notification-center")).toBeInTheDocument();
    });

    it("renders Browse Jobs link", () => {
      render(<TopNav />);
      expect(screen.getByText("Browse Jobs")).toBeInTheDocument();
    });

    it("highlights Dashboard link as active when on /dashboard", () => {
      render(<TopNav />);
      const dashLink = screen.getByText("Dashboard");
      expect(dashLink.className).toContain("font-semibold");
      expect(dashLink.className).toContain("text-white");
    });

    it("does not highlight Browse Jobs as active when on /dashboard", () => {
      render(<TopNav />);
      const jobsLink = screen.getByText("Browse Jobs");
      expect(jobsLink.className).toContain("text-[#8898aa]");
      expect(jobsLink.className).not.toContain("font-semibold");
    });
  });

  describe("loading state", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });
    });

    it("renders Sign in link during loading", () => {
      render(<TopNav />);
      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });

    it("does not render authenticated nav during loading", () => {
      render(<TopNav />);
      expect(screen.queryByText("Dashboard")).toBeNull();
    });
  });
});
