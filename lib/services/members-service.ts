import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAuditLog } from "@/lib/services/audit-service";

export const listHouseholdMembers = async (householdId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("users_profile").select("*").eq("household_id", householdId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const inviteMemberToHousehold = async (input: {
  householdId: string;
  inviterUserId: string;
  email: string;
  role: "admin" | "member" | "viewer";
}) => {
  const admin = createSupabaseAdminClient();
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    redirectTo: `${baseUrl}/dashboard`,
    data: {
      household_id: input.householdId,
      role: input.role
    }
  });

  if (error) throw error;

  await createAuditLog({
    householdId: input.householdId,
    actorUserId: input.inviterUserId,
    action: "member.invited",
    entityType: "user",
    entityId: data.user?.id,
    metadata: { email: input.email, role: input.role }
  });

  return data;
};
