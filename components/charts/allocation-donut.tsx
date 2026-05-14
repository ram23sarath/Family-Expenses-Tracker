"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AllocationPoint } from "@/lib/types";
import { currencyFormatter } from "@/lib/utils";

const palette = ["#2563eb", "#7c3aed", "#16a34a", "#0f766e", "#b45309", "#dc2626"];

export const AllocationDonutChart = ({ data }: { data: AllocationPoint[] }) => {
  const formatter = currencyFormatter("INR");
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} innerRadius={64} outerRadius={96} dataKey="value" nameKey="name" paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatter.format(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
