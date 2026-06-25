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
    clearLockState();
    setLockedState(false);
    await supabase.auth.signOut();
  }, []);

  // Any full sign-out (here, another tab, or a token expiry) clears the
  // persisted lock state so the next login never starts locked. A plain page
  // refresh fires no SIGNED_OUT, so a locked session stays locked across reload.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
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
