export const depositKeys = {
  all: ["deposits"] as const,
  list: (userId: string) => [...depositKeys.all, "list", userId] as const,
};
