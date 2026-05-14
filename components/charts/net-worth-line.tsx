"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currencyFormatter } from "@/lib/utils";

export const NetWorthLineChart = ({ data }: { data: Array<{ date: string; value: number }> }) => {
  const formatter = currencyFormatter("INR");
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" fontSize={12} />
          <YAxis fontSize={12} tickFormatter={(value) => formatter.format(value)} />
          <Tooltip formatter={(value: number) => formatter.format(value)} />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
