import { useEffect, useRef } from "react";
import {
  ACTIVITY_EVENTS,
  ACTIVITY_THROTTLE_MS,
  CHECK_INTERVAL_MS,
  LOCK_AFTER_MS,
  LOGOUT_AFTER_MS,
} from "../constants";
import { getLastActivity, setLastActivity } from "../lib/lockStorage";

interface InactivityTimerOptions {
  /** Only run while the user is authenticated and past onboarding. */
  enabled: boolean;
  locked: boolean;
  onLock: () => void;
  onLogout: () => void;
}

/**
 * Drives the inactivity lock/logout. Activity is recorded (throttled) only while
 * unlocked, so once locked the last-activity timestamp freezes and the logout
 * timer keeps counting toward LOGOUT_AFTER_MS. The check runs on an interval and
 * on tab focus/visibility so a user returning to an idle tab locks immediately.
 */
export function useInactivityTimer({
  enabled,
  locked,
  onLock,
  onLogout,
}: InactivityTimerOptions) {
  const lockedRef = useRef(locked);
  const onLockRef = useRef(onLock);
  const onLogoutRef = useRef(onLogout);
  useEffect(() => {
    lockedRef.current = locked;
    onLockRef.current = onLock;
    onLogoutRef.current = onLogout;
  });

  // Record activity while unlocked.
  useEffect(() => {
    if (!enabled || locked) return;
    let last = 0;
    const record = () => {
      const now = Date.now();
      if (now - last < ACTIVITY_THROTTLE_MS) return;
      last = now;
      setLastActivity(now);
    };
    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, record, { passive: true }),
    );
    return () =>
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, record));
  }, [enabled, locked]);

  // Evaluate the timers.
  useEffect(() => {
    if (!enabled) return;
    const check = () => {
      const last = getLastActivity();
      if (!last) {
        setLastActivity(Date.now());
        return;
      }
      const elapsed = Date.now() - last;
      if (elapsed >= LOGOUT_AFTER_MS) onLogoutRef.current();
      else if (elapsed >= LOCK_AFTER_MS && !lockedRef.current) onLockRef.current();
    };
    const id = window.setInterval(check, CHECK_INTERVAL_MS);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    check();
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [enabled]);
}
