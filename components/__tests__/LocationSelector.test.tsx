import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocationSelector from "@/components/LocationSelector";

const mockLocations = [
  { id: 1, name: "Remote", jobs_size: 5 },
  { id: 2, name: "New York", jobs_size: 3 },
  { id: 3, name: "San Francisco", jobs_size: 2 },
  { id: 4, name: "Singapore", jobs_size: 1 },
];

describe("LocationSelector", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the input with placeholder", () => {
    render(<LocationSelector value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search location...")).toBeInTheDocument();
  });

  it("displays the provided value", () => {
    render(<LocationSelector value="Remote" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search location...") as HTMLInputElement;
    expect(input.value).toBe("Remote");
  });

  it("shows a clear button when value is present", () => {
    render(<LocationSelector value="Remote" onChange={vi.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not show clear button when value is empty", () => {
    render(<LocationSelector value="" onChange={vi.fn()} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LocationSelector value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search location...");
    await user.type(input, "S");
    expect(onChange).toHaveBeenCalled();
  });

  it("opens dropdown and shows locations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockLocations),
    } as Response);

    render(<LocationSelector value="" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search location...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("Remote")).toBeInTheDocument();
      expect(screen.getByText("New York")).toBeInTheDocument();
    });
  });

  it("shows jobs_size count in each option", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockLocations),
    } as Response);

    render(<LocationSelector value="" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search location...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("5 jobs")).toBeInTheDocument();
      expect(screen.getByText("3 jobs")).toBeInTheDocument();
      expect(screen.getByText("1 job")).toBeInTheDocument();
    });
  });

  it("calls onChange when selecting a location", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockLocations),
    } as Response);

    render(<LocationSelector value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search location...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("Remote")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Remote"));
    expect(onChange).toHaveBeenCalledWith("Remote");
  });

  it("filters locations based on input", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockLocations),
    } as Response);

    render(<LocationSelector value="New" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search location...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("New York")).toBeInTheDocument();
      expect(screen.queryByText("Remote")).not.toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));

    render(<LocationSelector value="" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search location...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("No locations found.")).toBeInTheDocument();
    });
  });

  it("renders required attribute when required", () => {
    render(<LocationSelector value="" onChange={vi.fn()} required />);
    const input = screen.getByPlaceholderText("Search location...") as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  it("does not show create button when allowCreate is false", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockLocations),
    } as Response);

    render(<LocationSelector value="Unknown" onChange={vi.fn()} allowCreate={false} />);
    const input = screen.getByPlaceholderText("Search location...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("No locations found.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Create/)).toBeNull();
  });

  it("shows create button when allowCreate is true (default)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockLocations),
    } as Response);

    render(<LocationSelector value="Unknown" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search location...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText('Create "Unknown"')).toBeInTheDocument();
    });
  });

  it("closes dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockLocations),
    } as Response);

    render(
      <div>
        <LocationSelector value="" onChange={vi.fn()} />
        <button data-testid="outside">Outside</button>
      </div>,
    );

    const input = screen.getByPlaceholderText("Search location...");
    (input as HTMLInputElement).focus();

    await waitFor(() => {
      expect(screen.getByText("Remote")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("outside"));
    await waitFor(() => {
      expect(screen.queryByText("Remote")).not.toBeInTheDocument();
    });
  });
});
