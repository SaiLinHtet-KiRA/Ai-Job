export const inputBaseClasses =
  "w-full rounded-xl border bg-zinc-50 px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500";

export const inputLightClasses =
  "border-zinc-200 focus:border-primary focus:ring-primary/20 dark:border-zinc-700 dark:focus:border-primary dark:focus:ring-primary/20";

export const inputErrorClasses =
  "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800 dark:focus:border-red-500";

export function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

export function scoreBg(score: number): string {
  if (score >= 70) return "from-emerald-500/20 to-emerald-500/5";
  if (score >= 50) return "from-amber-500/20 to-amber-500/5";
  return "from-rose-500/20 to-rose-500/5";
}

export function scoreMessage(score: number): string {
  if (score >= 70) return "Your CV is above the threshold most ATS systems use.";
  if (score >= 50) return "Your CV is just below the threshold. A few fixes could make a big difference.";
  return "Most ATS systems would auto-reject this CV. See the fixes below.";
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
