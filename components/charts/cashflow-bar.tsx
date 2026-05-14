"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CashflowPoint } from "@/lib/types";
import { currencyFormatter } from "@/lib/utils";

export const CashflowBarChart = ({ data }: { data: CashflowPoint[] }) => {
  const formatter = currencyFormatter("INR");
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} tickFormatter={(value) => formatter.format(value)} />
          <Tooltip formatter={(value: number) => formatter.format(value)} />
          <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" fill="#dc2626" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
