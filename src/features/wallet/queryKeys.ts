export const walletKeys = {
  all: ["wallet"] as const,
  balance: (userId: string) => [...walletKeys.all, "balance", userId] as const,
  ledger: (userId: string) => [...walletKeys.all, "ledger", userId] as const,
};
