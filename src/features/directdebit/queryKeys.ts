export const directDebitKeys = {
  all: ["directdebit"] as const,
  mandate: (userId: string) => [...directDebitKeys.all, "mandate", userId] as const,
  subscription: (userId: string) => [...directDebitKeys.all, "subscription", userId] as const,
  billingRequest: (userId: string) => [...directDebitKeys.all, "billing-request", userId] as const,
};
