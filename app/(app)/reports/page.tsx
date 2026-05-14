import Link from "next/link";
import { Card } from "@/components/ui/card";

const reports = [
  { href: "/reports/net-worth", title: "Net Worth", description: "Historical value trend and gains." },
  { href: "/reports/allocation", title: "Allocation", description: "Current allocation by asset class." },
  { href: "/reports/cashflow", title: "Cashflow", description: "Monthly income vs expenses." }
];

export default function ReportsPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reports.map((report) => (
        <Link key={report.href} href={report.href}>
          <Card className="h-full hover:border-blue-300 hover:shadow-md">
            <h2 className="text-lg font-semibold">{report.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{report.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
