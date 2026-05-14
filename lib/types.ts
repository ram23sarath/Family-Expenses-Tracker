export type ProviderType =
  | "zerodha"
  | "groww"
  | "indmoney_csv"
  | "manual"
  | "bank"
  | "cash";

export type AccountCategory =
  | "brokerage"
  | "mutual_fund"
  | "stock"
  | "cash"
  | "bank"
  | "other";

export type AssetType = "equity" | "mutual_fund" | "etf" | "cash" | "bond" | "other";

export type TransactionType =
  | "buy"
  | "sell"
  | "dividend"
  | "interest"
  | "fee"
  | "transfer"
  | "expense"
  | "income"
  | "deposit"
  | "withdrawal";

export type RoleType = "admin" | "member" | "viewer";

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  household_id: string | null;
  full_name: string;
  role: RoleType;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  household_id: string;
  user_id: string;
  name: string;
  provider_type: ProviderType;
  account_category: AccountCategory;
  base_currency: string;
  status: "active" | "inactive" | "error";
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  household_id: string;
  account_id: string;
  user_id: string;
  symbol: string | null;
  isin: string | null;
  asset_name: string;
  asset_type: AssetType;
  exchange: string | null;
  quantity: number;
  average_cost: number;
  last_price: number;
  market_value: number;
  unrealized_pnl: number;
  currency: string;
  as_of: string;
  source: string;
  raw_payload_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PortfolioSnapshot {
  id: string;
  household_id: string;
  user_id: string | null;
  snapshot_date: string;
  total_invested: number;
  total_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  equity_value: number;
  mutual_fund_value: number;
  cash_value: number;
  other_value: number;
  source_summary_json: Record<string, unknown>;
  created_at: string;
}

export interface Transaction {
  id: string;
  household_id: string;
  account_id: string;
  user_id: string;
  symbol: string | null;
  isin: string | null;
  asset_name: string | null;
  transaction_type: TransactionType;
  quantity: number | null;
  price: number | null;
  amount: number;
  currency: string;
  transaction_date: string;
  source: string;
  raw_payload_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  totalValue: number;
  investedValue: number;
  gainLoss: number;
  gainLossPercent: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export interface AllocationPoint {
  name: string;
  value: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
}
