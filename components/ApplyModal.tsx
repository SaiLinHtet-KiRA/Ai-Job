"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
}

const inputBase =
  "w-full rounded-xl border bg-zinc-50 px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500";

const inputLight =
  "border-zinc-200 focus:border-primary focus:ring-primary/20 dark:border-zinc-700 dark:focus:border-primary dark:focus:ring-primary/20";

const inputError =
  "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800 dark:focus:border-red-500";

export default function ApplyModal({ open, onClose }: ApplyModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [positionSearch, setPositionSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allTitles, setAllTitles] = useState<string[]>([]);
  const [type, setType] = useState("on-site");
  const [salary, setSalary] = useState<number | "">("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const positionAnchorRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredTitles = allTitles
    .filter((t) => t.toLowerCase().includes(positionSearch.toLowerCase()))
    .slice(0, 50);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) {
      fetch("/api/titles")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllTitles(data.map((t: { id: number; name: string }) => t.name));
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setDropdownOpen(false);
    setStep(0);
    setErrors({});
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, handleClose]);

  if (!open) return null;

  function selectPosition(title: string) {
    setPosition(title);
    setPositionSearch(title);
    setDropdownOpen(false);
    setErrors((prev) => ({ ...prev, position: "" }));
  }

  function validateStep0() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!position) errs.position = "Please select a position";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep1() {
    const errs: Record<string, string> = {};
    if (salary === "") errs.salary = "Salary is required";
    if (!resume) errs.resume = "Please upload your resume";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (step === 0 && validateStep0()) setStep(1);
  }

  function prevStep() {
    setStep(0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("position", position);
    formData.append("type", type);
    formData.append("salary", salary);
    formData.append("resume", resume!);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("success");
        setName("");
        setEmail("");
        setPosition("");
        setPositionSearch("");
        setType("on-site");
        setSalary("");
        setResume(null);
        if (fileRef.current) fileRef.current.value = "";
        setTimeout(() => {
          onClose();
          setMessage("");
          setStep(0);
          router.push(
            `/results?position=${encodeURIComponent(position)}&name=${encodeURIComponent(name)}`,
          );
        }, 1000);
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    }
    setLoading(false);
  }

  const totalSteps = 2;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={modalRef}
        className="flex max-h-[92vh] w-full animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:max-w-lg sm:rounded-3xl"
      >
        {/* ── Header ── */}
        <div className="relative shrink-0 bg-gradient-to-r from-primary via-primary-dark to-[#004DD4] px-6 pb-6 pt-6 sm:px-8 sm:pt-7">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:right-6 sm:top-5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-white sm:text-2xl">Apply for a Job</h2>
          <p className="mt-1 text-sm text-white/70">
            Step {step + 1} of {totalSteps} &mdash;{" "}
            {step === 0 ? "Your details" : "Preferences & resume"}
          </p>

          {/* progress bar */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Body ── */}
        <form
          id="apply-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pb-6 pt-6 sm:px-8 sm:pb-8"
        >
          {message === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 dark:bg-accent/15">
                <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
                Application Submitted!
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Redirecting to your results...
              </p>
            </div>
          ) : (
            <>
              {step === 0 && (
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
                        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
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
                        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
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
                        onChange={(e) => {
                          setPositionSearch(e.target.value);
                          setPosition("");
                          setDropdownOpen(true);
                          setErrors((p) => ({ ...p, position: "" }));
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        placeholder="Search job title..."
                      />
                        {positionSearch && (
                          <button
                            type="button"
                            onClick={() => { setPositionSearch(""); setPosition(""); }}
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
              )}

              {step === 1 && (
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
                            onClick={() => setType(t)}
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
                          type="number"
                          className={`${inputBase} pl-10 ${errors.salary ? inputError : inputLight}`}
                          value={salary}
                          onChange={(e) => { const v = e.target.value; setSalary(v === "" ? "" : Number(v)); setErrors((p) => ({ ...p, salary: "" })); }}
                          placeholder="800000"
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
                          setResume(file);
                          setErrors((p) => ({ ...p, resume: "" }));
                        }}
                      />
                    </div>
                    {errors.resume && <p className="mt-1 text-xs text-red-500">{errors.resume}</p>}
                  </label>
                </div>
              )}

              {/* message */}
              {message && message !== "success" && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                  {message}
                </div>
              )}
            </>
          )}
        </form>

        {/* ── Footer ── */}
        {message !== "success" && (
          <div className="shrink-0 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800 sm:px-8">
            <div className="flex gap-3">
              {step === 0 ? (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary-dark hover:to-primary-dark hover:shadow-primary/25 active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    form="apply-form"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary-dark hover:to-primary-dark hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Position dropdown — anchored to input, auto-flips to stay in viewport */}
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
              onClick={() => selectPosition(t)}
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
    </div>
  );
}
