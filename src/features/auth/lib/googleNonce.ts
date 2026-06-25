export interface GoogleNonce {
  /** Raw nonce — passed to supabase.auth.signInWithIdToken. */
  nonce: string;
  /** SHA-256 hex hash of the raw nonce — passed to Google Identity Services. */
  hashedNonce: string;
}

/**
 * Generates a nonce pair for the Google ID-token flow. Google receives the
 * hashed value (embedded in the returned token's `nonce` claim); Supabase
 * receives the raw value and re-hashes it to verify the token wasn't replayed.
 */
export async function createGoogleNonce(): Promise<GoogleNonce> {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  );
  const encodedNonce = new TextEncoder().encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { nonce, hashedNonce };
}
