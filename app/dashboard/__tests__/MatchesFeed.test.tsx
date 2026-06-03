import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchesFeed from "@/app/dashboard/MatchesFeed";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "test-user", email: "test@test.com" } },
    status: "authenticated",
  }),
}));

describe("MatchesFeed", () => {
  it("renders today's matches heading", () => {
    render(<MatchesFeed />);
    expect(screen.getByText("Today's Matches")).toBeInTheDocument();
  });

  it("shows demo data badge", () => {
    render(<MatchesFeed />);
    expect(screen.getByText("Demo data")).toBeInTheDocument();
  });

  it("renders match cards with job titles", () => {
    render(<MatchesFeed />);
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Full Stack Developer")).toBeInTheDocument();
    expect(
      screen.getByText("Frontend Engineer (Vue.js)"),
    ).toBeInTheDocument();
    expect(screen.getByText("React Native Developer")).toBeInTheDocument();
  });

  it("renders match scores", () => {
    render(<MatchesFeed />);
    expect(screen.getByText("85% match")).toBeInTheDocument();
    expect(screen.getByText("72% match")).toBeInTheDocument();
    expect(screen.getByText("68% match")).toBeInTheDocument();
    expect(screen.getByText("61% match")).toBeInTheDocument();
  });

  it("shows Skip and Preview buttons on each match card", () => {
    render(<MatchesFeed />);
    const skipButtons = screen.getAllByText("Skip");
    const previewButtons = screen.getAllByText("Preview");
    expect(skipButtons.length).toBe(4);
    expect(previewButtons.length).toBe(4);
  });

  it("expands cover letter preview when Preview is clicked", async () => {
    const user = userEvent.setup();
    render(<MatchesFeed />);

    const previewButtons = screen.getAllByText("Preview");
    await user.click(previewButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText("Generated cover letter"),
      ).toBeInTheDocument();
    });
  });

  it("changes Preview to Hide when expanded", async () => {
    const user = userEvent.setup();
    render(<MatchesFeed />);

    const previewButtons = screen.getAllByText("Preview");
    await user.click(previewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Hide")).toBeInTheDocument();
    });
  });

  it("removes match when Skip is clicked", async () => {
    const user = userEvent.setup();
    render(<MatchesFeed />);

    const skipButtons = screen.getAllByText("Skip");
    await user.click(skipButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("CloudBase")).not.toBeInTheDocument();
    });
  });

  it("shows bulk action bar with select all checkbox", () => {
    render(<MatchesFeed />);
    expect(screen.getByText(/0 of 4 selected/)).toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("selects all matches when select all checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<MatchesFeed />);

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText(/4 of 4 selected/)).toBeInTheDocument();
    });
  });

  it("enables Review & Apply button when matches are selected", async () => {
    const user = userEvent.setup();
    render(<MatchesFeed />);

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    await waitFor(() => {
      const reviewBtn = screen.getByText(/Review & Apply/);
      expect(reviewBtn).not.toBeDisabled();
    });
  });

  it("opens Review modal when Review & Apply is clicked", async () => {
    const user = userEvent.setup();
    render(<MatchesFeed />);

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByText(/1 of 4 selected/)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Review & Apply/));

    await waitFor(() => {
      expect(screen.getByText("Review Applications")).toBeInTheDocument();
    });
  });

  it("renders missing skills badges", () => {
    render(<MatchesFeed />);
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("CI/CD")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  it("shows Email apply or Manual apply badges", () => {
    render(<MatchesFeed />);
    const emailApply = screen.getAllByText("Email apply");
    const manualApply = screen.getAllByText("Manual apply");
    expect(emailApply.length).toBeGreaterThan(0);
    expect(manualApply.length).toBeGreaterThan(0);
  });
});
