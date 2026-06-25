import { useCallback, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/auth/hooks/useProfile";
import {
  LOCKED_KEY,
  clearLockState,
  getLocked,
  setLastActivity,
  setLocked as persistLocked,
} from "./lib/lockStorage";
import { useInactivityTimer } from "./hooks/useInactivityTimer";
import { LockScreen } from "./components/LockScreen";

/**
 * Locks the screen (re-auth required) after LOCK_AFTER_MS of inactivity and
 * signs the user out after LOGOUT_AFTER_MS. Active only for authenticated,
 * fully-onboarded users — so it never interferes with the onboarding /
 * GoCardless redirect flow. The session is kept alive while locked; unlocking
 * is a re-verification (password or Google), not a fresh login.
 */
export function SessionLockProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const { data: profile } = useProfile();
  const enabled = !!session && profile?.onboarding_status === "setup_complete";
  const [locked, setLockedState] = useState(getLocked);

  const lock = useCallback(() => {
    persistLocked(true);
    setLockedState(true);
  }, []);

  const unlock = useCallback(() => {
    setLastActivity(Date.now());
    persistLocked(false);
    setLockedState(false);
  }, []);

  const logout = useCallback(async () => {
    // Keep the lock overlay up THROUGH sign-out so the protected page never
    // flashes underneath. The SIGNED_OUT handler below clears the lock at the
    // same moment the session goes null, so the overlay unmounts and
    // ProtectedRoute redirects to /signin in a single render. The finally is a
    // safety net in case sign-out resolves without emitting SIGNED_OUT.
    try {
      await supabase.auth.signOut();
    } finally {
      clearLockState();
      setLockedState(false);
    }
  }, []);

  // Any full sign-out clears the persisted lock so the next login never starts
  // locked. PASSWORD_RECOVERY also clears it — the user is resetting their
  // password (possibly because they forgot it), so blocking them with the lock
  // screen is a catch-22.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "PASSWORD_RECOVERY") {
        clearLockState();
        setLockedState(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Mirror lock/unlock performed in another tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCKED_KEY) setLockedState(getLocked());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useInactivityTimer({ enabled, locked, onLock: lock, onLogout: logout });

  return (
    <>
      {children}
      {enabled && locked && session && (
        <LockScreen session={session} onUnlock={unlock} onLogout={logout} />
      )}
    </>
  );
}
