import { describe, expect, it } from "vitest";
import { findColumn } from "@/lib/imports/mapping";

describe("mapping logic", () => {
  it("maps case-insensitive column aliases", () => {
    const headers = ["Transaction Date", "Ticker", "Amount"];
    expect(findColumn(headers, ["transaction_date", "date"])).toBe("Transaction Date");
    expect(findColumn(headers, ["symbol", "ticker"])).toBe("Ticker");
  });
});
