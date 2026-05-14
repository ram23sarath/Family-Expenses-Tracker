import { NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { getAllocationReport } from "@/lib/services/reports-service";

export async function GET() {
  try {
    const { householdId } = await getApiSessionContext();
    const data = await getAllocationReport(householdId);
    return NextResponse.json({ points: data });
  } catch (error) {
    return routeError(error, 400);
  }
}
