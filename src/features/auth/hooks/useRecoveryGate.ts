import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isRecovering, onRecovery, readRecoveryUrlError } from "../lib/recoveryLatch";

export type RecoveryGateState = "checking" | "ready" | "invalid" | "done";

// How long to wait for a recovery signal before declaring the link invalid.
// The common expired-link case is detected instantly from the URL; this only
// covers a slow in-flight token check or a direct visit with no link at all.
const RECOVERY_WAIT_MS = 5000;

/**
 * Decides whether the current page load is a legitimate password-recovery
 * landing. Robust against the lazy-route race (see `recoveryLatch`): it trusts
 * the durable latch first, surfaces expired-link errors from the URL, and only
 * falls back to "invalid" after a grace window with no recovery signal.
 */
export function useRecoveryGate() {
  // Resolve the cases knowable at first render synchronously: the latch may have
  // already caught the (transient) event before this lazy page mounted, and an
  // expired/used link carries its reason in the URL and emits no event at all.
  const [state, setState] = useState<RecoveryGateState>(() => {
    if (isRecovering()) return "ready";
    if (readRecoveryUrlError()) return "invalid";
    return "checking";
  });
  const isRecovery = useRef(state === "ready");

  useEffect(() => {
    if (state !== "checking") return; // already resolved at render time

    // Wait for the latch or a live recovery event; prolonged silence == invalid.
    const markReady = () => {
      isRecovery.current = true;
      setState("ready");
    };
    const unsubscribeLatch = onRecovery(markReady);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });
    const timeout = window.setTimeout(() => {
      if (!isRecovery.current) setState("invalid");
    }, RECOVERY_WAIT_MS);

    return () => {
      unsubscribeLatch();
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [state]);

  return { state, markDone: () => setState("done") };
}
