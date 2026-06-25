// Minimal ambient typings for the Google Identity Services (GIS) client
// (https://accounts.google.com/gsi/client). Covers only the surface we use
// for "Sign in with ID token". See src/features/auth/hooks/useGoogleIdentity.ts.

export interface CredentialResponse {
  /** The OIDC ID token (JWT) to hand to supabase.auth.signInWithIdToken. */
  credential: string;
  /** How the credential was selected (e.g. "btn", "user", "auto"). */
  select_by: string;
}

export interface GsiIdConfiguration {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  /** SHA-256 hash of the raw nonce passed to Supabase. */
  nonce?: string;
  context?: "signin" | "signup" | "use";
  ux_mode?: "popup" | "redirect";
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
}

export interface GsiButtonConfiguration {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

export interface GoogleAccountsId {
  initialize: (config: GsiIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
  cancel: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}
