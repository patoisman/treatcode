export interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  mandate_status: "pending" | "active" | "cancelled" | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  balance: number; // in pence
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  amount: number; // in pence
  type: "credit" | "debit";
  description: string;
  created_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number; // in pence
  status: "paid_out" | "confirmed" | "pending" | "failed" | "cancelled";
  failure_reason: string | null;
  created_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  brand_name: string;
  brand_slug: string;
  amount: number; // in pence
  status: "pending" | "fulfilled" | "cancelled";
  voucher_code: string | null;
  voucher_instructions?: string | null;
  admin_notes?: string | null;
  user_email?: string;
  fulfilled_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
}

export interface DirectDebitSettings {
  id: string;
  user_id: string;
  monthly_amount: number; // in pence
  collection_day: number;
  mandate_status: "pending" | "active" | "cancelled";
  created_at: string;
}

export interface Brand {
  name: string;
  slug: string;
  logo: string;
  denominations: number[]; // in pence
  category: string;
}
