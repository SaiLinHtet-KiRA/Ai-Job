"use client";

function generatePageNumbers(current: number, total: number): (number | "..")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "..")[] = [1];
  if (current > 3) pages.push("..");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("..");
  pages.push(total);

  return pages;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: "dark" | "admin";
  showInfo?: boolean;
  disabled?: boolean;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  variant = "admin",
  showInfo = false,
  disabled = false,
}: PaginationProps) {
  if (totalPages < 1) return null;

  const pages = generatePageNumbers(page, totalPages);
  const isDark = variant === "dark";

  const btnBase = isDark
    ? "rounded-lg border border-white/10 px-2 py-2 text-[12px] text-[#8898aa] transition-colors hover:border-white/20 hover:text-white disabled:opacity-30"
    : "rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800";

  const pageBtnBase = "rounded-lg min-w-[32px] px-2.5 py-1.5 text-xs font-medium transition-all";

  const pageBtnActive = isDark
    ? "bg-primary text-white"
    : "bg-primary/10 text-primary dark:bg-primary/20";

  const pageBtnInactive = isDark
    ? "border border-white/10 text-[#8898aa] hover:border-white/20 hover:text-white"
    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800";

  const ellipsisClass = isDark
    ? "px-1 text-[12px] text-[#8898aa]"
    : "px-1 text-xs text-zinc-400 dark:text-zinc-500";

  const nav = (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(1)}
        disabled={page <= 1 || disabled}
        className={btnBase}
        title="First page"
        aria-label="First page"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || disabled}
        className={btnBase}
        aria-label="Previous page"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {pages.map((p, i) =>
        p === ".." ? (
          <span key={`dots-${i}`} className={ellipsisClass}>..</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={disabled}
            className={`${pageBtnBase} ${p === page ? pageBtnActive : pageBtnInactive}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || disabled}
        className={btnBase}
        aria-label="Next page"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page >= totalPages || disabled}
        className={btnBase}
        title="Last page"
        aria-label="Last page"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  if (!showInfo) {
    return nav;
  }

  const infoClass = isDark
    ? "text-[12px] text-[#8898aa]/60"
    : "text-xs text-zinc-400 dark:text-zinc-500";

  return (
    <div className="flex items-center justify-between">
      <span className={infoClass}>
        Page {page} of {totalPages}
      </span>
      {nav}
    </div>
  );
}
