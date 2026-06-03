import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignOutButton from "@/app/components/SignOutButton";

const mockSignOut = vi.fn();
vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
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
      callbackUrl: "/",
      redirect: true,
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
