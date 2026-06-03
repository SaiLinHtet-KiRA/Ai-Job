interface SuccessAlertProps {
  message: string;
  className?: string;
}

export function SuccessAlert({ message, className = "" }: SuccessAlertProps) {
  return (
    <div
      className={`rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400 ${className}`}
    >
      {message}
    </div>
  );
}
