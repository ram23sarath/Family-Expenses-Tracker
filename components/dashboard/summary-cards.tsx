import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { currencyFormatter, pctFormatter } from "@/lib/utils";
import type { DashboardSummary } from "@/lib/types";

export const SummaryCards = ({ summary }: { summary: DashboardSummary }) => {
  const formatter = currencyFormatter("INR");
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardTitle>Total Portfolio Value</CardTitle>
        <CardValue>{formatter.format(summary.totalValue)}</CardValue>
      </Card>
      <Card>
        <CardTitle>Total Invested</CardTitle>
        <CardValue>{formatter.format(summary.investedValue)}</CardValue>
      </Card>
      <Card>
        <CardTitle>Unrealized Gain/Loss</CardTitle>
        <CardValue className={summary.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"}>{formatter.format(summary.gainLoss)}</CardValue>
        <p className="mt-1 text-xs text-slate-500">{pctFormatter.format(summary.gainLossPercent)}</p>
      </Card>
      <Card>
        <CardTitle>Monthly Cashflow</CardTitle>
        <CardValue>{formatter.format(summary.monthlyIncome - summary.monthlyExpense)}</CardValue>
        <p className="mt-1 text-xs text-slate-500">
          Income {formatter.format(summary.monthlyIncome)} • Expense {formatter.format(summary.monthlyExpense)}
        </p>
      </Card>
    </section>
  );
};
