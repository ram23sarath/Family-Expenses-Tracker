import { NextRequest, NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { getHoldingsWithFilters } from "@/lib/services/portfolio-service";

export async function GET(request: NextRequest) {
  try {
    const { householdId } = await getApiSessionContext();
    const params = request.nextUrl.searchParams;
    const data = await getHoldingsWithFilters(householdId, {
      accountId: params.get("accountId") ?? undefined,
      userId: params.get("userId") ?? undefined,
      assetType: params.get("assetType") ?? undefined,
      source: params.get("source") ?? undefined,
      fromDate: params.get("fromDate") ?? undefined,
      toDate: params.get("toDate") ?? undefined
    });
    return NextResponse.json({ holdings: data });
  } catch (error) {
    return routeError(error, 400);
  }
}
