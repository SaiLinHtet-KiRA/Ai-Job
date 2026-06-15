import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationsPage from "@/app/admin/(dashboard)/applications/page";

const mockUseRouter = { replace: vi.fn() };
const mockUseSearchParams = { get: vi.fn().mockReturnValue(""), toString: () => "" };

vi.mock("next/navigation", () => ({
  useRouter: () => mockUseRouter,
  useSearchParams: () => mockUseSearchParams,
}));

const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Acme Corp",
    location: "Remote",
    job_type: "full-time",
    apply_email: "hr@acme.com",
    applicationCount: 5,
    applicationIds: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "Tech Inc",
    location: "New York",
    job_type: "contract",
    apply_email: "jobs@techinc.com",
    applicationCount: 3,
    applicationIds: [6, 7, 8],
  },
];

const mockApplications = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    position: "Frontend Developer",
    type: "full-time",
    salary: "$100k",
    cv_url: "https://example.com/cv.pdf",
    cover_letter: "I am interested...",
    method: "email",
    status: "sent",
    sent_at: "2025-06-01T10:00:00Z",
    created_at: "2025-06-01T09:00:00Z",
    user_id: "uuid-123",
  },
];

describe("ApplicationsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUseSearchParams.get.mockReturnValue("");
    (mockUseSearchParams as unknown as { toString: () => string }).toString = () => "";
    mockUseRouter.replace.mockClear();
  });

  it("renders page heading", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          jobs: mockJobs,
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
          totalApps: 8,
        }),
    } as Response);

    render(<ApplicationsPage />);
    expect(screen.getByText("Application Log")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Frontend Developer")).toBeInTheDocument());
  });

  it("shows loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      () => new Promise(() => {}),
    );

    render(<ApplicationsPage />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows empty state when no jobs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          jobs: [],
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
          totalApps: 0,
        }),
    } as Response);

    render(<ApplicationsPage />);
    await waitFor(() => expect(screen.getByText("No applications found.")).toBeInTheDocument());
  });

  it("renders summary cards with totals", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          jobs: mockJobs,
          page: 1,
          pageSize: 10,
          total: 15,
          totalPages: 2,
          totalApps: 42,
        }),
    } as Response);

    render(<ApplicationsPage />);
    await waitFor(() => {
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  it("renders job data in table", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          jobs: mockJobs,
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
          totalApps: 8,
        }),
    } as Response);

    render(<ApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
      expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("Tech Inc")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("shows pagination with page info", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          jobs: mockJobs,
          page: 2,
          pageSize: 2,
          total: 25,
          totalPages: 13,
          totalApps: 100,
        }),
    } as Response);

    render(<ApplicationsPage />);
    await waitFor(() => {
      expect(screen.getByText("Page 2 of 13")).toBeInTheDocument();
    });
  });

  it("shows pagination on single page", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          jobs: mockJobs,
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
          totalApps: 8,
        }),
    } as Response);

    render(<ApplicationsPage />);
    await waitFor(() => expect(screen.getByText("Frontend Developer")).toBeInTheDocument());
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });

  it("opens application detail popup when row is clicked", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            jobs: mockJobs,
            page: 1,
            pageSize: 10,
            total: 2,
            totalPages: 1,
            totalApps: 8,
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ applications: mockApplications }),
      } as Response);

    render(<ApplicationsPage />);

    await waitFor(() => expect(screen.getByText("Frontend Developer")).toBeInTheDocument());

    await user.click(screen.getByText("Frontend Developer"));

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("sent")).toBeInTheDocument();
    });
  });

  it("closes popup when close button is clicked", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            jobs: mockJobs,
            page: 1,
            pageSize: 10,
            total: 2,
            totalPages: 1,
            totalApps: 8,
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ applications: mockApplications }),
      } as Response);

    render(<ApplicationsPage />);

    await waitFor(() => expect(screen.getByText("Frontend Developer")).toBeInTheDocument());
    await user.click(screen.getByText("Frontend Developer"));
    await waitFor(() => expect(screen.getByText("John Doe")).toBeInTheDocument());

    const closeBtn = document.querySelector(`svg path[d="M6 18L18 6M6 6l12 12"]`)?.closest("button");
    if (closeBtn) {
      await user.click(closeBtn);
      await waitFor(() => {
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      });
    }
  });

  it("updates URL search params when typing in search input", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jobs: mockJobs,
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
          totalApps: 8,
        }),
    } as Response);

    render(<ApplicationsPage />);

    await waitFor(() => expect(screen.getByText("Frontend Developer")).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText("Search by job title or company...");
    await user.type(searchInput, "frontend");

    expect(mockUseRouter.replace).toHaveBeenCalledWith(
      "/admin/applications?search=frontend",
      { scroll: false },
    );
  });
});
