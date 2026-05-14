import { getSessionContext } from "@/lib/auth/session";
import { getNetWorthReport } from "@/lib/services/reports-service";
import { Card } from "@/components/ui/card";
import { NetWorthLineChart } from "@/components/charts/net-worth-line";
import { EmptyState } from "@/components/ui/empty-state";

export default async function NetWorthReportPage() {
  const { householdId } = await getSessionContext();
  const points = await getNetWorthReport(householdId);
  const data = points.map((point) => ({ date: point.snapshot_date, value: Number(point.total_value) }));
  return (
    <Card>
      <h2 className="text-lg font-semibold">Net worth report</h2>
      <p className="mt-1 text-sm text-slate-500">Tracks household value over time.</p>
      {data.length ? <NetWorthLineChart data={data} /> : <EmptyState title="No snapshot data" description="Run sync/import then generate snapshots." />}
    </Card>
  );
}
