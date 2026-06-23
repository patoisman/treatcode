export const adminKeys = {
  all: ["admin"] as const,
  redemptions: () => [...adminKeys.all, "redemptions"] as const,
};
