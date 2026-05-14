import { getSessionContext } from "@/lib/auth/session";
import { listHouseholdMembers } from "@/lib/services/members-service";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function MembersPage() {
  const { householdId } = await getSessionContext();
  const members = await listHouseholdMembers(householdId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Family members</h2>
        <InviteMemberDialog />
      </div>
      {!members.length && <EmptyState title="No members found" description="Invite a family member to collaborate." />}
      {!!members.length && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email / User ID</Th>
                  <Th>Role</Th>
                  <Th>Created</Th>
                </Tr>
              </THead>
              <TBody>
                {members.map((member) => (
                  <Tr key={member.id}>
                    <Td>{member.full_name || "Unnamed"}</Td>
                    <Td className="text-xs text-slate-600">{member.id}</Td>
                    <Td className="capitalize">{member.role}</Td>
                    <Td>{new Date(member.created_at).toLocaleDateString()}</Td>
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
