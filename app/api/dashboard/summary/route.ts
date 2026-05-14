import { NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { getDashboardData } from "@/lib/services/dashboard-service";

export async function GET() {
  try {
    const { householdId } = await getApiSessionContext();
    const data = await getDashboardData(householdId);
    return NextResponse.json(data);
  } catch (error) {
    return routeError(error, 400);
  }
}
