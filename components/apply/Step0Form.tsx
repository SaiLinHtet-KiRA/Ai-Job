"use client";

const inputBase =
  "w-full rounded-xl border bg-zinc-50 px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500";

const inputLight =
  "border-zinc-200 focus:border-primary focus:ring-primary/20 dark:border-zinc-700 dark:focus:border-primary dark:focus:ring-primary/20";

const inputError =
  "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800 dark:focus:border-red-500";

interface Step0FormProps {
  name: string;
  email: string;
  position: string;
  positionSearch: string;
  errors: Record<string, string>;
  dropdownOpen: boolean;
  filteredTitles: string[];
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPositionSearchChange: (value: string) => void;
  onPositionSelect: (title: string) => void;
  onDropdownOpen: (open: boolean) => void;
  onClearSearch: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  positionAnchorRef: React.RefObject<HTMLDivElement | null>;
}

export default function Step0Form({
  name,
  email,
  position,
  positionSearch,
  errors,
  dropdownOpen,
  filteredTitles,
  onNameChange,
  onEmailChange,
  onPositionSearchChange,
  onPositionSelect,
  onDropdownOpen,
  onClearSearch,
  dropdownRef,
  positionAnchorRef,
}: Step0FormProps) {
  return (
    <>
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Full Name
          </span>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <input
              className={`${inputBase} pl-10 ${errors.name ? inputError : inputLight}`}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Email
          </span>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <input
              type="email"
              className={`${inputBase} pl-10 ${errors.email ? inputError : inputLight}`}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Target Position
          </span>
          <div ref={positionAnchorRef} className="relative [anchor-name:--pos-anchor]">
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className={`${inputBase} pl-10 pr-10 ${errors.position ? inputError : inputLight}`}
                value={positionSearch}
                onChange={(e) => onPositionSearchChange(e.target.value)}
                onFocus={() => onDropdownOpen(true)}
                placeholder="Search job title..."
              />
              {positionSearch && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {errors.position && <p className="mt-1 text-xs text-red-500">{errors.position}</p>}
          {position && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark dark:bg-primary/20 dark:text-primary/70">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {position}
            </p>
          )}
        </label>
      </div>

      {dropdownOpen && filteredTitles.length > 0 && (
        <div
          ref={dropdownRef}
          className="fixed z-[60] max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
          style={{
            positionAnchor: "--pos-anchor",
            top: "anchor(bottom 4px)",
            left: "anchor(left)",
            right: "anchor(right)",
            width: "anchor-size(width)",
            positionTryOptions: "flip-block",
          } as React.CSSProperties}
        >
          {filteredTitles.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPositionSelect(t)}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                position === t
                  ? "bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary/70"
                  : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
