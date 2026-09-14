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
    <div className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-4 text-lg font-bold">Portfolio Performance</h2>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip
              formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
            />

            <Bar dataKey="Investment" fill="#8884d8" />

            <Bar dataKey="Present Value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
