import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeAllocation, computeCashflowSeries } from "@/lib/domain/calculations";

export const getNetWorthReport = async (householdId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("snapshot_date,total_value,total_invested,total_gain_loss")
    .eq("household_id", householdId)
    .order("snapshot_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const getAllocationReport = async (householdId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("holdings").select("*").eq("household_id", householdId);
  if (error) throw error;
  return computeAllocation(data ?? []);
};

export const getCashflowReport = async (householdId: string) => {
  const supabase = await createSupabaseServerClient();
  const [txRes, expenseRes] = await Promise.all([
    supabase.from("transactions").select("transaction_type,amount,currency,transaction_date").eq("household_id", householdId),
    supabase.from("expense_entries").select("entry_type,amount,currency,expense_date").eq("household_id", householdId)
  ]);
  if (txRes.error) throw txRes.error;
  if (expenseRes.error) throw expenseRes.error;
  const input = [
    ...(txRes.data ?? []),
    ...(expenseRes.data ?? []).map((entry) => ({
      transaction_type: entry.entry_type,
      amount: entry.amount,
      currency: entry.currency,
      transaction_date: entry.expense_date
    }))
  ];
  return computeCashflowSeries(input);
};
