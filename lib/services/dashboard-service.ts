import { startOfMonth } from "date-fns";
import { computeAllocation, computeCashflowSeries, computePortfolioSummary } from "@/lib/domain/calculations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getDashboardData = async (householdId: string) => {
  const supabase = await createSupabaseServerClient();
  const [holdingsRes, txRes, expenseRes, snapshotsRes] = await Promise.all([
    supabase.from("holdings").select("*").eq("household_id", householdId),
    supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .gte("transaction_date", startOfMonth(new Date()).toISOString()),
    supabase
      .from("expense_entries")
      .select("entry_type,amount,currency,expense_date")
      .eq("household_id", householdId)
      .gte("expense_date", startOfMonth(new Date()).toISOString().slice(0, 10)),
    supabase.from("portfolio_snapshots").select("*").eq("household_id", householdId).order("snapshot_date", { ascending: true }).limit(90)
  ]);

  if (holdingsRes.error) throw holdingsRes.error;
  if (txRes.error) throw txRes.error;
  if (expenseRes.error) throw expenseRes.error;
  if (snapshotsRes.error) throw snapshotsRes.error;

  const summary = computePortfolioSummary(holdingsRes.data ?? []);
  const cashflowInput = [
    ...(txRes.data ?? []).map((item) => ({
      transaction_type: item.transaction_type,
      amount: Number(item.amount),
      currency: item.currency,
      transaction_date: item.transaction_date
    })),
    ...(expenseRes.data ?? []).map((item) => ({
      transaction_type: item.entry_type,
      amount: Number(item.amount),
      currency: item.currency,
      transaction_date: item.expense_date
    }))
  ];
  const cashflow = computeCashflowSeries(cashflowInput);
  const allocation = computeAllocation(holdingsRes.data ?? []);
  const networthSeries = (snapshotsRes.data ?? []).map((snapshot) => ({
    date: snapshot.snapshot_date,
    value: Number(snapshot.total_value) || 0
  }));

  return {
    summary: {
      ...summary,
      monthlyIncome: cashflow.reduce((sum, item) => sum + item.income, 0),
      monthlyExpense: cashflow.reduce((sum, item) => sum + item.expense, 0)
    },
    allocation,
    cashflow,
    networthSeries
  };
};
