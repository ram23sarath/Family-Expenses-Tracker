import { describe, expect, it } from "vitest";
import { computePortfolioSummary } from "@/lib/domain/calculations";

describe("computePortfolioSummary", () => {
  it("calculates total value and gain/loss", () => {
    const summary = computePortfolioSummary([
      {
        id: "h1",
        household_id: "x",
        account_id: "a",
        user_id: "u",
        symbol: "RELIANCE",
        isin: null,
        asset_name: "Reliance",
        asset_type: "equity",
        exchange: "NSE",
        quantity: 10,
        average_cost: 2000,
        last_price: 2600,
        market_value: 26000,
        unrealized_pnl: 6000,
        currency: "INR",
        as_of: "",
        source: "zerodha",
        raw_payload_json: {},
        created_at: "",
        updated_at: ""
      }
    ]);
    expect(summary.totalValue).toBe(26000);
    expect(summary.investedValue).toBe(20000);
    expect(summary.gainLoss).toBe(6000);
  });
});
