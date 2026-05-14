import type { AssetType, ProviderType, TransactionType } from "@/lib/types";

export interface ParsedCsvRow {
  rowNumber: number;
  raw: Record<string, string>;
  accountName: string;
  symbol?: string;
  isin?: string;
  assetName?: string;
  quantity?: number;
  amount?: number;
  price?: number;
  transactionDate?: string;
  assetType?: AssetType;
  transactionType?: TransactionType;
  currency?: string;
}

export interface ImportValidationIssue {
  rowNumber: number;
  severity: "error" | "warning";
  message: string;
}

export interface ImportPreview {
  rows: ParsedCsvRow[];
  issues: ImportValidationIssue[];
  totalRows: number;
  validRows: number;
}

export interface ColumnMapping {
  accountName: string[];
  symbol: string[];
  isin: string[];
  assetName: string[];
  quantity: string[];
  amount: string[];
  price: string[];
  transactionDate: string[];
  transactionType: string[];
  currency: string[];
}

export interface ParserOptions {
  providerHint?: ProviderType;
  customMapping?: Partial<ColumnMapping>;
  defaultCurrency?: string;
}
