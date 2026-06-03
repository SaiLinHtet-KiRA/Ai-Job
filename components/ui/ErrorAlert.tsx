interface ErrorAlertProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ message, className = "", onDismiss }: ErrorAlertProps) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 ${className}`}
    >
      <div className="flex items-center justify-center gap-2">
        <span>{message}</span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-1 rounded-full p-0.5 text-red-400 hover:text-red-600 dark:hover:text-red-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
