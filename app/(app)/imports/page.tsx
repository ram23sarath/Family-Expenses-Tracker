import Link from "next/link";
import { getSessionContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ImportDialog } from "@/components/imports/import-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ImportsPage() {
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const [jobsRes, accountsRes] = await Promise.all([
    supabase.from("import_jobs").select("id,status,created_at,committed_at,upload_id").eq("household_id", householdId).order("created_at", { ascending: false }),
    supabase.from("accounts").select("id,name,provider_type").eq("household_id", householdId).order("name")
  ]);
  if (jobsRes.error) throw jobsRes.error;
  if (accountsRes.error) throw accountsRes.error;
  const uploadIds = (jobsRes.data ?? []).map((job) => job.upload_id);
  const { data: uploads } = uploadIds.length
    ? await supabase.from("csv_uploads").select("id,file_name").in("id", uploadIds)
    : { data: [] as Array<{ id: string; file_name: string }> };
  const uploadsById = new Map((uploads ?? []).map((upload) => [upload.id, upload.file_name]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Imports</h2>
        <div className="flex items-center gap-2">
          <ImportDialog accounts={accountsRes.data ?? []} />
          <Link href="/imports/new" className="rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200">
            Open full wizard
          </Link>
        </div>
      </div>

      {!jobsRes.data?.length && <EmptyState title="No imports yet" description="Upload your first CSV to import holdings and transactions." />}

      {!!jobsRes.data?.length && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Import</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Committed</Th>
                </Tr>
              </THead>
              <TBody>
                {jobsRes.data.map((job) => (
                  <Tr key={job.id}>
                    <Td>
                      <Link href={`/imports/${job.id}`} className="text-blue-600 hover:underline">
                        {uploadsById.get(job.upload_id) ?? "Upload"}
                      </Link>
                    </Td>
                    <Td>
                      <Badge>{job.status}</Badge>
                    </Td>
                    <Td>{new Date(job.created_at).toLocaleString()}</Td>
                    <Td>{job.committed_at ? new Date(job.committed_at).toLocaleString() : "-"}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
