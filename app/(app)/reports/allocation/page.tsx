import { getSessionContext } from "@/lib/auth/session";
import { getAllocationReport } from "@/lib/services/reports-service";
import { Card } from "@/components/ui/card";
import { AllocationDonutChart } from "@/components/charts/allocation-donut";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AllocationReportPage() {
  const { householdId } = await getSessionContext();
  const data = await getAllocationReport(householdId);
  return (
    <Card>
      <h2 className="text-lg font-semibold">Allocation report</h2>
      <p className="mt-1 text-sm text-slate-500">Current distribution across asset classes.</p>
      {data.length ? <AllocationDonutChart data={data} /> : <EmptyState title="No holdings available" description="Add holdings to visualize allocation." />}
    </Card>
  );
}
