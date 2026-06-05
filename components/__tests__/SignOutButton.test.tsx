import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignOutButton from "@/app/components/SignOutButton";

const mockSignOut = vi.fn();
const mockSupabaseSignOut = vi.fn().mockResolvedValue(undefined);
const mockRouterPush = vi.fn();

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("@/lib/supabase-browser", () => ({
  getSupabaseBrowser: () => ({ auth: { signOut: mockSupabaseSignOut } }),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    mockSignOut.mockClear();
  });

  it("renders the sign out button", () => {
    render(<SignOutButton />);
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("calls signOut with correct options on click", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByText("Sign out"));

    expect(mockSignOut).toHaveBeenCalledWith({
      redirect: false,
    });
  });

  it("calls signOut exactly once per click", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByText("Sign out"));
    await user.click(screen.getByText("Sign out"));

    expect(mockSignOut).toHaveBeenCalledTimes(2);
  });

  it("renders as a button element", () => {
    render(<SignOutButton />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });
});
