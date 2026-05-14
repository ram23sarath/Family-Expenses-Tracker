import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PortfolioFilters {
  accountId?: string;
  userId?: string;
  assetType?: string;
  source?: string;
  fromDate?: string;
  toDate?: string;
}

export const getHoldingsWithFilters = async (householdId: string, filters: PortfolioFilters = {}) => {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("holdings").select("*").eq("household_id", householdId);

  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.assetType) query = query.eq("asset_type", filters.assetType);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.fromDate) query = query.gte("as_of", filters.fromDate);
  if (filters.toDate) query = query.lte("as_of", filters.toDate);

  const { data, error } = await query.order("market_value", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getTransactionsWithFilters = async (householdId: string, filters: PortfolioFilters = {}) => {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("transactions").select("*").eq("household_id", householdId);

  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.fromDate) query = query.gte("transaction_date", filters.fromDate);
  if (filters.toDate) query = query.lte("transaction_date", filters.toDate);

  const { data, error } = await query.order("transaction_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
};
