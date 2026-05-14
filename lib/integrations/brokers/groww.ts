import type { BrokerConnector } from "@/lib/integrations/brokers/types";

export const growwConnector: BrokerConnector = {
  provider: "groww",
  async syncPortfolio(connection) {
    void connection;
    // TODO: Replace with real Groww partner API once production credentials are ready.
    return {
      source: "groww",
      fetched_at: new Date().toISOString(),
      holdings: [
        {
          symbol: "SBI_BLUE_DIRECT",
          isin: "INF200K01WS6",
          asset_name: "SBI Bluechip Fund Direct Growth",
          asset_type: "mutual_fund",
          quantity: 223.81,
          average_cost: 68.2,
          last_price: 78.6,
          currency: "INR",
          as_of: new Date().toISOString()
        },
        {
          symbol: "PPFAS_FLEXI",
          isin: "INF879O01027",
          asset_name: "Parag Parikh Flexi Cap Fund Direct Growth",
          asset_type: "mutual_fund",
          quantity: 310.55,
          average_cost: 49.8,
          last_price: 62.15,
          currency: "INR",
          as_of: new Date().toISOString()
        }
      ],
      positions: [],
      mutual_fund_holdings: [
        {
          symbol: "SBI_BLUE_DIRECT",
          isin: "INF200K01WS6",
          asset_name: "SBI Bluechip Fund Direct Growth",
          asset_type: "mutual_fund",
          quantity: 223.81,
          average_cost: 68.2,
          last_price: 78.6,
          currency: "INR",
          as_of: new Date().toISOString()
        },
        {
          symbol: "PPFAS_FLEXI",
          isin: "INF879O01027",
          asset_name: "Parag Parikh Flexi Cap Fund Direct Growth",
          asset_type: "mutual_fund",
          quantity: 310.55,
          average_cost: 49.8,
          last_price: 62.15,
          currency: "INR",
          as_of: new Date().toISOString()
        }
      ],
      transactions: [],
      raw_payload: {
        note: "mocked"
      }
    };
  }
};
