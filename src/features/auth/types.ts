import type { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type OnboardingStatus = "new" | "pledge_set" | "setup_complete";
