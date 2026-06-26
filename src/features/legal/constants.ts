// Single source of truth for company / contact details used across the legal pages.
export const LEGAL_COMPANY = {
  name: "Treat Code Ltd",
  brand: "Treatcode",
  companyNumber: "16429228",
  jurisdiction: "England and Wales",
  email: "treatcode@treat-code.com",
} as const;

// Bump this whenever the privacy policy or terms are materially updated.
export const LEGAL_LAST_UPDATED = "24 June 2026";
