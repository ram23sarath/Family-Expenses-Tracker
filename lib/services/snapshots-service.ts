import { buildSnapshotFromHoldings } from "@/lib/domain/calculations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const quarterHourBucket = () => {
  const step = 15 * 60 * 1000;
  return new Date(Math.floor(Date.now() / step) * step).toISOString();
};

export const recomputeSnapshot = async (householdId: string, userId: string | null = null) => {
  const supabase = await createSupabaseServerClient();
  let holdingQuery = supabase.from("holdings").select("*").eq("household_id", householdId);
  if (userId) holdingQuery = holdingQuery.eq("user_id", userId);
  const { data: holdings, error: holdingError } = await holdingQuery;
  if (holdingError) throw holdingError;

  const snapshot = buildSnapshotFromHoldings(householdId, userId, holdings ?? [], quarterHourBucket());
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .upsert(snapshot, { onConflict: "household_id,snapshot_date" })
    .select()
    .single();
  if (error) throw error;
  return data;
};
