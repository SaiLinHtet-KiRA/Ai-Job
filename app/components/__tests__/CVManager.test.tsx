import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CVManager from "@/app/components/CVManager";

describe("CVManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        new Promise(() => {}),
    } as Response);

    render(<CVManager />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders upload prompt when no CV exists", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ cv: null }),
    } as Response);

    render(<CVManager />);

    await waitFor(() => {
      expect(
        screen.getByText("Click to upload your CV"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("PDF only, max 5MB")).toBeInTheDocument();
  });

  it("renders CV info when CV exists", async () => {
    const mockCV = {
      id: 1,
      fileName: "resume.pdf",
      url: "https://example.com/resume.pdf",
      uploadedAt: new Date().toISOString(),
      parsedText: "Experienced software engineer with 5 years...",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ cv: mockCV }),
    } as Response);

    render(<CVManager />);

    await waitFor(() => {
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });

    expect(screen.getByText("Replace CV")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("shows parsed text preview when CV exists", async () => {
    const mockCV = {
      id: 1,
      fileName: "resume.pdf",
      url: "https://example.com/resume.pdf",
      uploadedAt: new Date().toISOString(),
      parsedText: "Experienced software engineer with 5 years...",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ cv: mockCV }),
    } as Response);

    render(<CVManager />);

    await waitFor(() => {
      expect(
        screen.getByText("Experienced software engineer with 5 years..."),
      ).toBeInTheDocument();
    });
  });

  it("shows the 'Your CV' heading", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ cv: null }),
    } as Response);

    render(<CVManager />);

    await waitFor(() => {
      expect(screen.getByText("Your CV")).toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<CVManager />);

    await waitFor(() => {
      expect(
        screen.getByText("Click to upload your CV"),
      ).toBeInTheDocument();
    });
  });

  it("has a View link with correct href when CV exists", async () => {
    const mockCV = {
      id: 1,
      fileName: "resume.pdf",
      url: "https://example.com/resume.pdf",
      uploadedAt: new Date().toISOString(),
      parsedText: "CV text...",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ cv: mockCV }),
    } as Response);

    render(<CVManager />);

    await waitFor(() => {
      const viewLink = screen.getByText("View");
      expect(viewLink.closest("a")).toHaveAttribute(
        "href",
        "https://example.com/resume.pdf",
      );
      expect(viewLink.closest("a")).toHaveAttribute("target", "_blank");
    });
  });
});
