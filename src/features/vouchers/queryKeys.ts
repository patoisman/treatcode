export const voucherKeys = {
  all: ["vouchers"] as const,
  brands: () => [...voucherKeys.all, "brands"] as const,
  redemptions: (userId: string) => [...voucherKeys.all, "redemptions", userId] as const,
};
