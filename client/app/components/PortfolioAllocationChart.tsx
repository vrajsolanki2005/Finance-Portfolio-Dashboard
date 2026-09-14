"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = [
  "#38bdf8",
  "#818cf8",
  "#34d399",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
  "#2dd4bf",
];

interface Props {
  sectors: { sector: string; totalInvestment: number }[];
}

export default function PortfolioAllocationChart({ sectors }: Props) {
  const data = sectors.map((sector) => ({
    name: sector.sector,
    value: sector.totalInvestment,
  }));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
      <h2 className="text-base font-semibold text-slate-100">
        Portfolio Allocation
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Capital split across industry sectors
      </p>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              stroke="#0f172a"
              strokeWidth={3}
              paddingAngle={4}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.75rem",
                color: "#f8fafc",
                fontSize: "12px",
              }}
              formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
