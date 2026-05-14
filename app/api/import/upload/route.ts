import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { createUploadJob } from "@/lib/services/imports-service";

const uploadSchema = z.object({
  accountId: z.string().uuid(),
  providerType: z.enum(["indmoney_csv", "zerodha", "groww", "manual", "bank", "cash"])
});

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const formData = await request.formData();
    const accountId = String(formData.get("accountId") ?? "");
    const providerType = String(formData.get("providerType") ?? "indmoney_csv");
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("CSV file is required");

    const parsedInput = uploadSchema.parse({ accountId, providerType });
    const content = await file.text();

    const upload = await createUploadJob({
      householdId,
      userId,
      accountId: parsedInput.accountId,
      providerType: parsedInput.providerType,
      fileName: file.name,
      content
    });

    return NextResponse.json({ upload });
  } catch (error) {
    return routeError(error, 400);
  }
}
