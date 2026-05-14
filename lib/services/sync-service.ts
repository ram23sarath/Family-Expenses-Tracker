import { getBrokerConnector } from "@/lib/integrations/brokers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditLog } from "@/lib/services/audit-service";
import { upsertLatestPrices } from "@/lib/services/prices-service";
import { recomputeSnapshot } from "@/lib/services/snapshots-service";

export interface SyncOutcome {
  accountId: string;
  providerType: string;
  status: "success" | "failed" | "skipped";
  error?: string;
}

export const getQuarterHourBucketIso = (at = Date.now()) => new Date(Math.floor(at / (15 * 60 * 1000)) * 15 * 60 * 1000).toISOString();

export const buildSyncRunKey = (householdId?: string, at = Date.now()) => `${householdId ?? "all"}:${getQuarterHourBucketIso(at)}`;

export const syncAccount = async (input: {
  householdId: string;
  userId: string;
  accountId: string;
  providerType: "zerodha" | "groww";
}) => {
  const admin = createSupabaseAdminClient();
  const connector = getBrokerConnector(input.providerType);
  if (!connector) throw new Error(`No connector available for ${input.providerType}`);

  const { data: connection, error: connectionError } = await admin
    .from("broker_connections")
    .select("encrypted_access_token, external_account_id")
    .eq("account_id", input.accountId)
    .eq("provider_type", input.providerType)
    .eq("active", true)
    .single();
  if (connectionError) throw connectionError;

  const result = await connector.syncPortfolio({
    accessToken: connection.encrypted_access_token,
    accountExternalId: connection.external_account_id
  });
  const combinedHoldings = [...result.holdings, ...(result.positions ?? []), ...(result.mutual_fund_holdings ?? [])];

  const asOf = new Date().toISOString();
  const holdingsPayload = combinedHoldings.map((holding) => ({
    household_id: input.householdId,
    account_id: input.accountId,
    user_id: input.userId,
    symbol: holding.symbol,
    isin: holding.isin ?? null,
    asset_name: holding.asset_name,
    asset_type: holding.asset_type,
    exchange: holding.exchange ?? null,
    quantity: holding.quantity,
    average_cost: holding.average_cost,
    last_price: holding.last_price,
    market_value: holding.quantity * holding.last_price,
    unrealized_pnl: (holding.last_price - holding.average_cost) * holding.quantity,
    currency: holding.currency,
    as_of: asOf,
    source: result.source,
    raw_payload_json: result.raw_payload
  }));

  if (holdingsPayload.length) {
    const { error: holdingsError } = await admin.from("holdings").upsert(holdingsPayload, {
      onConflict: "household_id,account_id,symbol"
    });
    if (holdingsError) throw holdingsError;
  }

  await upsertLatestPrices(
    combinedHoldings.map((h) => ({
      symbol: h.symbol,
      isin: h.isin,
      asset_name: h.asset_name,
      currency: h.currency,
      ltp: h.last_price,
      exchange: h.exchange,
      source: result.source
    }))
  );

  await admin.from("accounts").update({ last_sync_at: asOf, status: "active" }).eq("id", input.accountId);
  await recomputeSnapshot(input.householdId);
  await createAuditLog({
    householdId: input.householdId,
    actorUserId: input.userId,
    action: "sync.account",
    entityType: "account",
      entityId: input.accountId,
      metadata: { providerType: input.providerType, holdingsCount: combinedHoldings.length }
    });

  return { holdingsCount: combinedHoldings.length };
};

export const syncAllActiveAccounts = async (input: { triggeredByUserId: string | null; householdId?: string }) => {
  const admin = createSupabaseAdminClient();
  const runKey = buildSyncRunKey(input.householdId);

  const { data: existingRun } = await admin.from("sync_jobs").select("id,status").eq("run_key", runKey).maybeSingle();
  if (existingRun?.status === "running" || existingRun?.status === "success") {
    return [];
  }

  const { data: syncJob, error: syncJobCreateError } = await admin
    .from("sync_jobs")
    .upsert(
      {
        household_id: input.householdId ?? null,
        run_key: runKey,
        status: "running",
        started_at: new Date().toISOString(),
        stats_json: {}
      },
      { onConflict: "run_key" }
    )
    .select()
    .single();
  if (syncJobCreateError) throw syncJobCreateError;

  let accountsQuery = admin
    .from("accounts")
    .select("id, household_id, user_id, provider_type, status, last_sync_at")
    .in("provider_type", ["zerodha", "groww"])
    .eq("status", "active");
  if (input.householdId) accountsQuery = accountsQuery.eq("household_id", input.householdId);

  const { data: accounts, error } = await accountsQuery;
  if (error) {
    await admin.from("sync_jobs").update({ status: "failed", error_message: error.message, finished_at: new Date().toISOString() }).eq("id", syncJob.id);
    throw error;
  }

  const outcomes: SyncOutcome[] = [];
  for (const account of accounts ?? []) {
    const lastSyncAt = account.last_sync_at ? new Date(account.last_sync_at).getTime() : 0;
    if (lastSyncAt && Date.now() - lastSyncAt < 13 * 60 * 1000) {
      outcomes.push({ accountId: account.id, providerType: account.provider_type, status: "skipped" });
      continue;
    }

    try {
      await syncAccount({
        householdId: account.household_id,
        userId: account.user_id,
        accountId: account.id,
        providerType: account.provider_type as "zerodha" | "groww"
      });
      outcomes.push({ accountId: account.id, providerType: account.provider_type, status: "success" });
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : "Unknown sync failure";
      outcomes.push({ accountId: account.id, providerType: account.provider_type, status: "failed", error: message });
      await admin.from("accounts").update({ status: "error" }).eq("id", account.id);
      await createAuditLog({
        householdId: account.household_id,
        actorUserId: input.triggeredByUserId,
        action: "sync.account_failed",
        entityType: "account",
        entityId: account.id,
        metadata: { providerType: account.provider_type, error: message }
      });
    }
  }

  const successCount = outcomes.filter((item) => item.status === "success").length;
  const failedCount = outcomes.filter((item) => item.status === "failed").length;
  const skippedCount = outcomes.filter((item) => item.status === "skipped").length;

  await admin
    .from("sync_jobs")
    .update({
      status: failedCount ? (successCount ? "partial_success" : "failed") : "success",
      finished_at: new Date().toISOString(),
      stats_json: {
        total: outcomes.length,
        successCount,
        failedCount,
        skippedCount
      }
    })
    .eq("id", syncJob.id);

  return outcomes;
};
