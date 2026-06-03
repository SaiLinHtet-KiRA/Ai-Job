import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLoginPage from "@/app/admin/(auth)/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("AdminLoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the admin login heading", () => {
    render(<AdminLoginPage />);
    expect(screen.getByText("Admin Login")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(<AdminLoginPage />);
    expect(screen.getByPlaceholderText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renders Sign In button", () => {
    render(<AdminLoginPage />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("shows loading state when submitting", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      () =>
        new Promise(() => {}),
    );

    render(<AdminLoginPage />);

    await user.type(
      screen.getByPlaceholderText("admin@example.com"),
      "admin@test.com",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password");
    await user.click(screen.getByText("Sign In"));

    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText("Signing in...")).toBeInTheDocument();
  });

  it("shows error message on failed login", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid credentials" }),
    } as Response);

    render(<AdminLoginPage />);

    await user.type(
      screen.getByPlaceholderText("admin@example.com"),
      "admin@test.com",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "wrong");
    await user.click(screen.getByText("Sign In"));

    await screen.findByText("Invalid credentials");
  });

  it("shows network error message on fetch failure", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<AdminLoginPage />);

    await user.type(
      screen.getByPlaceholderText("admin@example.com"),
      "admin@test.com",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password");
    await user.click(screen.getByText("Sign In"));

    await screen.findByText("Network error. Please try again.");
  });

  it("renders the subheading text", () => {
    render(<AdminLoginPage />);
    expect(
      screen.getByText("Sign in to manage job postings"),
    ).toBeInTheDocument();
  });

  it("has email input as required", () => {
    render(<AdminLoginPage />);
    const emailInput = screen.getByPlaceholderText(
      "admin@example.com",
    ) as HTMLInputElement;
    expect(emailInput.required).toBe(true);
  });

  it("has password input as required", () => {
    render(<AdminLoginPage />);
    const passwordInput = screen.getByPlaceholderText(
      "••••••••",
    ) as HTMLInputElement;
    expect(passwordInput.required).toBe(true);
  });
});
