import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { syncAccount } from "@/lib/services/sync-service";

const syncAccountSchema = z.object({
  accountId: z.string().uuid(),
  providerType: z.enum(["zerodha", "groww"])
});

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const payload = syncAccountSchema.parse(await request.json());
    const result = await syncAccount({
      householdId,
      userId,
      accountId: payload.accountId,
      providerType: payload.providerType
    });
    return NextResponse.json(result);
  } catch (error) {
    return routeError(error, 400);
  }
}
