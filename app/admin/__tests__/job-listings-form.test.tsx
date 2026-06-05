import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobListingFormModal from "@/app/admin/(dashboard)/job-listings/JobListingFormModal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockTitles = [
  { id: 1, name: "Frontend Developer", jobs_size: 3 },
  { id: 2, name: "Backend Engineer", jobs_size: 2 },
];

const mockLocations = [
  { id: 1, name: "Remote", jobs_size: 5 },
];

function setupFetchMocks() {
  const fetch = vi.spyOn(globalThis, "fetch");
  fetch.mockImplementation(async (input) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/api/admin/titles")) {
      return { json: () => Promise.resolve(mockTitles) } as Response;
    }
    if (url.includes("/api/admin/locations")) {
      return { json: () => Promise.resolve(mockLocations) } as Response;
    }
    return { ok: true, json: () => Promise.resolve({ id: 1 }) } as Response;
  });
  return fetch;
}

describe("JobListingFormModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when open is false", () => {
    setupFetchMocks();
    render(<JobListingFormModal open={false} onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.queryByText("Insert Job Listing")).toBeNull();
  });

  it("renders the modal when open is true", () => {
    setupFetchMocks();
    render(<JobListingFormModal open onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.getByText("Insert Job Listing")).toBeInTheDocument();
  });

  it("shows title and company fields", () => {
    setupFetchMocks();
    render(<JobListingFormModal open onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search job title...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Acme Inc.")).toBeInTheDocument();
  });

  it("closes on cancel button click", async () => {
    setupFetchMocks();
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<JobListingFormModal open onClose={onClose} onCreated={vi.fn()} />);
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows validation error when title is empty on submit", () => {
    setupFetchMocks();
    render(<JobListingFormModal open onClose={vi.fn()} onCreated={vi.fn()} />);

    const form = document.getElementById("job-listing-form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(screen.getByText("Title is required.")).toBeInTheDocument();
  });

  it("shows validation error when company is empty on submit", async () => {
    setupFetchMocks();
    const user = userEvent.setup();
    render(<JobListingFormModal open onClose={vi.fn()} onCreated={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText("Search job title...");
    await user.type(titleInput, "Frontend Developer");

    const form = document.getElementById("job-listing-form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(screen.getByText("Company is required.")).toBeInTheDocument();
  });

  it("shows default expires in days value", () => {
    setupFetchMocks();
    render(<JobListingFormModal open onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
  });

  it("shows expires date info", () => {
    setupFetchMocks();
    render(<JobListingFormModal open onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.getByText(/Posted today/)).toBeInTheDocument();
  });
});
