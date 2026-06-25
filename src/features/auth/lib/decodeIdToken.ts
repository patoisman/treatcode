/**
 * Extracts the `email` claim from a Google OIDC ID token WITHOUT verifying it.
 * Used only as a pre-check on the session lock screen to reject a credential
 * from a different Google account before exchanging it — the token is still
 * cryptographically verified server-side by supabase.auth.signInWithIdToken.
 */
export function getIdTokenEmail(idToken: string): string | null {
  try {
    const payload = idToken.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const data = JSON.parse(atob(padded)) as { email?: string };
    return data.email ?? null;
  } catch {
    return null;
  }
}
