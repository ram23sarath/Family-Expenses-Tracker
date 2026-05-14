import Link from "next/link";
import { getSessionContext } from "@/lib/auth/session";
import { listAccounts } from "@/lib/services/accounts-service";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog";
import { DisconnectAccountButton } from "@/components/accounts/disconnect-account-button";
import { SyncAccountButton } from "@/components/accounts/sync-account-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AccountsPage() {
  const { householdId } = await getSessionContext();
  const accounts = await listAccounts(householdId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Accounts</h2>
        <AddAccountDialog />
      </div>

      {!accounts.length && <EmptyState title="No accounts yet" description="Create an account to start tracking investments and expenses." />}

      {accounts.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Provider</Th>
                  <Th>Category</Th>
                  <Th>Status</Th>
                  <Th>Last Sync</Th>
                  <Th>Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {accounts.map((account) => (
                  <Tr key={account.id}>
                    <Td>
                      <Link href={`/accounts/${account.id}`} className="font-medium text-blue-600 hover:underline">
                        {account.name}
                      </Link>
                    </Td>
                    <Td className="capitalize">{account.provider_type}</Td>
                    <Td className="capitalize">{account.account_category.replace("_", " ")}</Td>
                    <Td>
                      <Badge className={account.status === "active" ? "bg-emerald-100 text-emerald-700" : account.status === "error" ? "bg-red-100 text-red-700" : ""}>{account.status}</Badge>
                    </Td>
                    <Td className="text-xs text-slate-500">{account.last_sync_at ? new Date(account.last_sync_at).toLocaleString() : "Never"}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {(account.provider_type === "zerodha" || account.provider_type === "groww") && (
                          <>
                            <ConnectAccountDialog accountId={account.id} providerType={account.provider_type as "zerodha" | "groww"} />
                            <DisconnectAccountButton accountId={account.id} providerType={account.provider_type as "zerodha" | "groww"} />
                          </>
                        )}
                        <SyncAccountButton accountId={account.id} providerType={account.provider_type} />
                      </div>
                    </Td>
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
