import { getSessionContext } from "@/lib/auth/session";
import { listExpenseEntries } from "@/lib/services/expenses-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currencyFormatter } from "@/lib/utils";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";

export default async function ExpensesPage() {
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const [entries, categoriesRes, membersRes] = await Promise.all([
    listExpenseEntries(householdId),
    supabase.from("expense_categories").select("id,name").eq("household_id", householdId).order("name"),
    supabase.from("users_profile").select("id,full_name").eq("household_id", householdId)
  ]);
  const formatter = currencyFormatter("INR");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Expenses & Income</h2>
        <ExpenseEntryDialog categories={categoriesRes.data ?? []} members={membersRes.data ?? []} />
      </div>
      {!entries.length && <EmptyState title="No entries yet" description="Add your first expense or income record." />}
      {!!entries.length && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Category</Th>
                  <Th>Paid by</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Notes</Th>
                </Tr>
              </THead>
              <TBody>
                {entries.map((entry) => (
                  <Tr key={entry.id}>
                    <Td>{new Date(entry.expense_date).toLocaleDateString()}</Td>
                    <Td>{entry.expense_categories?.name ?? "-"}</Td>
                    <Td>{entry.paid_by?.full_name ?? "-"}</Td>
                    <Td className="capitalize">{entry.entry_type}</Td>
                    <Td className={`text-right font-medium ${entry.entry_type === "income" ? "text-emerald-600" : "text-red-600"}`}>{formatter.format(Number(entry.amount))}</Td>
                    <Td className="text-slate-500">{entry.note ?? "-"}</Td>
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
