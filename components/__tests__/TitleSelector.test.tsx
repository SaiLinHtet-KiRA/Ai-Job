import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TitleSelector from "@/components/TitleSelector";

const mockTitles = [
  { id: 1, name: "Software Engineer" },
  { id: 2, name: "Frontend Developer" },
  { id: 3, name: "Backend Engineer" },
  { id: 4, name: "Full Stack Developer" },
];

describe("TitleSelector", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the input with placeholder", () => {
    render(<TitleSelector value="" onChange={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("Search job title..."),
    ).toBeInTheDocument();
  });

  it("displays the provided value in the input", () => {
    render(
      <TitleSelector value="Frontend Developer" onChange={vi.fn()} />,
    );
    const input = screen.getByPlaceholderText(
      "Search job title...",
    ) as HTMLInputElement;
    expect(input.value).toBe("Frontend Developer");
  });

  it("shows a clear button when value is present", () => {
    render(
      <TitleSelector value="Frontend Developer" onChange={vi.fn()} />,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not show a clear button when value is empty", () => {
    render(<TitleSelector value="" onChange={vi.fn()} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("calls onChange when typing in the input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TitleSelector value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search job title...");
    await user.type(input, "S");

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("opens dropdown on input focus", async () => {
    const user = userEvent.setup();
    render(<TitleSelector value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search job title...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("No titles found.")).toBeInTheDocument();
    });
  });

  it("filters titles based on input value", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockTitles),
    } as Response);

    render(<TitleSelector value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search job title...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
      expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
      expect(screen.getByText("Full Stack Developer")).toBeInTheDocument();
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    });
  });

  it("calls onChange when a title is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockTitles),
    } as Response);

    render(<TitleSelector value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search job title...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Frontend Developer"));
    expect(onChange).toHaveBeenCalledWith("Frontend Developer");
  });

  it("shows loading state initially", () => {
    render(<TitleSelector value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search job title...");
    (input as HTMLInputElement).focus();
  });

  it("handles fetch error gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<TitleSelector value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search job title...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("No titles found.")).toBeInTheDocument();
    });
  });

  it("renders required attribute when required prop is true", () => {
    render(<TitleSelector value="" onChange={vi.fn()} required />);

    const input = screen.getByPlaceholderText(
      "Search job title...",
    ) as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  it("renders without required attribute by default", () => {
    render(<TitleSelector value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText(
      "Search job title...",
    ) as HTMLInputElement;
    expect(input.required).toBe(false);
  });

  it("closes dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockTitles),
    } as Response);

    render(
      <div>
        <TitleSelector value="" onChange={vi.fn()} />
        <button data-testid="outside">Outside</button>
      </div>,
    );

    const input = screen.getByPlaceholderText("Search job title...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("outside"));
    await waitFor(() => {
      expect(
        screen.queryByText("Frontend Developer"),
      ).not.toBeInTheDocument();
    });
  });
});
