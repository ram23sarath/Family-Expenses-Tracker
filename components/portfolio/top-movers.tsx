import type { Holding } from "@/lib/types";
import { currencyFormatter } from "@/lib/utils";

export const TopMovers = ({ holdings }: { holdings: Holding[] }) => {
  const formatter = currencyFormatter("INR");
  const sorted = [...holdings].sort((a, b) => Number(b.unrealized_pnl) - Number(a.unrealized_pnl));
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card">
        <p className="text-sm font-semibold text-slate-500">Top Gainers</p>
        <div className="mt-3 space-y-2">
          {gainers.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>{item.asset_name}</span>
              <span className="font-medium text-emerald-600">{formatter.format(Number(item.unrealized_pnl))}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <p className="text-sm font-semibold text-slate-500">Top Losers</p>
        <div className="mt-3 space-y-2">
          {losers.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>{item.asset_name}</span>
              <span className="font-medium text-red-600">{formatter.format(Number(item.unrealized_pnl))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
