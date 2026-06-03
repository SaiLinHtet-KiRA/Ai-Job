export default function SuccessView() {
  return (
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
  );
}
