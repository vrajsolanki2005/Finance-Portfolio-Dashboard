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

  const cacheKey = `yahoo-prices:${uniqueSymbols.sort().join(",")}`;

  const cached = getCache<Record<string, number | null>>(cacheKey);

  if (cached) {
    console.log("Returning cached Yahoo prices");

    return cached;
  }

  console.log("Fetching fresh prices from Yahoo Finance");

  try {
    const quotes = await yahooFinance.quote(uniqueSymbols);

    const prices: Record<string, number | null> = {};

    for (const symbol of uniqueSymbols) {
      prices[symbol] = null;
    }

    for (const quote of quotes) {
      prices[quote.symbol] =
        typeof quote.regularMarketPrice === "number"
          ? quote.regularMarketPrice
          : null;
    }

    setCache(cacheKey, prices, 15 * 1000);

    return prices;
  } catch (error) {
    console.error("Yahoo Finance batch error:", error);

    const prices: Record<string, number | null> = {};

    for (const symbol of uniqueSymbols) {
      prices[symbol] = null;
    }

    return prices;
  }
}
