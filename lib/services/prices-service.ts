import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const upsertLatestPrices = async (
  prices: Array<{
    symbol: string;
    isin?: string;
    asset_name: string;
    exchange?: string;
    currency: string;
    ltp: number;
    source: string;
  }>
) => {
  const admin = createSupabaseAdminClient();
  const payload = prices.map((item) => ({
    symbol: item.symbol,
    isin: item.isin ?? null,
    asset_name: item.asset_name,
    exchange: item.exchange ?? null,
    currency: item.currency,
    ltp: item.ltp,
    close_price: item.ltp,
    open_price: item.ltp,
    high_price: item.ltp,
    low_price: item.ltp,
    as_of: new Date().toISOString(),
    source: item.source
  }));
  if (!payload.length) return;
  const { error } = await admin.from("prices").upsert(payload, { onConflict: "symbol,exchange,as_of" });
  if (error) throw error;
};

export const getLastKnownPrice = async (symbol: string, exchange?: string) => {
  const admin = createSupabaseAdminClient();
  let query = admin.from("prices").select("*").eq("symbol", symbol).order("as_of", { ascending: false }).limit(1);
  if (exchange) query = query.eq("exchange", exchange);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
};
