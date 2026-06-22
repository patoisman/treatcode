export const authKeys = {
  all: ["auth"] as const,
  profile: (userId: string) => [...authKeys.all, "profile", userId] as const,
};
