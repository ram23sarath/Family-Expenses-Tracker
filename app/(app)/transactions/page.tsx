import { getSessionContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTransactionsWithFilters } from "@/lib/services/portfolio-service";
import { ManualTransactionDialog } from "@/components/transactions/manual-transaction-dialog";
import { TransactionFilters } from "@/components/filters/transaction-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/utils";

export default async function TransactionsPage({
  searchParams
}: {
  searchParams?: Promise<{
    accountId?: string;
    userId?: string;
    source?: string;
    fromDate?: string;
    toDate?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const [transactions, accountRes, memberRes] = await Promise.all([
    getTransactionsWithFilters(householdId, {
      accountId: params.accountId,
      userId: params.userId,
      source: params.source,
      fromDate: params.fromDate,
      toDate: params.toDate
    }),
    supabase.from("accounts").select("id,name").eq("household_id", householdId).order("name"),
    supabase.from("users_profile").select("id,full_name").eq("household_id", householdId).order("full_name")
  ]);
  if (accountRes.error) throw accountRes.error;
  if (memberRes.error) throw memberRes.error;
  const formatter = currencyFormatter("INR");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <ManualTransactionDialog accounts={accountRes.data ?? []} />
      </div>
      <TransactionFilters accounts={accountRes.data ?? []} members={memberRes.data ?? []} />
      {!transactions.length && <EmptyState title="No transactions found" description="Import CSV or add a manual transaction." />}
      {!!transactions.length && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Type</Th>
                  <Th>Asset</Th>
                  <Th>Symbol</Th>
                  <Th className="text-right">Quantity</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Source</Th>
                </Tr>
              </THead>
              <TBody>
                {transactions.map((tx) => (
                  <Tr key={tx.id}>
                    <Td>{new Date(tx.transaction_date).toLocaleDateString()}</Td>
                    <Td className="capitalize">{tx.transaction_type}</Td>
                    <Td>{tx.asset_name ?? "-"}</Td>
                    <Td>{tx.symbol ?? "-"}</Td>
                    <Td className="text-right">{tx.quantity ? Number(tx.quantity).toFixed(2) : "-"}</Td>
                    <Td className="text-right">{formatter.format(Number(tx.amount))}</Td>
                    <Td className="capitalize">{tx.source}</Td>
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
