import { useState } from "react";
import { cn } from "@/lib/utils";
import { brandInitials } from "../utils";

interface BrandLogoProps {
  name: string;
  logoUrl: string | null;
  className?: string;
}

// Renders the brand logo when a URL exists, falling back to the brand's initials.
// All seeded brands currently have logo_url = null, so the fallback is the norm;
// the <img> path (with onError fallback) is ready for when logos are added.
export function BrandLogo({ name, logoUrl, className }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!logoUrl && !failed;

  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary",
        className,
      )}
    >
      {showImage ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-sm font-bold text-secondary-foreground" aria-hidden="true">
          {brandInitials(name)}
        </span>
      )}
    </div>
  );
}
