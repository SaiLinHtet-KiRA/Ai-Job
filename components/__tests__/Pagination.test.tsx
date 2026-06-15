import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "@/components/ui/Pagination";

describe("Pagination", () => {
  it("returns null when totalPages < 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when totalPages is 0", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders single page without prev/next enabled", () => {
    render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);

    const prev = screen.getByLabelText("Previous page");
    const next = screen.getByLabelText("Next page");
    expect(prev).toBeDisabled();
    expect(next).toBeDisabled();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders first, prev, next, last buttons", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText("First page")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    expect(screen.getByLabelText("Last page")).toBeInTheDocument();
  });

  it("disables first and prev on page 1", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText("First page")).toBeDisabled();
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).not.toBeDisabled();
    expect(screen.getByLabelText("Last page")).not.toBeDisabled();
  });

  it("disables next and last on last page", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText("First page")).not.toBeDisabled();
    expect(screen.getByLabelText("Previous page")).not.toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
    expect(screen.getByLabelText("Last page")).toBeDisabled();
  });

  it("calls onPageChange with new page when clicking a page number", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByText("4"));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("calls onPageChange when clicking next", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByLabelText("Next page"));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange when clicking prev", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByLabelText("Previous page"));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange(1) when clicking first", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination page={4} totalPages={10} onPageChange={onPageChange} />);
    await user.click(screen.getByLabelText("First page"));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange(totalPages) when clicking last", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination page={4} totalPages={10} onPageChange={onPageChange} />);
    await user.click(screen.getByLabelText("Last page"));

    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it("highlights current page", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);

    const page3 = screen.getByText("3");
    expect(page3.className).toContain("bg-primary");
  });

  it("does not highlight non-current pages", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);

    const page1 = screen.getByText("1");
    expect(page1.className).not.toContain("bg-primary");
  });

  it("renders ellipsis for large page counts", () => {
    render(<Pagination page={5} totalPages={20} onPageChange={vi.fn()} />);

    const dots = screen.getAllByText("..");
    expect(dots.length).toBe(2);
  });

  it("renders all pages when totalPages <= 7", () => {
    render(<Pagination page={3} totalPages={7} onPageChange={vi.fn()} />);

    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
    expect(screen.queryByText("..")).toBeNull();
  });

  it("shows page info when showInfo is true", () => {
    render(
      <Pagination page={3} totalPages={12} onPageChange={vi.fn()} showInfo />,
    );

    expect(screen.getByText("Page 3 of 12")).toBeInTheDocument();
  });

  it("does not show page info by default", () => {
    render(<Pagination page={3} totalPages={12} onPageChange={vi.fn()} />);

    expect(screen.queryByText("Page 3 of 12")).not.toBeInTheDocument();
  });

  it("disables all buttons when disabled prop is true", () => {
    render(
      <Pagination page={3} totalPages={5} onPageChange={vi.fn()} disabled />,
    );

    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });

  it("does not call onPageChange when disabled", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination page={3} totalPages={5} onPageChange={onPageChange} disabled />,
    );

    await user.click(screen.getByText("4"));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("applies dark variant classes", () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        onPageChange={vi.fn()}
        variant="dark"
      />,
    );

    const prev = screen.getByLabelText("Previous page");
    expect(prev.className).toContain("white/10");
  });
});
