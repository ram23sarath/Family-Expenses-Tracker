import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { setAccountConnection } from "@/lib/services/accounts-service";

const disconnectSchema = z.object({
  accountId: z.string().uuid(),
  providerType: z.enum(["zerodha", "groww"])
});

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId } = await getApiSessionContext();
    const payload = disconnectSchema.parse(await request.json());

    await setAccountConnection({
      householdId,
      userId,
      accountId: payload.accountId,
      providerType: payload.providerType,
      externalAccountId: "disconnected",
      encryptedToken: "",
      active: false
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeError(error, 400);
  }
}
