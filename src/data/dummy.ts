import type {
  User,
  Account,
  Transaction,
  Deposit,
  Redemption,
  DirectDebitSettings,
} from "@/types";

export const DUMMY_USER: User = {
  id: "usr_demo_001",
  email: "alex@example.com",
  full_name: "Alex Johnson",
  is_admin: false,
  mandate_status: "active",
  created_at: "2025-11-03T09:00:00Z",
};

export const DUMMY_ADMIN_USER: User = {
  ...DUMMY_USER,
  id: "usr_admin_001",
  email: "admin@treatcode.com",
  full_name: "Admin User",
  is_admin: true,
};

export const DUMMY_ACCOUNT: Account = {
  id: "acc_demo_001",
  user_id: DUMMY_USER.id,
  balance: 17500, // £175.00
  created_at: "2025-11-03T09:00:00Z",
};

export const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_001",
    account_id: DUMMY_ACCOUNT.id,
    amount: 5000,
    type: "credit",
    description: "Monthly deposit — November 2025",
    created_at: "2025-11-01T09:00:00Z",
  },
  {
    id: "txn_002",
    account_id: DUMMY_ACCOUNT.id,
    amount: 2500,
    type: "debit",
    description: "ASOS voucher redemption",
    created_at: "2025-11-12T14:23:00Z",
  },
  {
    id: "txn_003",
    account_id: DUMMY_ACCOUNT.id,
    amount: 5000,
    type: "credit",
    description: "Monthly deposit — December 2025",
    created_at: "2025-12-01T09:00:00Z",
  },
  {
    id: "txn_004",
    account_id: DUMMY_ACCOUNT.id,
    amount: 5000,
    type: "credit",
    description: "Monthly deposit — January 2026",
    created_at: "2026-01-01T09:00:00Z",
  },
  {
    id: "txn_005",
    account_id: DUMMY_ACCOUNT.id,
    amount: 5000,
    type: "debit",
    description: "Nike voucher redemption",
    created_at: "2026-01-18T11:05:00Z",
  },
  {
    id: "txn_006",
    account_id: DUMMY_ACCOUNT.id,
    amount: 5000,
    type: "credit",
    description: "Monthly deposit — February 2026",
    created_at: "2026-02-01T09:00:00Z",
  },
  {
    id: "txn_007",
    account_id: DUMMY_ACCOUNT.id,
    amount: 5000,
    type: "credit",
    description: "Monthly deposit — March 2026",
    created_at: "2026-03-01T09:00:00Z",
  },
  {
    id: "txn_008",
    account_id: DUMMY_ACCOUNT.id,
    amount: 1000,
    type: "debit",
    description: "Amazon voucher redemption",
    created_at: "2026-03-10T16:40:00Z",
  },
];

export const DUMMY_DEPOSITS: Deposit[] = [
  {
    id: "dep_001",
    user_id: DUMMY_USER.id,
    amount: 5000,
    status: "paid_out",
    failure_reason: null,
    created_at: "2025-11-01T09:00:00Z",
  },
  {
    id: "dep_002",
    user_id: DUMMY_USER.id,
    amount: 5000,
    status: "paid_out",
    failure_reason: null,
    created_at: "2025-12-01T09:00:00Z",
  },
  {
    id: "dep_003",
    user_id: DUMMY_USER.id,
    amount: 5000,
    status: "paid_out",
    failure_reason: null,
    created_at: "2026-01-01T09:00:00Z",
  },
  {
    id: "dep_004",
    user_id: DUMMY_USER.id,
    amount: 5000,
    status: "paid_out",
    failure_reason: null,
    created_at: "2026-02-01T09:00:00Z",
  },
  {
    id: "dep_005",
    user_id: DUMMY_USER.id,
    amount: 5000,
    status: "paid_out",
    failure_reason: null,
    created_at: "2026-03-01T09:00:00Z",
  },
  {
    id: "dep_006",
    user_id: DUMMY_USER.id,
    amount: 5000,
    status: "failed",
    failure_reason: "Insufficient funds",
    created_at: "2026-04-01T09:00:00Z",
  },
  {
    id: "dep_007",
    user_id: DUMMY_USER.id,
    amount: 5000,
    status: "pending",
    failure_reason: null,
    created_at: "2026-05-01T09:00:00Z",
  },
];

export const DUMMY_REDEMPTIONS: Redemption[] = [
  {
    id: "red_001",
    user_id: DUMMY_USER.id,
    brand_name: "ASOS",
    brand_slug: "asos",
    amount: 2500,
    status: "fulfilled",
    voucher_code: "ASOS-X72K-MN94",
    created_at: "2025-11-12T14:23:00Z",
  },
  {
    id: "red_002",
    user_id: DUMMY_USER.id,
    brand_name: "Nike",
    brand_slug: "nike",
    amount: 5000,
    status: "fulfilled",
    voucher_code: "NIKE-8A3B-PQ71",
    created_at: "2026-01-18T11:05:00Z",
  },
  {
    id: "red_003",
    user_id: DUMMY_USER.id,
    brand_name: "Amazon",
    brand_slug: "amazon",
    amount: 1000,
    status: "pending",
    voucher_code: null,
    created_at: "2026-03-10T16:40:00Z",
  },
];

export const DUMMY_ALL_REDEMPTIONS: Redemption[] = [
  { ...DUMMY_REDEMPTIONS[0], user_email: DUMMY_USER.email, fulfilled_at: "2025-11-13T09:00:00Z" },
  { ...DUMMY_REDEMPTIONS[1], user_email: DUMMY_USER.email, fulfilled_at: "2026-01-19T10:30:00Z" },
  { ...DUMMY_REDEMPTIONS[2], user_email: DUMMY_USER.email },
  {
    id: "red_004",
    user_id: "usr_other_001",
    user_email: "jamie@example.com",
    brand_name: "Zara",
    brand_slug: "zara",
    amount: 5000,
    status: "pending",
    voucher_code: null,
    created_at: "2026-03-14T10:00:00Z",
  },
  {
    id: "red_005",
    user_id: "usr_other_002",
    user_email: "sam@example.com",
    brand_name: "Sephora",
    brand_slug: "sephora",
    amount: 2500,
    status: "fulfilled",
    voucher_code: "SEPH-KL29-ZX44",
    fulfilled_at: "2026-03-01T11:00:00Z",
    created_at: "2026-02-28T08:15:00Z",
  },
  {
    id: "red_006",
    user_id: "usr_other_003",
    user_email: "priya@example.com",
    brand_name: "Nike",
    brand_slug: "nike",
    amount: 10000,
    status: "cancelled",
    voucher_code: null,
    cancelled_at: "2026-03-05T14:20:00Z",
    cancellation_reason: "Voucher currently unavailable",
    created_at: "2026-03-03T09:00:00Z",
  },
];

export const DUMMY_DIRECT_DEBIT: DirectDebitSettings = {
  id: "dd_001",
  user_id: DUMMY_USER.id,
  monthly_amount: 5000, // £50
  collection_day: 1,
  mandate_status: "active",
  created_at: "2025-11-03T09:00:00Z",
};
