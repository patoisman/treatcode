/** Idle time before the screen locks (re-auth required). */
export const LOCK_AFTER_MS = 5 * 60 * 1000;

/** Idle time before the session is fully signed out. */
export const LOGOUT_AFTER_MS = 30 * 60 * 1000;

/** How often the inactivity timers are evaluated. */
export const CHECK_INTERVAL_MS = 5_000;

/** Minimum gap between persisted activity timestamps. */
export const ACTIVITY_THROTTLE_MS = 1_000;

/** DOM events that count as user activity. */
export const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "wheel",
] as const;
