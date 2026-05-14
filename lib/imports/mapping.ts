import type { ColumnMapping } from "@/lib/imports/types";

export const baseColumnMapping: ColumnMapping = {
  accountName: ["account", "account_name", "portfolio", "broker_account"],
  symbol: ["symbol", "ticker", "security_symbol"],
  isin: ["isin", "security_isin"],
  assetName: ["asset_name", "security_name", "instrument", "name"],
  quantity: ["quantity", "qty", "units", "holding_qty"],
  amount: ["amount", "value", "market_value", "transaction_amount"],
  price: ["price", "avg_price", "purchase_price", "ltp"],
  transactionDate: ["date", "transaction_date", "trade_date", "as_of"],
  transactionType: ["type", "transaction_type", "side", "entry_type"],
  currency: ["currency", "ccy"]
};

export const providerMappings: Record<string, Partial<ColumnMapping>> = {
  indmoney_csv: {
    accountName: ["account_name", "broker_name", "account"],
    assetName: ["asset_name", "scheme_name", "security_name"],
    transactionDate: ["transaction_date", "date", "trade_date"]
  },
  zerodha: {
    symbol: ["tradingsymbol", "symbol"],
    transactionDate: ["date", "trade_date"],
    amount: ["net_amount", "amount"]
  },
  groww: {
    assetName: ["fund_name", "asset_name"],
    quantity: ["units", "quantity"],
    amount: ["current_value", "amount"]
  }
};

export const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const findColumn = (headers: string[], aliases: string[]) => {
  const normalizedSet = new Map(headers.map((h) => [normalizeHeader(h), h]));
  for (const alias of aliases) {
    const match = normalizedSet.get(normalizeHeader(alias));
    if (match) return match;
  }
  return undefined;
};
