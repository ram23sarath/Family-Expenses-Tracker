import { NextRequest, NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { syncAllActiveAccounts } from "@/lib/services/sync-service";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-cron-secret");
    const cronSecret = process.env.CRON_SYNC_SHARED_SECRET;
    if (cronSecret && authHeader === cronSecret) {
      const outcomes = await syncAllActiveAccounts({ triggeredByUserId: null });
      return NextResponse.json({ outcomes });
    }

    const { userId, householdId } = await getApiSessionContext();
    const outcomes = await syncAllActiveAccounts({ triggeredByUserId: userId, householdId });
    return NextResponse.json({ outcomes });
  } catch (error) {
    return routeError(error, 400);
  }
}
