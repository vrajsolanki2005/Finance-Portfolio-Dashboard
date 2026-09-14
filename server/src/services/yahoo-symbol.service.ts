import YahooFinance from "yahoo-finance2";

import { getCache, setCache } from "./cache.service.js";

const yahooFinance = new YahooFinance();

export async function resolveYahooSymbol(
  stockName: string,
  exchangeCode: string,
): Promise<string | null> {
  const directSymbol = getDirectYahooSymbol(exchangeCode);

  if (directSymbol) {
    try {
      const quote = await yahooFinance.quote(directSymbol);

      if (typeof quote.regularMarketPrice === "number") {
        return directSymbol;
      }
    } catch {
      // Direct symbol did not work.
    }
  }

  const cacheKey = `yahoo-symbol:${stockName}:${exchangeCode}`;

  const cached = getCache<string | null>(cacheKey);

  if (cached !== null) {
    return cached;
  }

  try {
    console.log(`Searching Yahoo symbol for ${stockName}`);

    const result = await yahooFinance.search(stockName, {
      quotesCount: 10,
      newsCount: 0,
    });

    const equity = result.quotes.find((quote) => {
      if (!("quoteType" in quote) || quote.quoteType !== "EQUITY") {
        return false;
      }

      if (!("symbol" in quote)) {
        return false;
      }

      return isIndianYahooSymbol(String(quote.symbol));
    });

    const symbol = equity && "symbol" in equity ? String(equity.symbol) : null;

    setCache(cacheKey, symbol, 24 * 60 * 60 * 1000);

    return symbol;
  } catch (error) {
    console.error(`Yahoo symbol search failed for ${stockName}:`, error);

    return null;
  }
}

function getDirectYahooSymbol(exchangeCode: string): string | null {
  const code = exchangeCode.trim().toUpperCase();

  if (!code) {
    return null;
  }

  if (/^\d+$/.test(code)) {
    return `${code}.BO`;
  }

  return `${code}.NS`;
}

function isIndianYahooSymbol(symbol: string): boolean {
  return symbol.endsWith(".NS") || symbol.endsWith(".BO");
}
