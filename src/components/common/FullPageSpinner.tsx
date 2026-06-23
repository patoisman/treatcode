import { Loader2 } from "lucide-react";

interface FullPageSpinnerProps {
  label?: string;
}

/**
 * Centered, full-viewport loading indicator. Used as the lazy-route Suspense
 * fallback and while auth/session checks resolve in route guards.
 */
export function FullPageSpinner({ label }: FullPageSpinnerProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
