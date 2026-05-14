import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ImportPreview, ImportValidationIssue, ParsedCsvRow } from "@/lib/imports/types";

export default async function ImportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const { data: job } = await supabase.from("import_jobs").select("*").eq("id", id).eq("household_id", householdId).single();
  if (!job) notFound();

  const preview = (job.preview_json ?? { rows: [], issues: [], totalRows: 0, validRows: 0 }) as ImportPreview;
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold">Import {job.id}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Status: <Badge>{job.status}</Badge>
        </p>
      </div>
      <div className="card">
        <p className="text-sm font-semibold text-slate-500">Issues</p>
        <div className="mt-3 space-y-2">
          {preview.issues?.length ? (
            preview.issues.map((issue: ImportValidationIssue) => (
              <p key={`${issue.rowNumber}-${issue.message}`} className={issue.severity === "error" ? "text-sm text-red-600" : "text-sm text-amber-600"}>
                Row {issue.rowNumber}: {issue.message}
              </p>
            ))
          ) : (
            <p className="text-sm text-slate-500">No issues detected.</p>
          )}
        </div>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <THead>
              <Tr>
                <Th>Row</Th>
                <Th>Account</Th>
                <Th>Symbol</Th>
                <Th>Quantity</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
              </Tr>
            </THead>
            <TBody>
              {preview.rows.slice(0, 200).map((row: ParsedCsvRow) => (
                <Tr key={row.rowNumber}>
                  <Td>{row.rowNumber}</Td>
                  <Td>{row.accountName}</Td>
                  <Td>{row.symbol ?? "-"}</Td>
                  <Td>{row.quantity ?? "-"}</Td>
                  <Td>{row.amount ?? "-"}</Td>
                  <Td>{row.transactionDate ?? "-"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
