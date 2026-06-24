import { useId } from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Tailwind sizing/colour classes, e.g. "h-8 w-8". */
  className?: string;
  /**
   * `gradient` (default) paints the mark in the brand blue→violet gradient.
   * `current` inherits `currentColor` so it follows e.g. `text-primary`.
   */
  variant?: "gradient" | "current";
  /** Accessible title; omit for purely decorative use (mark is aria-hidden). */
  title?: string;
}

/**
 * Treatcode brand mark — a wrapped gift box drawn as a clean outline.
 * The "treat" (the present) for a voucher/gifting app. Pairs with the wordmark.
 */
export function BrandMark({ className, variant = "gradient", title }: BrandMarkProps) {
  const gradientId = useId();
  const stroke = variant === "gradient" ? `url(#${gradientId})` : "currentColor";

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke={stroke}
      strokeWidth={7.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
    >
      {title ? <title>{title}</title> : null}
      {variant === "gradient" ? (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="oklch(0.38 0.117 255)" />
            <stop offset="100%" stopColor="oklch(0.42 0.19 293)" />
          </linearGradient>
        </defs>
      ) : null}

      {/* Gift box body */}
      <rect x="15" y="38" width="70" height="52" rx="8" />
      {/* Lid */}
      <rect x="10" y="30" width="80" height="12" rx="4" />
      {/* Ribbon down the middle */}
      <line x1="50" y1="30" x2="50" y2="90" />
      {/* Bow */}
      <path d="M50 30 C50 14 28 10 28 24 C28 30 50 30 50 30Z" />
      <path d="M50 30 C50 14 72 10 72 24 C72 30 50 30 50 30Z" />
    </svg>
  );
}
