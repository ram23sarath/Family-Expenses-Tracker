import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface AuditInput {
  householdId: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export const createAuditLog = async (input: AuditInput) => {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("audit_logs").insert({
    household_id: input.householdId,
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata_json: input.metadata ?? {}
  });

  if (error) throw error;
};
