import type { AssetType, ProviderType } from "@/lib/types";

export interface BrokerHolding {
  symbol: string;
  isin?: string;
  asset_name: string;
  asset_type: AssetType;
  exchange?: string;
  quantity: number;
  average_cost: number;
  last_price: number;
  currency: string;
  as_of: string;
}

export interface BrokerTransaction {
  symbol?: string;
  isin?: string;
  asset_name?: string;
  transaction_type: string;
  quantity?: number;
  price?: number;
  amount: number;
  currency: string;
  transaction_date: string;
}

export interface BrokerSyncResult {
  source: ProviderType;
  holdings: BrokerHolding[];
  positions?: BrokerHolding[];
  mutual_fund_holdings?: BrokerHolding[];
  transactions: BrokerTransaction[];
  fetched_at: string;
  raw_payload: Record<string, unknown>;
}

export interface BrokerConnector {
  provider: ProviderType;
  syncPortfolio: (connection: { accessToken: string; accountExternalId: string }) => Promise<BrokerSyncResult>;
}
