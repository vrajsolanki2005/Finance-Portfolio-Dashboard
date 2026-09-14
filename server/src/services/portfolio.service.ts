import { supabase } from "../config/supabase.js";
import { getYahooSymbol } from "./symbol.service.js";
import { getCurrentPrices } from "./yahoo.service.js";
import { getGoogleFinanceData } from "./google-finance.service.js";
import { getGoogleFinanceSymbol } from "./google-symbol.service.js";
import { resolveYahooSymbol } from "./yahoo-symbol.service.js";
import {
  Holding,
  PortfolioSummary,
  SectorSummary,
} from "../types/portfolio.js";

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/₹/g, "")
    .replace(/%/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function cleanText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getRowValue(row: Record<string, unknown>, aliases: string[]): unknown {
  const normalizedAliases = aliases.map(normalizeHeader);

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeHeader(key);

    if (
      normalizedAliases.includes(normalizedKey) ||
      normalizedAliases.some((alias) => normalizedKey.includes(alias))
    ) {
      return value;
    }
  }

  return undefined;
}

export async function getPortfolio(): Promise<Holding[]> {
  const { data, error } = await supabase
    .from("holdings")
    .select(
      `
      id,
      stock_name,
      purchase_price,
      quantity,
      exchange_code,
      sectors (
        id,
        name
      )
    `,
    )
    .order("id");

  if (error) {
    console.error("Supabase portfolio error:", error);

    throw new Error("Unable to load portfolio from database");
  }

  const holdings: Holding[] = (data ?? []).map((row: any) => {
    const investment = Number(row.purchase_price) * Number(row.quantity);

    return {
      id: Number(row.id),

      particulars: row.stock_name,

      sector: row.sectors?.name ?? "Other",

      purchasePrice: Number(row.purchase_price),

      quantity: Number(row.quantity),

      investment,

      portfolioPercentage: 0,

      exchangeCode: row.exchange_code,

      cmp: null,

      presentValue: null,

      gainLoss: null,

      gainLossPercentage: null,

      peRatio: null,

      latestEarnings: null,
    };
  });

  // Calculate portfolio allocation.
  const totalInvestment = holdings.reduce(
    (total, holding) => total + holding.investment,
    0,
  );

  holdings.forEach((holding) => {
    holding.portfolioPercentage =
      totalInvestment > 0 ? (holding.investment / totalInvestment) * 100 : 0;
  });

  const resolvedSymbols = await Promise.all(
    holdings.map(async (holding) => {
      const symbol = await resolveYahooSymbol(
        holding.particulars,
        holding.exchangeCode,
      );

      return {
        holding,
        symbol,
      };
    }),
  );

  const yahooSymbols = resolvedSymbols
    .map((item) => item.symbol)
    .filter((symbol): symbol is string => symbol !== null);

  const prices = await getCurrentPrices(yahooSymbols);

  for (const item of resolvedSymbols) {
    const { holding, symbol } = item;

    if (!symbol) {
      console.warn(`Yahoo symbol not found for ${holding.particulars}`);

      continue;
    }

    const cmp = prices[symbol];

    if (typeof cmp !== "number") {
      console.warn(`CMP unavailable for ${holding.particulars} (${symbol})`);

      continue;
    }

    holding.cmp = cmp;

    holding.presentValue = cmp * holding.quantity;

    holding.gainLoss = holding.presentValue - holding.investment;

    holding.gainLossPercentage =
      holding.investment > 0
        ? (holding.gainLoss / holding.investment) * 100
        : 0;
  }
  const fundamentalResults = await Promise.allSettled(
    holdings.map(async (holding) => {
      const googleSymbol = getGoogleFinanceSymbol(holding.exchangeCode);

      if (!googleSymbol) {
        return {
          holdingId: holding.id,
          data: null,
        };
      }

      const data = await getGoogleFinanceData(googleSymbol);

      return {
        holdingId: holding.id,
        data,
      };
    }),
  );

  for (const result of fundamentalResults) {
    // Promise was rejected
    if (result.status === "rejected") {
      console.error("Fundamental request failed:", result.reason);

      continue;
    }

    // Promise was fulfilled.
    // The actual returned object is inside result.value.
    const { holdingId, data } = result.value;

    if (!data) {
      continue;
    }

    const holding = holdings.find((item) => item.id === holdingId);

    if (!holding) {
      continue;
    }

    holding.peRatio = data.peRatio;

    holding.latestEarnings = data.latestEarnings;
  }

  return holdings;
}

export function calculatePortfolioSummary(
  holdings: Holding[],
): PortfolioSummary {
  const totalInvestment = holdings.reduce(
    (total, holding) => total + holding.investment,
    0,
  );

  const totalPresentValue = holdings.reduce(
    (total, holding) => total + (holding.presentValue ?? 0),
    0,
  );

  const totalGainLoss = totalPresentValue - totalInvestment;

  const totalGainLossPercentage =
    totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  return {
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    totalGainLossPercentage,
  };
}

export function calculateSectorSummaries(holdings: Holding[]): SectorSummary[] {
  const sectorMap = new Map<string, Holding[]>();

  for (const holding of holdings) {
    const existing = sectorMap.get(holding.sector);

    if (existing) {
      existing.push(holding);
    } else {
      sectorMap.set(holding.sector, [holding]);
    }
  }

  return Array.from(sectorMap.entries()).map(([sector, sectorHoldings]) => {
    const totalInvestment = sectorHoldings.reduce(
      (total, holding) => total + holding.investment,
      0,
    );

    const totalPresentValue = sectorHoldings.reduce(
      (total, holding) => total + (holding.presentValue ?? 0),
      0,
    );

    const totalGainLoss = totalPresentValue - totalInvestment;

    const totalGainLossPercentage =
      totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    return {
      sector,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage,
      holdings: sectorHoldings,
    };
  });
}
