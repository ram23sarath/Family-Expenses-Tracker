import { getSessionContext } from "@/lib/auth/session";
import { getCashflowReport } from "@/lib/services/reports-service";
import { Card } from "@/components/ui/card";
import { CashflowBarChart } from "@/components/charts/cashflow-bar";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CashflowReportPage() {
  const { householdId } = await getSessionContext();
  const data = await getCashflowReport(householdId);
  return (
    <Card>
      <h2 className="text-lg font-semibold">Cashflow report</h2>
      <p className="mt-1 text-sm text-slate-500">Monthly income vs expense trend.</p>
      {data.length ? <CashflowBarChart data={data} /> : <EmptyState title="No cashflow entries" description="Add transactions or expenses to render this chart." />}
    </Card>
  );
}
