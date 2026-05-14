import { NextRequest, NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { manualTransactionSchema } from "@/lib/validation/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAuditLog } from "@/lib/services/audit-service";

export async function GET() {
  try {
    const { householdId } = await getApiSessionContext();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .order("transaction_date", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ transactions: data ?? [] });
  } catch (error) {
    return routeError(error, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const payload = manualTransactionSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        household_id: householdId,
        account_id: payload.account_id,
        user_id: userId,
        symbol: payload.symbol ?? null,
        isin: null,
        asset_name: payload.asset_name ?? null,
        transaction_type: payload.transaction_type,
        quantity: payload.quantity ?? null,
        price: payload.price ?? null,
        amount: payload.amount,
        currency: payload.currency,
        transaction_date: payload.transaction_date,
        source: "manual",
        raw_payload_json: { notes: payload.notes ?? null }
      })
      .select()
      .single();
    if (error) throw error;

    await createAuditLog({
      householdId,
      actorUserId: userId,
      action: "transaction.created",
      entityType: "transaction",
      entityId: data.id,
      metadata: { type: payload.transaction_type, amount: payload.amount }
    });

    return NextResponse.json({ transaction: data }, { status: 201 });
  } catch (error) {
    return routeError(error, 400);
  }
}
