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
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [search, setSearch] = useState("");
  
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
        setLastUpdated(new Date());
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

        <p className="mb-2 text-gray-600">Real-time portfolio performance</p>

        {lastUpdated && (
          <p className="mb-6 text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {" • "}Auto-refreshes every 15 seconds
          </p>
        )}
        {summary && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Total Investment</p>

              <p className="mt-2 text-2xl font-bold">
                ₹
                {summary.totalInvestment.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Present Value</p>

              <p className="mt-2 text-2xl font-bold">
                ₹
                {summary.totalPresentValue.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Total Gain / Loss</p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.totalGainLoss >= 0 ? "+" : ""}₹
                {summary.totalGainLoss.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Overall Return</p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  summary.totalGainLossPercentage >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {summary.totalGainLossPercentage >= 0 ? "+" : ""}
                {summary.totalGainLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
        <div className="space-y-6">
          {sectors.map((sector) => (
            <section
              key={sector.sector}
              className="overflow-hidden rounded-xl bg-white shadow"
            >
              <div className="border-b bg-gray-50 p-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-xl font-bold">{sector.sector}</h2>

                    <p className="text-sm text-gray-500">
                      {sector.holdings.length} holdings
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Investment</p>

                      <p className="font-semibold">
                        ₹{sector.totalInvestment.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Present Value</p>

                      <p className="font-semibold">
                        ₹{sector.totalPresentValue.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Gain / Loss</p>

                      <p
                        className={
                          sector.totalGainLoss >= 0
                            ? "font-semibold text-green-600"
                            : "font-semibold text-red-600"
                        }
                      >
                        {sector.totalGainLoss >= 0 ? "+" : ""}₹
                        {sector.totalGainLoss.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead className="border-b bg-white">
                    <tr>
                      <th className="p-4">Particulars</th>
                      <th className="p-4">Purchase Price</th>
                      <th className="p-4">Qty</th>
                      <th className="p-4">Investment</th>
                      <th className="p-4">Portfolio %</th>
                      <th className="p-4">NSE/BSE</th>
                      <th className="p-4">CMP</th>
                      <th className="p-4">Present Value</th>
                      <th className="p-4">Gain/Loss</th>
                      <th className="p-4">P/E Ratio</th>
                      <th className="p-4">Latest Earnings</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sector.holdings.map((holding) => (
                      <tr
                        key={holding.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="p-4 font-medium">
                          {holding.particulars}
                        </td>

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

                        <td className="p-4 font-mono text-xs">
                          {holding.exchangeCode}
                        </td>

                        <td className="p-4 font-medium">
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
                          className={`p-4 font-semibold ${
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
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
