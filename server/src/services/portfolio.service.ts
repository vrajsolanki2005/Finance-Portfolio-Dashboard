import { readPortfolioExcel } from "./excel.service.js";
import {
  Holding,
  PortfolioSummary,
  SectorSummary,
} from "../types/portfolio.js";
import { getCurrentPrices } from "./yahoo.service.js";
import { getGoogleFinanceData } from "./google-finance.service.js";

import { getGoogleFinanceSymbol } from "./google-symbol.service.js";
import { getYahooSymbol } from "./symbol.service.js";

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
  const rows = readPortfolioExcel();

  const holdings: Holding[] = [];

  let currentSector = "Other";

  rows.forEach((row, index) => {
    const particulars = cleanText(
      getRowValue(row, ["Particulars", "Company", "Name", "__EMPTY_1"]),
    );

    if (!particulars || particulars.toLowerCase() === "particulars") {
      return;
    }

    const purchasePrice = toNumber(
      getRowValue(row, [
        "Purchase Price",
        "PurchasePrice",
        "Price",
        "__EMPTY_2",
      ]),
    );
    const quantity = toNumber(
      getRowValue(row, ["Qty", "Quantity", "__EMPTY_3"]),
    );

    if (
      particulars.toLowerCase().includes("sector") &&
      purchasePrice <= 0 &&
      quantity <= 0
    ) {
      currentSector = particulars.replace(/sector/gi, "").trim() || particulars;
      return;
    }

    if (purchasePrice <= 0 || quantity <= 0) {
      return;
    }

    const investment = purchasePrice * quantity;

    const holding: Holding = {
      id: index + 1,
      particulars,
      sector: currentSector,
      purchasePrice,
      quantity,
      investment,
      portfolioPercentage: 0,
      exchangeCode: cleanText(
        getRowValue(row, ["NSE/BSE", "Exchange", "Symbol", "__EMPTY_6"]),
      ),
      cmp: toNumber(getRowValue(row, ["CMP", "Price", "__EMPTY_7"])) || null,
      presentValue:
        toNumber(
          getRowValue(row, ["Present value", "PresentValue", "__EMPTY_8"]),
        ) || null,
      gainLoss:
        toNumber(getRowValue(row, ["Gain/Loss", "GainLoss", "__EMPTY_9"])) ||
        null,
      gainLossPercentage: null,
      peRatio:
        toNumber(getRowValue(row, ["P/E (TTM)", "PE", "__EMPTY_12"])) || null,
      latestEarnings:
        toNumber(
          getRowValue(row, ["Latest Earnings", "LatestEarnings", "__EMPTY_13"]),
        ) || null,
    };

    holdings.push(holding);
  });

  const totalInvestment = holdings.reduce(
    (total, holding) => total + holding.investment,
    0,
  );

  holdings.forEach((holding) => {
    holding.portfolioPercentage =
      totalInvestment > 0 ? (holding.investment / totalInvestment) * 100 : 0;
  });

  const yahooSymbols = holdings
    .map((holding) => getYahooSymbol(holding.exchangeCode))
    .filter((symbol): symbol is string => symbol !== null);

  const prices = await getCurrentPrices(yahooSymbols);

  holdings.forEach((holding) => {
    const yahooSymbol = getYahooSymbol(holding.exchangeCode);

    if (!yahooSymbol) {
      return;
    }

    const cmp = prices[yahooSymbol];

    if (typeof cmp !== "number") {
      return;
    }

    holding.cmp = cmp;
    holding.presentValue = cmp * holding.quantity;
    holding.gainLoss = holding.presentValue - holding.investment;
    holding.gainLossPercentage =
      holding.investment > 0
        ? (holding.gainLoss / holding.investment) * 100
        : 0;
  });

  const fundamentalResults = await Promise.all(
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
    if (!result.data) continue;

    const holding = holdings.find((item) => item.id === result.holdingId);

    if (!holding) continue;

    holding.peRatio = result.data.peRatio;

    holding.latestEarnings = result.data.latestEarnings;
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
