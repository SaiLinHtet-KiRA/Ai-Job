const sizeClasses: Record<string, string> = {
  sm: "h-3 w-3 border-2",
  md: "h-4 w-4 border-2",
  lg: "h-6 w-6 border-[3px]",
};

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
}

export function Spinner({ className = "", size = "md", variant = "default" }: SpinnerProps) {
  const borderColor = variant === "white" ? "border-white/30 border-t-white" : "border-primary border-t-transparent";
  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${borderColor} ${className}`}
    />
  );
}
