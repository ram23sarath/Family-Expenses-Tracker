import { SummaryCards } from "@/components/dashboard/summary-cards";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AllocationDonutChart } from "@/components/charts/allocation-donut";
import { CashflowBarChart } from "@/components/charts/cashflow-bar";
import { NetWorthLineChart } from "@/components/charts/net-worth-line";
import { getSessionContext } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard-service";

export default async function DashboardPage() {
  const { householdId } = await getSessionContext();
  const data = await getDashboardData(householdId);

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-slate-500">Net worth over time</p>
          {data.networthSeries.length ? <NetWorthLineChart data={data.networthSeries} /> : <EmptyState title="No snapshots yet" description="Run sync or import data to build trend charts." />}
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Asset allocation</p>
          {data.allocation.length ? <AllocationDonutChart data={data.allocation} /> : <EmptyState title="No allocation data" description="Add holdings to see allocation." />}
        </Card>
      </div>
      <Card>
        <p className="text-sm font-semibold text-slate-500">Monthly income vs expense</p>
        {data.cashflow.length ? <CashflowBarChart data={data.cashflow} /> : <EmptyState title="No cashflow yet" description="Add transactions or expenses to see monthly cashflow." />}
      </Card>
    </div>
  );
}
