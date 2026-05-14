import { createHash } from "crypto";
import { parsePortfolioCsv } from "@/lib/imports/csv";
import type { ParserOptions } from "@/lib/imports/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAuditLog } from "@/lib/services/audit-service";

const digestRow = (householdId: string, accountId: string, row: Record<string, unknown>) => {
  const payload = JSON.stringify([householdId, accountId, row.symbol, row.transactionDate, row.amount, row.quantity]);
  return createHash("sha256").update(payload).digest("hex");
};

export const createUploadJob = async (input: {
  householdId: string;
  userId: string;
  accountId: string;
  providerType: string;
  fileName: string;
  content: string;
}) => {
  const supabase = await createSupabaseServerClient();
  const { data: latestVersionRow } = await supabase
    .from("csv_uploads")
    .select("version")
    .eq("household_id", input.householdId)
    .eq("account_id", input.accountId)
    .eq("provider_type", input.providerType)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = (latestVersionRow?.version ?? 0) + 1;
  const { data, error } = await supabase
    .from("csv_uploads")
    .insert({
      household_id: input.householdId,
      user_id: input.userId,
      account_id: input.accountId,
      provider_type: input.providerType,
      file_name: input.fileName,
      file_content: input.content,
      status: "uploaded",
      version
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const parseUploadJob = async (input: {
  householdId: string;
  userId: string;
  uploadId: string;
  parserOptions?: ParserOptions;
}) => {
  const supabase = await createSupabaseServerClient();
  const { data: upload, error: uploadError } = await supabase
    .from("csv_uploads")
    .select("*")
    .eq("id", input.uploadId)
    .eq("household_id", input.householdId)
    .single();
  if (uploadError) throw uploadError;

  const preview = parsePortfolioCsv(upload.file_content, {
    providerHint: upload.provider_type,
    ...input.parserOptions
  });

  const { data: job, error: jobError } = await supabase
    .from("import_jobs")
    .insert({
      household_id: input.householdId,
      user_id: input.userId,
      upload_id: input.uploadId,
      status: preview.issues.some((issue) => issue.severity === "error") ? "needs_review" : "parsed",
      preview_json: preview
    })
    .select()
    .single();
  if (jobError) throw jobError;

  await supabase.from("csv_uploads").update({ status: "parsed" }).eq("id", input.uploadId);
  await createAuditLog({
    householdId: input.householdId,
    actorUserId: input.userId,
    action: "import.parsed",
    entityType: "import_job",
    entityId: job.id,
    metadata: { issues: preview.issues.length, rows: preview.totalRows }
  });

  return { job, preview };
};

export const commitImportJob = async (input: { householdId: string; userId: string; importJobId: string }) => {
  const supabase = await createSupabaseServerClient();
  const { data: job, error: jobError } = await supabase
    .from("import_jobs")
    .select("id, household_id, upload_id, preview_json, status")
    .eq("id", input.importJobId)
    .eq("household_id", input.householdId)
    .single();
  if (jobError) throw jobError;

  if (!job.preview_json?.rows?.length) {
    throw new Error("Nothing to commit from import job");
  }

  const { data: upload, error: uploadError } = await supabase.from("csv_uploads").select("account_id, provider_type").eq("id", job.upload_id).single();
  if (uploadError) throw uploadError;

  const validRows = job.preview_json.rows.filter((row: Record<string, unknown>) => {
    const issues = job.preview_json.issues.filter((issue: Record<string, unknown>) => issue.rowNumber === row.rowNumber && issue.severity === "error");
    return issues.length === 0;
  });

  const txPayload = validRows.map((row: Record<string, unknown>) => ({
    household_id: input.householdId,
    account_id: upload.account_id,
    user_id: input.userId,
    symbol: row.symbol ?? null,
    isin: row.isin ?? null,
    asset_name: row.assetName ?? null,
    transaction_type: row.transactionType ?? "buy",
    quantity: row.quantity ?? null,
    price: row.price ?? null,
    amount: row.amount ?? 0,
    currency: row.currency ?? "INR",
    transaction_date: row.transactionDate,
    source: upload.provider_type,
    import_hash: digestRow(input.householdId, upload.account_id, row),
    raw_payload_json: row.raw ?? {}
  }));

  if (txPayload.length) {
    const { error: txError } = await supabase.from("transactions").upsert(txPayload, { onConflict: "household_id,import_hash" });
    if (txError) throw txError;
  }

  const groupedBySymbol = new Map<string, Record<string, unknown>>();
  validRows.forEach((row: Record<string, unknown>) => {
    const key = String(row.symbol ?? row.assetName ?? `ROW_${row.rowNumber}`);
    const existing = groupedBySymbol.get(key);
    if (existing) {
      existing.quantity = Number(existing.quantity ?? 0) + Number(row.quantity ?? 0);
      existing.market_value = Number(existing.market_value ?? 0) + Number(row.amount ?? 0);
      existing.average_cost = Number(existing.market_value) / Math.max(Number(existing.quantity), 1);
      existing.last_price = Number(row.price ?? existing.last_price ?? 0);
      existing.raw_payload_json = row.raw ?? {};
    } else {
      groupedBySymbol.set(key, {
        household_id: input.householdId,
        account_id: upload.account_id,
        user_id: input.userId,
        symbol: row.symbol ?? "",
        isin: row.isin ?? null,
        asset_name: row.assetName ?? row.symbol ?? "Imported Asset",
        asset_type: "other",
        exchange: null,
        quantity: Number(row.quantity ?? 0),
        average_cost: Number(row.price ?? row.amount ?? 0),
        last_price: Number(row.price ?? row.amount ?? 0),
        market_value: Number(row.amount ?? 0),
        unrealized_pnl: 0,
        currency: row.currency ?? "INR",
        as_of: row.transactionDate ?? new Date().toISOString(),
        source: upload.provider_type,
        raw_payload_json: row.raw ?? {}
      });
    }
  });

  const holdingsPayload = Array.from(groupedBySymbol.values());
  if (holdingsPayload.length) {
    const { error: holdingError } = await supabase.from("holdings").upsert(holdingsPayload, {
      onConflict: "household_id,account_id,symbol"
    });
    if (holdingError) throw holdingError;
  }

  await supabase.from("import_jobs").update({ status: "committed", committed_at: new Date().toISOString() }).eq("id", input.importJobId);
  await supabase.from("csv_uploads").update({ status: "committed" }).eq("id", job.upload_id);

  await createAuditLog({
    householdId: input.householdId,
    actorUserId: input.userId,
    action: "import.committed",
    entityType: "import_job",
    entityId: input.importJobId,
    metadata: { validRows: validRows.length }
  });

  return { committedRows: validRows.length };
};
