"use client";

import { useEffect, useState } from "react";
import PortfolioAllocationChart from "./components/PortfolioAllocationChart";
import PortfolioPerformanceChart from "./components/PortfolioPerformanceChart";
import StatCard from "./components/StatCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

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
  gainLossPercentage: number | null;
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
        const response = await fetch(`${API_URL}/api/portfolio`);
        if (!response.ok) throw new Error("Failed to fetch portfolio");
        const result = await response.json();

        setHoldings(result.data);
        setSummary(result.summary);
        setSectors(result.sectors);
        setLastUpdated(new Date());
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to load portfolio");
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
    const interval = setInterval(loadPortfolio, 15 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-semibold tracking-wide text-slate-200">
            Syncing market rates...
          </p>
          <p className="mt-1 text-xs text-slate-500">Connecting to real-time feed</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4">
        <div className="max-w-md rounded-2xl border border-rose-500/20 bg-slate-900/80 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            !
          </div>
          <h1 className="text-lg font-bold text-slate-100">{error}</h1>
          <p className="mt-2 text-sm text-slate-400">
            The market feed could not be reached. Ensure your backend server is online.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  const filteredSectors = sectors
    .map((sector) => ({
      ...sector,
      holdings: sector.holdings.filter((holding) =>
        holding.particulars.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((sector) => sector.holdings.length > 0);

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-200 px-4 py-8 md:px-10">
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Live Portfolio Monitor
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated real-time valuation & risk distribution
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-400 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {lastUpdated ? `Sync: ${lastUpdated.toLocaleTimeString()}` : "Connecting..."}
          </div>
        </div>

        {/* Top KPI Metrics */}
        {summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Invested"
              value={formatCurrency(summary.totalInvestment)}
              subtitle="Aggregated cost basis"
            />
            <StatCard
              title="Current Value"
              value={formatCurrency(summary.totalPresentValue)}
              subtitle="Liquid valuation"
            />
            <StatCard
              title="Unrealized P&L"
              value={formatCurrency(summary.totalGainLoss)}
              subtitle={`${summary.totalGainLossPercentage >= 0 ? "+" : ""}${summary.totalGainLossPercentage.toFixed(2)}% net movement`}
              positive={summary.totalGainLoss >= 0}
              negative={summary.totalGainLoss < 0}
            />
            <StatCard
              title="Active Positions"
              value={holdings.length.toString()}
              subtitle="Open equity assets"
            />
          </div>
        )}

        {/* Visual Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PortfolioAllocationChart sectors={sectors} />
          {summary && (
            <PortfolioPerformanceChart
              investment={summary.totalInvestment}
              presentValue={summary.totalPresentValue}
            />
          )}
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets by symbol or name..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 pl-10 text-sm text-slate-200 placeholder-slate-500 shadow-inner outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <svg
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Sector Grouped Tables */}
        {filteredSectors.map((sector) => (
          <section
            key={sector.sector}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg"
          >
            {/* Sector Header Strip */}
            <div className="border-b border-slate-800/80 bg-slate-900/90 px-6 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    {sector.sector}
                  </h2>
                  <p className="text-xs font-medium text-slate-400">
                    {sector.holdings.length} Positions
                  </p>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="block text-slate-500 uppercase tracking-wider">Invested</span>
                    <span className="font-semibold text-slate-200">
                      ₹{sector.totalInvestment.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase tracking-wider">Present Value</span>
                    <span className="font-semibold text-slate-200">
                      ₹{sector.totalPresentValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase tracking-wider">Net Return</span>
                    <span
                      className={`font-semibold ${
                        sector.totalGainLoss >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {sector.totalGainLoss >= 0 ? "+" : ""}₹{sector.totalGainLoss.toLocaleString("en-IN")} (
                      {sector.totalGainLossPercentage >= 0 ? "+" : ""}
                      {sector.totalGainLossPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-950/40 text-slate-400">
                    <th className="p-4 font-semibold uppercase tracking-wider">Asset</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Exchange</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">Avg Price</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">Qty</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">Invested</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">Weight</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">CMP</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">Valuation</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">Total P&L</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">P/E</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">EPS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/40 font-mono text-slate-300">
                  {sector.holdings.map((holding) => {
                    const isProfit = (holding.gainLoss ?? 0) >= 0;
                    return (
                      <tr
                        key={holding.id}
                        className="transition-colors hover:bg-slate-800/30"
                      >
                        <td className="p-4 font-sans font-medium text-white">
                          {holding.particulars}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          <span className="rounded bg-slate-800 px-1.5 py-0.5">
                            {holding.exchangeCode}
                          </span>
                        </td>
                        <td className="p-4 text-right">₹{holding.purchasePrice.toLocaleString("en-IN")}</td>
                        <td className="p-4 text-right">{holding.quantity}</td>
                        <td className="p-4 text-right">₹{holding.investment.toLocaleString("en-IN")}</td>
                        <td className="p-4 text-right">{holding.portfolioPercentage.toFixed(2)}%</td>
                        <td className="p-4 text-right text-white">
                          {holding.cmp !== null ? `₹${holding.cmp.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="p-4 text-right text-white">
                          {holding.presentValue !== null
                            ? `₹${holding.presentValue.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="p-4 text-right">
                          {holding.gainLoss !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                                isProfit
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {isProfit ? "+" : ""}
                              {holding.gainLossPercentage?.toFixed(2)}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4 text-right">{holding.peRatio?.toFixed(1) ?? "—"}</td>
                        <td className="p-4 text-right">
                          {holding.latestEarnings !== null ? `₹${holding.latestEarnings.toFixed(2)}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}