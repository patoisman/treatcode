import { useEffect, useRef, useState } from "react";
import type { CredentialResponse } from "@/types/google-identity";
import { loadGoogleScript } from "../lib/loadGoogleScript";
import { createGoogleNonce } from "../lib/googleNonce";
import { getIdTokenEmail } from "../lib/decodeIdToken";
import { useSignInWithIdToken } from "./useSignInWithIdToken";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

type Status = "loading" | "ready" | "unavailable";

interface UseGoogleIdentityOptions {
  /** "signin" tweaks the rendered button copy + context vs "signup". */
  mode: "signin" | "signup";
  /** Surfaces ID-token sign-in failures to the caller (e.g. a toast). */
  onError?: (message: string) => void;
  /**
   * Re-auth guard (session lock): only allow a credential whose email matches
   * this address, so the user can't unlock into a different Google account.
   */
  expectedEmail?: string;
  /** Called after a successful ID-token sign-in (e.g. to unlock the screen). */
  onSuccess?: () => void;
}

/**
 * Loads Google Identity Services, renders the official sign-in button into
 * `buttonRef`, and exchanges the returned ID token for a Supabase session via
 * signInWithIdToken (raw nonce verified server-side). `status === "unavailable"`
 * when GIS can't load or no client ID is configured, so the caller can fall
 * back to the OAuth redirect flow.
 */
export function useGoogleIdentity({
  mode,
  onError,
  expectedEmail,
  onSuccess,
}: UseGoogleIdentityOptions) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const rawNonceRef = useRef<string>("");
  const [status, setStatus] = useState<Status>(
    CLIENT_ID ? "loading" : "unavailable",
  );
  const signIn = useSignInWithIdToken();

  // Keep the latest callbacks reachable from the GIS callback without re-init.
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  const expectedEmailRef = useRef(expectedEmail);
  const signInRef = useRef(signIn);
  useEffect(() => {
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
    expectedEmailRef.current = expectedEmail;
    signInRef.current = signIn;
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let active = true;

    const handleCredential = (response: CredentialResponse) => {
      const expected = expectedEmailRef.current;
      if (expected) {
        const email = getIdTokenEmail(response.credential);
        if (!email || email.toLowerCase() !== expected.toLowerCase()) {
          onErrorRef.current?.(
            "That Google account doesn't match this session. Use the account you're signed in with.",
          );
          return;
        }
      }
      signInRef.current
        .mutateAsync({ token: response.credential, nonce: rawNonceRef.current })
        .then(() => onSuccessRef.current?.())
        .catch((err: unknown) => {
          onErrorRef.current?.(
            err instanceof Error ? err.message : "Google sign-in failed.",
          );
        });
    };

    const init = async () => {
      try {
        const { nonce, hashedNonce } = await createGoogleNonce();
        await loadGoogleScript();
        if (!active || !buttonRef.current || !window.google) return;

        rawNonceRef.current = nonce;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
          nonce: hashedNonce,
          context: mode,
          ux_mode: "popup",
          use_fedcm_for_prompt: true,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: mode === "signup" ? "signup_with" : "signin_with",
          logo_alignment: "left",
          width: clampWidth(buttonRef.current.clientWidth),
        });
        setStatus("ready");
      } catch {
        if (active) setStatus("unavailable");
      }
    };

    void init();
    return () => {
      active = false;
    };
  }, [mode]);

  return { buttonRef, status, isSigningIn: signIn.isPending };
}

/** GIS only accepts a pixel width in [200, 400]. */
function clampWidth(width: number): number {
  if (!width) return 320;
  return Math.min(400, Math.max(200, Math.round(width)));
}
