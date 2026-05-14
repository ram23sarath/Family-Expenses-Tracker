import { NextRequest, NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { inviteMemberSchema } from "@/lib/validation/schemas";
import { inviteMemberToHousehold, listHouseholdMembers } from "@/lib/services/members-service";
import { assertAdmin } from "@/lib/auth/session";

export async function GET() {
  try {
    const { householdId } = await getApiSessionContext();
    const members = await listHouseholdMembers(householdId);
    return NextResponse.json({ members });
  } catch (error) {
    return routeError(error, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { householdId, userId, role } = await getApiSessionContext();
    assertAdmin(role);
    const payload = inviteMemberSchema.parse(await request.json());
    const invited = await inviteMemberToHousehold({
      householdId,
      inviterUserId: userId,
      email: payload.email,
      role: payload.role
    });
    return NextResponse.json({ invited }, { status: 201 });
  } catch (error) {
    return routeError(error, 403);
  }
}
