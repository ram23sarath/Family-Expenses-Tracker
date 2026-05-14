import { NextRequest, NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { createExpenseEntry, listExpenseEntries } from "@/lib/services/expenses-service";
import { expenseSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const { householdId } = await getApiSessionContext();
    const entries = await listExpenseEntries(householdId);
    return NextResponse.json({ entries });
  } catch (error) {
    return routeError(error, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const payload = expenseSchema.parse(await request.json());
    const entry = await createExpenseEntry({
      householdId,
      userId,
      categoryId: payload.category_id,
      paidByUserId: payload.paid_by_user_id,
      entryType: payload.entry_type,
      amount: payload.amount,
      currency: payload.currency,
      expenseDate: payload.expense_date,
      note: payload.note,
      receiptUrl: payload.receipt_url,
      splitMode: payload.split_mode
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return routeError(error, 400);
  }
}
