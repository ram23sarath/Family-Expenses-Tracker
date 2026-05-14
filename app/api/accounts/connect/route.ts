import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { setAccountConnection } from "@/lib/services/accounts-service";

const connectSchema = z.object({
  accountId: z.string().uuid(),
  providerType: z.enum(["zerodha", "groww"]),
  externalAccountId: z.string().min(2),
  accessToken: z.string().min(10)
});

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const payload = connectSchema.parse(await request.json());

    // TODO: Replace with proper encryption/key-management before production.
    const encryptedToken = Buffer.from(payload.accessToken).toString("base64");

    await setAccountConnection({
      householdId,
      userId,
      accountId: payload.accountId,
      providerType: payload.providerType,
      externalAccountId: payload.externalAccountId,
      encryptedToken,
      active: true
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeError(error, 400);
  }
}
