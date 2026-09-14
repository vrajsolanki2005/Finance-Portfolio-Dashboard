"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  investment: number;
  presentValue: number;
}

export default function PortfolioPerformanceChart({
  investment,
  presentValue,
}: Props) {
  const data = [
    {
      name: "Portfolio",
      Investment: investment,
      "Present Value": presentValue,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
      <h2 className="text-base font-semibold text-slate-100">
        Capital vs. Current Value
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Total return valuation comparison
      </p>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={12}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.75rem",
                color: "#f8fafc",
                fontSize: "12px",
              }}
              formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
            />
            <Bar dataKey="Investment" fill="#6366f1" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Present Value" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
