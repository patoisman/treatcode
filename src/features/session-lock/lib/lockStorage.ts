// Inactivity state is kept in localStorage so it survives a refresh, tolerates
// background-tab throttling/sleep (we compare timestamps, not setTimeout), and
// syncs across tabs via the `storage` event.

export const LAST_ACTIVITY_KEY = "tc.lock.last-activity";
export const LOCKED_KEY = "tc.lock.locked";

export function getLastActivity(): number {
  try {
    const ts = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(ts) ? ts : 0;
  } catch {
    return 0;
  }
}

export function setLastActivity(ts: number) {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(ts));
  } catch {
    /* storage unavailable — timers fall back to in-memory behaviour */
  }
}

export function getLocked(): boolean {
  try {
    return localStorage.getItem(LOCKED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setLocked(value: boolean) {
  try {
    localStorage.setItem(LOCKED_KEY, value ? "true" : "false");
  } catch {
    /* no-op */
  }
}

export function clearLockState() {
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem(LOCKED_KEY);
  } catch {
    /* no-op */
  }
}
