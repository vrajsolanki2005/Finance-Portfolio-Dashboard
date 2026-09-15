import YahooFinance from "yahoo-finance2";
import { getCache, setCache } from "./cache.service.js";
const yahooFinance = new YahooFinance();

export async function getCurrentPrice(symbol: string): Promise<number | null> {
  try {
    const quote = await yahooFinance.quote(symbol);

    if (typeof quote.regularMarketPrice !== "number") {
      return null;
    }
    return quote.regularMarketPrice;
  } catch (error) {
    console.error(`Yahoo Finance error for ${symbol}:`, error);
    return null;
  }
}

export async function getCurrentPrices(
  symbols: string[],
): Promise<Record<string, number | null>> {
  const uniqueSymbols = [...new Set(symbols)];

  const prices: Record<string, number | null> = {};

  // Default every symbol to null.
  for (const symbol of uniqueSymbols) {
    prices[symbol] = null;
  }

  if (uniqueSymbols.length === 0) {
    return prices;
  }

  const cacheKey = `yahoo-prices:${uniqueSymbols.sort().join(",")}`;
  const cached = getCache<Record<string, number | null>>(cacheKey);

  if (cached) {
    console.log("Returning cached Yahoo prices");
    return cached;
  }

  console.log("Fetching Yahoo prices:", uniqueSymbols);

  try {
    const quotes = await yahooFinance.quote(uniqueSymbols);

    for (const quote of quotes) {
      if (typeof quote.regularMarketPrice === "number") {
        prices[quote.symbol] = quote.regularMarketPrice;
      }
    }
  } catch (error) {
    console.error("Yahoo batch request failed:", error);
  }

  setCache(cacheKey, prices, 15 * 1000);
  return prices;
}
