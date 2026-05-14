import { NextRequest, NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { accountSchema } from "@/lib/validation/schemas";
import { createAccount, listAccounts } from "@/lib/services/accounts-service";

export async function GET() {
  try {
    const { householdId } = await getApiSessionContext();
    const accounts = await listAccounts(householdId);
    return NextResponse.json({ accounts });
  } catch (error) {
    return routeError(error, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const payload = await request.json();
    const parsed = accountSchema.parse(payload);

    const account = await createAccount({
      householdId,
      userId,
      name: parsed.name,
      providerType: parsed.provider_type,
      accountCategory: parsed.account_category,
      baseCurrency: parsed.base_currency
    });
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    return routeError(error, 400);
  }
}
