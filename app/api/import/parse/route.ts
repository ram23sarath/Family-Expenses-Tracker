import { NextRequest, NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { csvParseRequestSchema } from "@/lib/validation/schemas";
import { parseUploadJob } from "@/lib/services/imports-service";

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const payload = csvParseRequestSchema.parse(await request.json());
    const result = await parseUploadJob({
      householdId,
      userId,
      uploadId: payload.uploadId,
      parserOptions: payload.parserOptions
    });
    return NextResponse.json(result);
  } catch (error) {
    return routeError(error, 400);
  }
}
