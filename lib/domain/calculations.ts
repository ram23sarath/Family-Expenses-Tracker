import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import type { AllocationPoint, CashflowPoint, DashboardSummary, Holding, PortfolioSnapshot } from "@/lib/types";
import { safeNumber } from "@/lib/utils";
import { convertToInr } from "@/lib/domain/fx";

export const computePortfolioSummary = (holdings: Holding[]): DashboardSummary => {
  const investedValue = holdings.reduce(
    (sum, item) => sum + convertToInr(safeNumber(item.average_cost) * safeNumber(item.quantity), item.currency),
    0
  );
  const totalValue = holdings.reduce((sum, item) => sum + convertToInr(safeNumber(item.market_value), item.currency), 0);
  const gainLoss = totalValue - investedValue;
  const gainLossPercent = investedValue > 0 ? gainLoss / investedValue : 0;

  return {
    totalValue,
    investedValue,
    gainLoss,
    gainLossPercent,
    monthlyIncome: 0,
    monthlyExpense: 0
  };
};

export const computeAllocation = (holdings: Holding[]): AllocationPoint[] => {
  const group = new Map<string, number>();
  holdings.forEach((item) => {
    const prev = group.get(item.asset_type) ?? 0;
    group.set(item.asset_type, prev + convertToInr(safeNumber(item.market_value), item.currency));
  });
  return Array.from(group.entries()).map(([name, value]) => ({ name, value }));
};

export const computeCashflowSeries = (
  transactions: Array<{ transaction_type: string; amount: number; currency: string; transaction_date: string }>
): CashflowPoint[] => {
  const byMonth = new Map<string, { income: number; expense: number }>();

  transactions.forEach((tx) => {
    const month = format(parseISO(tx.transaction_date), "yyyy-MM");
    const prev = byMonth.get(month) ?? { income: 0, expense: 0 };
    if (tx.transaction_type === "income" || tx.transaction_type === "dividend" || tx.transaction_type === "interest") {
      prev.income += convertToInr(safeNumber(tx.amount), tx.currency);
    }
    if (tx.transaction_type === "expense" || tx.transaction_type === "fee") {
      prev.expense += convertToInr(safeNumber(tx.amount), tx.currency);
    }
    byMonth.set(month, prev);
  });

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, income: value.income, expense: value.expense }));
};

export const buildSnapshotFromHoldings = (
  householdId: string,
  userId: string | null,
  holdings: Holding[],
  snapshotDate = new Date().toISOString()
): Omit<PortfolioSnapshot, "id" | "created_at"> => {
  const totalInvested = holdings.reduce(
    (sum, item) => sum + convertToInr(safeNumber(item.average_cost) * safeNumber(item.quantity), item.currency),
    0
  );
  const totalValue = holdings.reduce((sum, item) => sum + convertToInr(safeNumber(item.market_value), item.currency), 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercent = totalInvested ? totalGainLoss / totalInvested : 0;

  const bucket = {
    equity: 0,
    mutual_fund: 0,
    cash: 0,
    other: 0
  };

  holdings.forEach((holding) => {
    const value = convertToInr(safeNumber(holding.market_value), holding.currency);
    if (holding.asset_type === "equity" || holding.asset_type === "etf" || holding.asset_type === "bond") bucket.equity += value;
    else if (holding.asset_type === "mutual_fund") bucket.mutual_fund += value;
    else if (holding.asset_type === "cash") bucket.cash += value;
    else bucket.other += value;
  });

  const sourceSummary = holdings.reduce<Record<string, number>>((acc, item) => {
    acc[item.source] = (acc[item.source] ?? 0) + convertToInr(safeNumber(item.market_value), item.currency);
    return acc;
  }, {});

  return {
    household_id: householdId,
    user_id: userId,
    snapshot_date: snapshotDate,
    total_invested: totalInvested,
    total_value: totalValue,
    total_gain_loss: totalGainLoss,
    total_gain_loss_percent: totalGainLossPercent,
    equity_value: bucket.equity,
    mutual_fund_value: bucket.mutual_fund,
    cash_value: bucket.cash,
    other_value: bucket.other,
    source_summary_json: sourceSummary
  };
};

export const buildMonthlySeries = (snapshots: Pick<PortfolioSnapshot, "snapshot_date" | "total_value">[]) => {
  const groups = new Map<string, number>();
  snapshots.forEach((snapshot) => {
    const date = parseISO(snapshot.snapshot_date);
    const monthKey = format(startOfMonth(date), "yyyy-MM-dd");
    const existing = groups.get(monthKey) ?? 0;
    groups.set(monthKey, Math.max(existing, safeNumber(snapshot.total_value)));
    endOfMonth(date);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
};
