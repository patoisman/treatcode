// Per-admin "where do I land after sign-in" preference.
//
// Stored in localStorage (not on `profiles`) deliberately: `profiles` has no
// UPDATE RLS policy, so a client can't write to it without an RPC. This is a
// lightweight, per-device UI preference — localStorage is the right home for it.
//
// An admin is an operator first: they default to the admin section and only
// land on the customer dashboard if they last chose to. Non-admins never use this.

export type AdminLanding = "admin" | "dashboard";

const storageKey = (userId: string) => `tc.admin.landing.${userId}`;

export function getAdminLanding(userId: string): AdminLanding {
  if (typeof localStorage === "undefined") return "admin";
  return localStorage.getItem(storageKey(userId)) === "dashboard"
    ? "dashboard"
    : "admin";
}

export function setAdminLanding(userId: string, landing: AdminLanding): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(storageKey(userId), landing);
}

export function adminLandingPath(userId: string): string {
  return getAdminLanding(userId) === "dashboard" ? "/dashboard" : "/admin";
}
