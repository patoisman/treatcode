import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useGoogleIdentity } from "../hooks/useGoogleIdentity";
import { useSignInWithGoogle } from "../hooks/useSignInWithGoogle";

interface GoogleSignInButtonProps {
  mode: "signin" | "signup";
}

/**
 * Google sign-in via the ID-token (popup) flow using the official GIS button.
 * If GIS can't load (blocked script, no client ID), it degrades to the
 * signInWithOAuth redirect flow so Google sign-in never fully breaks.
 */
export function GoogleSignInButton({ mode }: GoogleSignInButtonProps) {
  const notifyError = (message: string) =>
    toast.error("Google sign-in failed", { description: message });

  const { buttonRef, status, isSigningIn } = useGoogleIdentity({
    mode,
    onError: notifyError,
  });
  const fallback = useSignInWithGoogle();

  const handleFallback = async () => {
    try {
      await fallback.mutateAsync();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  if (status === "unavailable") {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleFallback}
        disabled={fallback.isPending}
      >
        {fallback.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-5 w-5" />
        )}
        Continue with Google
      </Button>
    );
  }

  return (
    <div className="relative min-h-11">
      <div ref={buttonRef} className="flex min-h-11 justify-center" aria-busy={isSigningIn} />
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
