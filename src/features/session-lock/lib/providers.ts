import type { Session } from "@supabase/supabase-js";

interface AuthProviders {
  hasPassword: boolean;
  hasGoogle: boolean;
}

/**
 * Determines which sign-in methods the user has, so the lock screen can offer
 * password re-entry, a Google re-verify, or both. Reads `app_metadata.providers`
 * (array) with a fallback to the legacy single `provider` string.
 */
export function getAuthProviders(session: Session): AuthProviders {
  const meta = session.user.app_metadata ?? {};
  const list = Array.isArray(meta.providers)
    ? (meta.providers as string[])
    : meta.provider
      ? [meta.provider as string]
      : [];

  return {
    hasPassword: list.includes("email"),
    hasGoogle: list.includes("google"),
  };
}
