import Papa from "papaparse";
import { parseISO, isValid } from "date-fns";
import { baseColumnMapping, findColumn, providerMappings } from "@/lib/imports/mapping";
import type { ColumnMapping, ImportPreview, ImportValidationIssue, ParsedCsvRow, ParserOptions } from "@/lib/imports/types";
import { safeNumber } from "@/lib/utils";

const supportedCurrencies = new Set(["INR", "USD"]);

const normalizeType = (value?: string) => {
  if (!value) return "buy";
  const normalized = value.toLowerCase();
  if (normalized.includes("sell")) return "sell";
  if (normalized.includes("dividend")) return "dividend";
  if (normalized.includes("interest")) return "interest";
  if (normalized.includes("fee") || normalized.includes("charge")) return "fee";
  if (normalized.includes("income")) return "income";
  if (normalized.includes("expense")) return "expense";
  return "buy";
};

const mergeMapping = (options: ParserOptions): ColumnMapping => {
  const providerMap = options.providerHint ? providerMappings[options.providerHint] : undefined;
  const custom = options.customMapping ?? {};
  return {
    accountName: [...(custom.accountName ?? providerMap?.accountName ?? baseColumnMapping.accountName)],
    symbol: [...(custom.symbol ?? providerMap?.symbol ?? baseColumnMapping.symbol)],
    isin: [...(custom.isin ?? providerMap?.isin ?? baseColumnMapping.isin)],
    assetName: [...(custom.assetName ?? providerMap?.assetName ?? baseColumnMapping.assetName)],
    quantity: [...(custom.quantity ?? providerMap?.quantity ?? baseColumnMapping.quantity)],
    amount: [...(custom.amount ?? providerMap?.amount ?? baseColumnMapping.amount)],
    price: [...(custom.price ?? providerMap?.price ?? baseColumnMapping.price)],
    transactionDate: [...(custom.transactionDate ?? providerMap?.transactionDate ?? baseColumnMapping.transactionDate)],
    transactionType: [...(custom.transactionType ?? providerMap?.transactionType ?? baseColumnMapping.transactionType)],
    currency: [...(custom.currency ?? providerMap?.currency ?? baseColumnMapping.currency)]
  };
};

const collectIssues = (rows: ParsedCsvRow[]): ImportValidationIssue[] => {
  const issues: ImportValidationIssue[] = [];
  const signatures = new Set<string>();
  rows.forEach((row) => {
    if (!row.transactionDate) {
      issues.push({ rowNumber: row.rowNumber, severity: "error", message: "Missing transaction date" });
    } else {
      const parsed = parseISO(row.transactionDate);
      if (!isValid(parsed)) {
        issues.push({ rowNumber: row.rowNumber, severity: "error", message: "Invalid date format" });
      }
    }

    if (row.quantity !== undefined && Number.isNaN(row.quantity)) {
      issues.push({ rowNumber: row.rowNumber, severity: "error", message: "Invalid quantity" });
    }
    if (row.amount !== undefined && Number.isNaN(row.amount)) {
      issues.push({ rowNumber: row.rowNumber, severity: "error", message: "Invalid amount" });
    }
    if (row.currency && !supportedCurrencies.has(row.currency)) {
      issues.push({ rowNumber: row.rowNumber, severity: "warning", message: "Unsupported currency, conversion fallback will apply" });
    }

    const signature = [row.accountName, row.symbol, row.transactionDate, row.amount].join("|");
    if (signatures.has(signature)) {
      issues.push({ rowNumber: row.rowNumber, severity: "warning", message: "Potential duplicate transaction" });
    } else {
      signatures.add(signature);
    }
  });
  return issues;
};

export const parsePortfolioCsv = (csvContent: string, options: ParserOptions = {}): ImportPreview => {
  const parseResult = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  const mapping = mergeMapping(options);
  const headers = parseResult.meta.fields ?? [];
  if (!headers.length) {
    return {
      rows: [],
      issues: [{ rowNumber: 0, severity: "error", message: "Missing headers in CSV file" }],
      totalRows: 0,
      validRows: 0
    };
  }

  const accountHeader = findColumn(headers, mapping.accountName);
  const dateHeader = findColumn(headers, mapping.transactionDate);
  if (!accountHeader || !dateHeader) {
    return {
      rows: [],
      issues: [{ rowNumber: 0, severity: "error", message: "Required headers account and transaction date are missing" }],
      totalRows: parseResult.data.length,
      validRows: 0
    };
  }

  const symbolHeader = findColumn(headers, mapping.symbol);
  const isinHeader = findColumn(headers, mapping.isin);
  const assetNameHeader = findColumn(headers, mapping.assetName);
  const quantityHeader = findColumn(headers, mapping.quantity);
  const amountHeader = findColumn(headers, mapping.amount);
  const priceHeader = findColumn(headers, mapping.price);
  const typeHeader = findColumn(headers, mapping.transactionType);
  const currencyHeader = findColumn(headers, mapping.currency);

  const rows: ParsedCsvRow[] = parseResult.data.map((entry, index) => {
    const currency = (currencyHeader ? entry[currencyHeader] : options.defaultCurrency ?? "INR")?.toUpperCase();
    return {
      rowNumber: index + 1,
      raw: entry,
      accountName: entry[accountHeader],
      symbol: symbolHeader ? entry[symbolHeader] : undefined,
      isin: isinHeader ? entry[isinHeader] : undefined,
      assetName: assetNameHeader ? entry[assetNameHeader] : undefined,
      quantity: quantityHeader ? safeNumber(entry[quantityHeader], Number.NaN) : undefined,
      amount: amountHeader ? safeNumber(entry[amountHeader], Number.NaN) : undefined,
      price: priceHeader ? safeNumber(entry[priceHeader], Number.NaN) : undefined,
      transactionDate: entry[dateHeader],
      transactionType: normalizeType(typeHeader ? entry[typeHeader] : undefined),
      currency
    };
  });

  const issues = collectIssues(rows);
  const rowErrors = new Set(issues.filter((i) => i.severity === "error").map((issue) => issue.rowNumber));

  return {
    rows,
    issues,
    totalRows: rows.length,
    validRows: rows.length - rowErrors.size
  };
};
