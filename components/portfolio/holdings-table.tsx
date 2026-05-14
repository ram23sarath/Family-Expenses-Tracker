"use client";

import { useMemo, useState } from "react";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import type { Holding } from "@/lib/types";
import { currencyFormatter } from "@/lib/utils";

export const HoldingsTable = ({ holdings }: { holdings: Holding[] }) => {
  const [sortBy, setSortBy] = useState<"market_value" | "unrealized_pnl">("market_value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const formatter = currencyFormatter("INR");
  const sorted = useMemo(() => {
    const list = [...holdings];
    list.sort((a, b) => {
      const aValue = Number(a[sortBy] ?? 0);
      const bValue = Number(b[sortBy] ?? 0);
      return sortDir === "desc" ? bValue - aValue : aValue - bValue;
    });
    return list;
  }, [holdings, sortBy, sortDir]);

  const changeSort = (field: "market_value" | "unrealized_pnl") => {
    if (sortBy === field) {
      setSortDir((dir) => (dir === "desc" ? "asc" : "desc"));
      return;
    }
    setSortBy(field);
    setSortDir("desc");
  };

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <THead>
            <Tr>
              <Th>Asset</Th>
              <Th>Type</Th>
              <Th className="text-right">Quantity</Th>
              <Th className="text-right">Avg Cost</Th>
              <Th className="text-right">LTP</Th>
              <Th className="cursor-pointer text-right" onClick={() => changeSort("market_value")}>
                Market Value {sortBy === "market_value" ? (sortDir === "desc" ? "↓" : "↑") : ""}
              </Th>
              <Th className="cursor-pointer text-right" onClick={() => changeSort("unrealized_pnl")}>
                PnL {sortBy === "unrealized_pnl" ? (sortDir === "desc" ? "↓" : "↑") : ""}
              </Th>
            </Tr>
          </THead>
          <TBody>
            {sorted.map((item) => (
              <Tr key={item.id}>
                <Td>
                  <p className="font-medium">{item.asset_name}</p>
                  <p className="text-xs text-slate-500">{item.symbol || item.isin || "-"}</p>
                </Td>
                <Td className="capitalize">{item.asset_type.replace("_", " ")}</Td>
                <Td className="text-right">{Number(item.quantity).toFixed(2)}</Td>
                <Td className="text-right">{formatter.format(Number(item.average_cost))}</Td>
                <Td className="text-right">{formatter.format(Number(item.last_price))}</Td>
                <Td className="text-right font-medium">{formatter.format(Number(item.market_value))}</Td>
                <Td className={`text-right font-medium ${Number(item.unrealized_pnl) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatter.format(Number(item.unrealized_pnl))}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
};
