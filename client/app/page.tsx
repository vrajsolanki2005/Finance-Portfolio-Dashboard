"use client";

import { useEffect, useState } from "react";

interface Holding {
  id: number;
  particulars: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  exchangeCode: string;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
}

interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
}

interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdings: Holding[];
}

export default function Home() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [summary, setSummary] =
  useState<PortfolioSummary | null>(null);

const [sectors, setSectors] =
  useState<SectorSummary[]>([]);
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const response = await fetch("http://localhost:5000/api/portfolio");

        if (!response.ok) {
          throw new Error("Failed to fetch portfolio");
        }

        const result = await response.json();

        setHoldings(result.data);
        setSummary(result.summary);
        setSectors(result.sectors);
        setError("");
      } catch (error) {
        console.error(error);
        setError("Unable to load portfolio");
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();

    const interval = setInterval(loadPortfolio, 15 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading portfolio...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold">Portfolio Dashboard</h1>

        <p className="mb-8 text-gray-600">Real-time portfolio performance</p>

        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4">Particulars</th>
                <th className="p-4">Sector</th>
                <th className="p-4">Purchase Price</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Investment</th>
                <th className="p-4">Portfolio %</th>
                <th className="p-4">Exchange</th>
                <th className="p-4">CMP</th>
                <th className="p-4">Present Value</th>
                <th className="p-4">Gain/Loss</th>
                <th className="p-4">P/E Ratio</th>
                <th className="p-4">Latest Earnings</th>
              </tr>
            </thead>

            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.id} className="border-b">
                  <td className="p-4 font-medium">{holding.particulars}</td>

                  <td className="p-4">{holding.sector}</td>

                  <td className="p-4">
                    ₹{holding.purchasePrice.toLocaleString("en-IN")}
                  </td>

                  <td className="p-4">{holding.quantity}</td>

                  <td className="p-4">
                    ₹{holding.investment.toLocaleString("en-IN")}
                  </td>

                  <td className="p-4">
                    {holding.portfolioPercentage.toFixed(2)}%
                  </td>

                  <td className="p-4">{holding.exchangeCode}</td>

                  <td className="p-4">
                    {holding.cmp !== null
                      ? `₹${holding.cmp.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}`
                      : "—"}
                  </td>

                  <td className="p-4">
                    {holding.presentValue !== null
                      ? `₹${holding.presentValue.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}`
                      : "—"}
                  </td>

                  <td
                    className={`p-4 font-medium ${
                      holding.gainLoss !== null
                        ? holding.gainLoss >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        : ""
                    }`}
                  >
                    {holding.gainLoss !== null
                      ? `${holding.gainLoss >= 0 ? "+" : ""}₹${holding.gainLoss.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          },
                        )}`
                      : "—"}
                  </td>
                  <td className="p-4">
                    {holding.peRatio !== null
                      ? holding.peRatio.toFixed(2)
                      : "—"}
                  </td>

                  <td className="p-4">
                    {holding.latestEarnings !== null
                      ? `₹${holding.latestEarnings.toFixed(2)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
