import { describe, expect, it } from "vitest";
import { buildSnapshotFromHoldings } from "@/lib/domain/calculations";

describe("buildSnapshotFromHoldings", () => {
  it("computes snapshot totals and buckets", () => {
    const snapshot = buildSnapshotFromHoldings(
      "household-1",
      null,
      [
        {
          id: "h1",
          household_id: "household-1",
          account_id: "a1",
          user_id: "u1",
          symbol: "RELIANCE",
          isin: null,
          asset_name: "Reliance",
          asset_type: "equity",
          exchange: "NSE",
          quantity: 10,
          average_cost: 2000,
          last_price: 2500,
          market_value: 25000,
          unrealized_pnl: 5000,
          currency: "INR",
          as_of: "2025-01-01T00:00:00.000Z",
          source: "zerodha",
          raw_payload_json: {},
          created_at: "",
          updated_at: ""
        },
        {
          id: "h2",
          household_id: "household-1",
          account_id: "a2",
          user_id: "u1",
          symbol: "AAPL",
          isin: null,
          asset_name: "Apple",
          asset_type: "equity",
          exchange: "NASDAQ",
          quantity: 5,
          average_cost: 170,
          last_price: 190,
          market_value: 950,
          unrealized_pnl: 100,
          currency: "USD",
          as_of: "2025-01-01T00:00:00.000Z",
          source: "indmoney_csv",
          raw_payload_json: {},
          created_at: "",
          updated_at: ""
        }
      ],
      "2025-01-01T00:00:00.000Z"
    );

    expect(snapshot.total_value).toBeGreaterThan(25000);
    expect(snapshot.total_gain_loss).toBeGreaterThan(0);
    expect(snapshot.equity_value).toBe(snapshot.total_value);
  });
});
