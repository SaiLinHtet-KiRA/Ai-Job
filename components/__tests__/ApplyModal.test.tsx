import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplyModal from "@/components/ApplyModal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("ApplyModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ApplyModal open={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders step 0 form when open", () => {
    render(<ApplyModal open={true} onClose={vi.fn()} />);

    expect(screen.getByText("Apply for a Job")).toBeInTheDocument();
    expect(screen.getByText(/Step\s+1\s+of\s+2/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search job title...")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("shows validation errors when continuing with empty fields", async () => {
    const user = userEvent.setup();
    render(<ApplyModal open={true} onClose={vi.fn()} />);

    await user.click(screen.getByText("Continue"));

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Please select a position")).toBeInTheDocument();
  });

  it("shows invalid email error", async () => {
    const user = userEvent.setup();
    render(<ApplyModal open={true} onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("John Doe"), "Test User");
    await user.type(screen.getByPlaceholderText("you@example.com"), "not-an-email");
    await user.click(screen.getByText("Continue"));

    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });
});
