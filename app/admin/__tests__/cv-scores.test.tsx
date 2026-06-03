import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CVScoresPage from "@/app/admin/(dashboard)/cv-scores/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockScores = [
  {
    id: 1,
    ip_address: "192.168.1.1",
    email: "test@example.com",
    file_name: "resume.pdf",
    file_size_kb: 245,
    score: 78,
    strengths: ["Good keyword coverage", "Contact info included"],
    weaknesses: ["No LinkedIn profile"],
    keywords_missing: ["Docker", "AWS"],
    summary: "Solid CV with good coverage.",
    created_at: "2025-06-01T10:00:00Z",
  },
  {
    id: 2,
    ip_address: "10.0.0.1",
    email: null,
    file_name: "cv.docx",
    file_size_kb: 128,
    score: 52,
    strengths: [],
    weaknesses: ["CV is too short", "No education section"],
    keywords_missing: ["React", "TypeScript", "Node.js"],
    summary: "Needs improvement.",
    created_at: "2025-06-02T08:30:00Z",
  },
];

describe("CVScoresPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page heading", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          scores: mockScores,
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        }),
    } as Response);

    render(<CVScoresPage />);
    expect(screen.getByText("CV Scores")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("resume.pdf")).toBeInTheDocument());
  });

  it("shows loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      () => new Promise(() => {}),
    );

    render(<CVScoresPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows empty state when no scores", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          scores: [],
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        }),
    } as Response);

    render(<CVScoresPage />);
    await waitFor(() => expect(screen.getByText("No CV scores yet.")).toBeInTheDocument());
  });

  it("renders score data in table", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          scores: mockScores,
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        }),
    } as Response);

    render(<CVScoresPage />);

    await waitFor(() => {
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
      expect(screen.getByText("cv.docx")).toBeInTheDocument();
      expect(screen.getByText("78/100")).toBeInTheDocument();
      expect(screen.getByText("52/100")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("shows '—' for null email", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          scores: [mockScores[1]],
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        }),
    } as Response);

    render(<CVScoresPage />);

    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  it("shows pagination when multiple pages", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          scores: mockScores,
          page: 1,
          pageSize: 2,
          total: 25,
          totalPages: 13,
        }),
    } as Response);

    render(<CVScoresPage />);

    await waitFor(() => {
      expect(screen.getByText("Prev")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("does not show pagination for single page", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          scores: mockScores,
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        }),
    } as Response);

    render(<CVScoresPage />);

    await waitFor(() => expect(screen.getByText("resume.pdf")).toBeInTheDocument());
    expect(screen.queryByText("Prev")).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("opens detail modal when row is clicked", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            scores: mockScores,
            page: 1,
            pageSize: 10,
            total: 2,
            totalPages: 1,
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockScores[0]),
      } as Response);

    render(<CVScoresPage />);

    await waitFor(() => expect(screen.getByText("78/100")).toBeInTheDocument());

    await user.click(screen.getByText("78/100"));

    await waitFor(() => {
      expect(screen.getByText("Strengths")).toBeInTheDocument();
      expect(screen.getByText("Good keyword coverage")).toBeInTheDocument();
      expect(screen.getByText("Areas to Improve")).toBeInTheDocument();
      expect(screen.getByText("Missing Keywords")).toBeInTheDocument();
    });
  });

  it("closes modal when backdrop is clicked", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            scores: mockScores,
            page: 1,
            pageSize: 10,
            total: 2,
            totalPages: 1,
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockScores[0]),
      } as Response);

    render(<CVScoresPage />);

    await waitFor(() => expect(screen.getByText("78/100")).toBeInTheDocument());
    await user.click(screen.getByText("78/100"));
    await waitFor(() => expect(screen.getByText("Strengths")).toBeInTheDocument());

    await user.click(screen.getByTestId("modal-backdrop"));

    await waitFor(() => {
      expect(screen.queryByText("Strengths")).not.toBeInTheDocument();
    });
  });
});
