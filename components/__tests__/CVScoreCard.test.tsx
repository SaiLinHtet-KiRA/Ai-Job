import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CVScoreCard from "@/app/components/CVScoreCard";
import type { CVScore } from "@/app/components/types-cv";

describe("CVScoreCard", () => {
  it("renders the score number", () => {
    const score: CVScore = { score: 85 };
    render(<CVScoreCard score={score} />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("shows CV Score heading", () => {
    render(<CVScoreCard score={{ score: 72 }} />);
    expect(screen.getByText("CV Score")).toBeInTheDocument();
  });

  it("shows summary when provided", () => {
    const score: CVScore = { score: 78, summary: "Good CV" };
    render(<CVScoreCard score={score} />);
    expect(screen.getByText("Good CV")).toBeInTheDocument();
  });

  it("shows strengths when provided", () => {
    const score: CVScore = {
      score: 85,
      strengths: ["Great keywords", "Good formatting"],
    };
    render(<CVScoreCard score={score} />);
    expect(screen.getByText("Strengths")).toBeInTheDocument();
    expect(screen.getByText("Great keywords")).toBeInTheDocument();
    expect(screen.getByText("Good formatting")).toBeInTheDocument();
  });

  it("shows weaknesses when provided", () => {
    const score: CVScore = {
      score: 60,
      weaknesses: ["No education section"],
    };
    render(<CVScoreCard score={score} />);
    expect(screen.getByText("Areas to Improve")).toBeInTheDocument();
    expect(screen.getByText("No education section")).toBeInTheDocument();
  });

  it("shows missing keywords when provided", () => {
    const score: CVScore = {
      score: 55,
      keywords_missing: ["Docker", "AWS"],
    };
    render(<CVScoreCard score={score} />);
    expect(screen.getByText("Missing Keywords")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  it("renders high score with emerald color classes", () => {
    render(<CVScoreCard score={{ score: 90 }} />);
    const scoreEl = screen.getByText("90");
    expect(scoreEl.className).toContain("emerald");
  });

  it("renders medium score with amber color classes", () => {
    render(<CVScoreCard score={{ score: 70 }} />);
    const scoreEl = screen.getByText("70");
    expect(scoreEl.className).toContain("amber");
  });

  it("renders low score with rose color classes", () => {
    render(<CVScoreCard score={{ score: 40 }} />);
    const scoreEl = screen.getByText("40");
    expect(scoreEl.className).toContain("rose");
  });

  it("does not show strengths section when empty", () => {
    render(<CVScoreCard score={{ score: 80 }} />);
    expect(screen.queryByText("Strengths")).toBeNull();
  });

  it("does not show weaknesses section when empty", () => {
    render(<CVScoreCard score={{ score: 80 }} />);
    expect(screen.queryByText("Areas to Improve")).toBeNull();
  });

  it("does not show missing keywords section when empty", () => {
    render(<CVScoreCard score={{ score: 80 }} />);
    expect(screen.queryByText("Missing Keywords")).toBeNull();
  });
});
