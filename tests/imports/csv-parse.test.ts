import { describe, expect, it } from "vitest";
import { parsePortfolioCsv } from "@/lib/imports/csv";

describe("parsePortfolioCsv", () => {
  it("parses rows and validates common fields", () => {
    const csv = `account_name,symbol,asset_name,quantity,amount,transaction_date,transaction_type,currency
Main,RELIANCE,Reliance Industries,10,25000,2025-03-02,buy,INR
Main,INFY,Infosys,abc,15000,invalid,buy,EUR`;

    const result = parsePortfolioCsv(csv, { providerHint: "indmoney_csv" });
    expect(result.totalRows).toBe(2);
    expect(result.rows[0].symbol).toBe("RELIANCE");
    expect(result.issues.some((issue) => issue.message.includes("Invalid quantity"))).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes("Invalid date format"))).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes("Unsupported currency"))).toBe(true);
  });

  it("detects duplicate transactions by row signature", () => {
    const csv = `account,symbol,amount,date
Main,RELIANCE,2500,2025-03-01
Main,RELIANCE,2500,2025-03-01`;
    const result = parsePortfolioCsv(csv);
    expect(result.issues.some((issue) => issue.message.includes("Potential duplicate transaction"))).toBe(true);
  });
});
