"use client";

const inputBase =
  "w-full rounded-xl border bg-zinc-50 px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500";

const inputLight =
  "border-zinc-200 focus:border-primary focus:ring-primary/20 dark:border-zinc-700 dark:focus:border-primary dark:focus:ring-primary/20";

const inputError =
  "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800 dark:focus:border-red-500";

interface Step1FormProps {
  type: string;
  salary: string;
  resume: File | null;
  errors: Record<string, string>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onTypeChange: (value: string) => void;
  onSalaryChange: (value: string) => void;
  onResumeChange: (file: File | null) => void;
}

export default function Step1Form({
  type,
  salary,
  resume,
  errors,
  fileRef,
  onTypeChange,
  onSalaryChange,
  onResumeChange,
}: Step1FormProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Work Type
          </span>
          <div className="grid grid-cols-3 gap-2">
            {["on-site", "remote", "hybrid"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTypeChange(t)}
                className={`rounded-xl border px-3 py-3 text-xs font-semibold capitalize transition-all ${
                  type === t
                    ? "border-primary bg-primary/10 text-primary-dark dark:border-primary dark:bg-primary/20 dark:text-primary/70"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Expected Salary
          </span>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input
              className={`${inputBase} pl-10 ${errors.salary ? inputError : inputLight}`}
              value={salary}
              onChange={(e) => onSalaryChange(e.target.value)}
              placeholder="MMK 800,000 - 1,200,000"
            />
          </div>
          {errors.salary && <p className="mt-1 text-xs text-red-500">{errors.salary}</p>}
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Resume
        </span>

        <div
          onClick={() => fileRef.current?.click()}
          className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            resume
              ? "border-primary/30 bg-primary/10 dark:border-primary/40 dark:bg-primary/15"
              : errors.resume
                ? "border-red-300 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20"
                : "border-zinc-200 bg-zinc-50/50 hover:border-primary/30 hover:bg-primary/10 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-primary/40 dark:hover:bg-primary/15"
          }`}
        >
          {resume ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 dark:bg-primary/20">
                <svg className="h-6 w-6 text-primary dark:text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{resume.name}</p>
              <p className="text-xs text-zinc-400">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
              <span className="text-xs font-medium text-primary dark:text-primary/80">Click to change</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Drop your resume here or <span className="text-primary dark:text-primary/80">browse</span>
              </p>
              <p className="text-xs text-zinc-400">PDF or DOCX up to 10MB</p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onResumeChange(file);
            }}
          />
        </div>
        {errors.resume && <p className="mt-1 text-xs text-red-500">{errors.resume}</p>}
      </label>
    </div>
  );
}
