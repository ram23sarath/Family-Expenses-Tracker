import type { BrokerConnector } from "@/lib/integrations/brokers/types";

export const zerodhaConnector: BrokerConnector = {
  provider: "zerodha",
  async syncPortfolio(connection) {
    void connection;
    // TODO: Replace mocked payload with real KiteConnect SDK calls.
    // Keep all credentials and request signing in server runtime only.
    return {
      source: "zerodha",
      fetched_at: new Date().toISOString(),
      holdings: [
        {
          symbol: "RELIANCE",
          isin: "INE002A01018",
          asset_name: "Reliance Industries Ltd",
          asset_type: "equity",
          exchange: "NSE",
          quantity: 25,
          average_cost: 2450,
          last_price: 2864,
          currency: "INR",
          as_of: new Date().toISOString()
        },
        {
          symbol: "INFY",
          isin: "INE009A01021",
          asset_name: "Infosys Ltd",
          asset_type: "equity",
          exchange: "NSE",
          quantity: 40,
          average_cost: 1460,
          last_price: 1542,
          currency: "INR",
          as_of: new Date().toISOString()
        }
      ],
      positions: [
        {
          symbol: "NIFTY27JUNFUT",
          asset_name: "NIFTY Futures (Sample Position)",
          asset_type: "other",
          exchange: "NFO",
          quantity: 1,
          average_cost: 0,
          last_price: 0,
          currency: "INR",
          as_of: new Date().toISOString()
        }
      ],
      mutual_fund_holdings: [],
      transactions: [],
      raw_payload: {
        note: "mocked"
      }
    };
  }
};
