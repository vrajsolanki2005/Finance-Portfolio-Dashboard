"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SectorData {
  sector: string;
  totalInvestment: number;
}

interface Props {
  sectors: SectorData[];
}

export default function PortfolioAllocationChart({ sectors }: Props) {
  const data = sectors.map((sector) => ({
    name: sector.sector,
    value: sector.totalInvestment,
  }));

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-4 text-lg font-bold">Portfolio Allocation</h2>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
                <Cell key={index} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
