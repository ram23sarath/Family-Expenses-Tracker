import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAuditLog } from "@/lib/services/audit-service";

export const listExpenseEntries = async (householdId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expense_entries")
    .select("*, expense_categories(name), paid_by:users_profile!expense_entries_paid_by_user_id_fkey(full_name)")
    .eq("household_id", householdId)
    .order("expense_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const createExpenseEntry = async (input: {
  householdId: string;
  userId: string;
  categoryId: string;
  paidByUserId: string;
  entryType: "expense" | "income";
  amount: number;
  currency: string;
  expenseDate: string;
  note?: string;
  receiptUrl?: string;
  splitMode?: "equal" | "manual";
}) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expense_entries")
    .insert({
      household_id: input.householdId,
      category_id: input.categoryId,
      paid_by_user_id: input.paidByUserId,
      entry_type: input.entryType,
      amount: input.amount,
      currency: input.currency,
      expense_date: input.expenseDate,
      note: input.note ?? null,
      receipt_url: input.receiptUrl ?? null,
      split_mode: input.splitMode ?? "equal"
    })
    .select()
    .single();
  if (error) throw error;

  await createAuditLog({
    householdId: input.householdId,
    actorUserId: input.userId,
    action: "expense.created",
    entityType: "expense_entry",
    entityId: data.id,
    metadata: { entryType: input.entryType, amount: input.amount }
  });

  return data;
};
