import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { getAuthProviders } from "../lib/providers";
import { PasswordReauthForm } from "./PasswordReauthForm";
import { GoogleReauthButton } from "./GoogleReauthButton";

interface LockScreenProps {
  session: Session;
  onUnlock: () => void;
  onLogout: () => void;
}

export function LockScreen({ session, onUnlock, onLogout }: LockScreenProps) {
  const email = session.user.email ?? "";
  const { hasPassword, hasGoogle } = getAuthProviders(session);
  // Every account has at least an email login; default to it if detection fails.
  const showPassword = hasPassword || !hasGoogle;
  const [signingOut, setSigningOut] = useState(false);

  // The overlay stays up through sign-out (see SessionLockProvider.logout) and
  // unmounts on SIGNED_OUT, so this pending state just acknowledges the click.
  const handleLogout = () => {
    setSigningOut(true);
    onLogout();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-title"
    >
      <div className="w-full max-w-md space-y-5 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 id="lock-title" className="text-xl font-semibold">
              Session locked
            </h2>
            <p className="text-sm text-muted-foreground">
              We locked your session after a period of inactivity. Verify it's
              you to continue.
            </p>
          </div>
          {email && <p className="text-sm font-medium">{email}</p>}
        </div>

        {showPassword && <PasswordReauthForm email={email} onUnlock={onUnlock} />}

        {showPassword && hasGoogle && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
        )}

        {hasGoogle && (
          <GoogleReauthButton
            email={email}
            onUnlock={onUnlock}
            onLogout={onLogout}
          />
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={handleLogout}
          disabled={signingOut}
        >
          {signingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {signingOut ? "Signing out…" : "Not you? Sign out"}
        </Button>
      </div>
    </div>
  );
}
