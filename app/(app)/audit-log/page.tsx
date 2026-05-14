import { getSessionContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";

export default async function AuditLogPage() {
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,action,entity_type,entity_id,metadata_json,created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Audit log</h2>
      {!data?.length && <EmptyState title="No events yet" description="System actions, imports, and syncs will appear here." />}
      {!!data?.length && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Time</Th>
                  <Th>Action</Th>
                  <Th>Entity</Th>
                  <Th>Metadata</Th>
                </Tr>
              </THead>
              <TBody>
                {data.map((entry) => (
                  <Tr key={entry.id}>
                    <Td>{new Date(entry.created_at).toLocaleString()}</Td>
                    <Td>{entry.action}</Td>
                    <Td>
                      {entry.entity_type} {entry.entity_id ? `(${entry.entity_id})` : ""}
                    </Td>
                    <Td className="max-w-[400px] truncate text-xs text-slate-500">{JSON.stringify(entry.metadata_json)}</Td>
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
