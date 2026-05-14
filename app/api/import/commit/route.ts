import { NextRequest, NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { csvCommitRequestSchema } from "@/lib/validation/schemas";
import { commitImportJob } from "@/lib/services/imports-service";

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const payload = csvCommitRequestSchema.parse(await request.json());
    const result = await commitImportJob({
      householdId,
      userId,
      importJobId: payload.importJobId
    });
    return NextResponse.json(result);
  } catch (error) {
    return routeError(error, 400);
  }
}
