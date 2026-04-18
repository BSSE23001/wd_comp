export type PlatformFilter = "All Platforms" | "Uber" | "Foodpanda";

export type ChartRow = {
  day: string;
  Uber: number;
  Foodpanda: number;
};

export type LedgerRow = {
  date: string;
  platform: string;
  amount: string;
  status: "Verified" | "Pending";
};

export const platformOptions: PlatformFilter[] = ["All Platforms", "Uber", "Foodpanda"];

export const weeklyIncome: ChartRow[] = [
  { day: "Mon", Uber: 42, Foodpanda: 28 },
  { day: "Tue", Uber: 36, Foodpanda: 31 },
  { day: "Wed", Uber: 48, Foodpanda: 24 },
  { day: "Thu", Uber: 44, Foodpanda: 33 },
  { day: "Fri", Uber: 55, Foodpanda: 38 },
  { day: "Sat", Uber: 61, Foodpanda: 41 },
  { day: "Sun", Uber: 39, Foodpanda: 27 },
];

export const ledger: LedgerRow[] = [
  { date: "18 Apr", platform: "Uber", amount: "$52.40", status: "Verified" },
  { date: "17 Apr", platform: "Foodpanda", amount: "$41.20", status: "Pending" },
  { date: "16 Apr", platform: "Uber", amount: "$58.90", status: "Verified" },
];

export const statusStyles = {
  Verified: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
} as const;

export const verifiedEarnings = 1240;
export const pendingReview = 184;
export const hourlyRate = 14.8;