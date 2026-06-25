import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useGoogleIdentity } from "@/features/auth/hooks/useGoogleIdentity";

interface GoogleReauthButtonProps {
  email: string;
  onUnlock: () => void;
  onLogout: () => void;
}

/**
 * Google re-verify on the lock screen. Reuses the auth feature's GIS hook with
 * an `expectedEmail` guard so unlocking is only possible with the same account.
 * If GIS is unavailable, falls back to a full sign-out + re-login.
 */
export function GoogleReauthButton({
  email,
  onUnlock,
  onLogout,
}: GoogleReauthButtonProps) {
  const { buttonRef, status, isSigningIn } = useGoogleIdentity({
    mode: "signin",
    expectedEmail: email,
    onSuccess: onUnlock,
    onError: (message) => toast.error("Couldn't unlock", { description: message }),
  });

  if (status === "unavailable") {
    return (
      <Button type="button" variant="outline" className="w-full" onClick={onLogout}>
        <GoogleIcon className="mr-2 h-5 w-5" />
        Sign in with Google
      </Button>
    );
  }

  return (
    <div className="relative min-h-11">
      <div
        ref={buttonRef}
        className="flex min-h-11 justify-center"
        aria-busy={isSigningIn}
      />
      {(status === "loading" || isSigningIn) && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full",
            status === "loading" ? "border border-border bg-card" : "bg-card/70",
          )}
        >
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
