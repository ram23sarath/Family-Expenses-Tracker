import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAuditLog } from "@/lib/services/audit-service";
import type { ProviderType } from "@/lib/types";

export const listAccounts = async (householdId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("accounts").select("*").eq("household_id", householdId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const createAccount = async (input: {
  householdId: string;
  userId: string;
  name: string;
  providerType: ProviderType;
  accountCategory: string;
  baseCurrency: string;
}) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      household_id: input.householdId,
      user_id: input.userId,
      name: input.name,
      provider_type: input.providerType,
      account_category: input.accountCategory,
      base_currency: input.baseCurrency,
      status: "active"
    })
    .select()
    .single();
  if (error) throw error;

  await createAuditLog({
    householdId: input.householdId,
    actorUserId: input.userId,
    action: "account.created",
    entityType: "account",
    entityId: data.id,
    metadata: { providerType: input.providerType }
  });
  return data;
};

export const setAccountConnection = async (input: {
  householdId: string;
  userId: string;
  accountId: string;
  providerType: ProviderType;
  externalAccountId: string;
  encryptedToken: string;
  active: boolean;
}) => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("broker_connections").upsert(
    {
      household_id: input.householdId,
      account_id: input.accountId,
      provider_type: input.providerType,
      external_account_id: input.externalAccountId,
      encrypted_access_token: input.encryptedToken,
      active: input.active,
      updated_by: input.userId
    },
    { onConflict: "account_id,provider_type" }
  );
  if (error) throw error;

  await createAuditLog({
    householdId: input.householdId,
    actorUserId: input.userId,
    action: input.active ? "account.connected" : "account.disconnected",
    entityType: "account",
    entityId: input.accountId,
    metadata: { providerType: input.providerType }
  });
};
