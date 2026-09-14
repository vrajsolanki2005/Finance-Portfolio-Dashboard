import YahooFinance from "yahoo-finance2";
import { getCache, setCache } from "./cache.service.js";

const yahooFinance = new YahooFinance();
const SYMBOL_CACHE_TTL = 24 * 60 * 60 * 1000;
const SYMBOL_OVERRIDES: Record<string, string> = {
  "543517": "HARIOMPIPE.NS",
  "543237": "HAPPSTMNDS.NS",
  LTIM: "LTM.NS",
};

export async function resolveYahooSymbol(
  stockName: string,
  exchangeCode: string,
): Promise<string | null> {
  const code = exchangeCode.trim().toUpperCase();

  const cacheKey = `yahoo-symbol:${stockName}:${code}`;

  // 1. Check cached symbol
  const cached = getCache<string | null>(cacheKey);

  if (cached !== null) {
    return cached;
  }

  // 2. Known symbol overrides
  const override = SYMBOL_OVERRIDES[code];

  if (override) {
    console.log(`Yahoo symbol override: ${stockName} → ${override}`);

    setCache(cacheKey, override, 24 * 60 * 60 * 1000);

    return override;
  }

  // 3. Try normal direct symbol
  const directSymbol = getDirectYahooSymbol(code);

  if (directSymbol) {
    try {
      const quote = await yahooFinance.quote(directSymbol);

      if (typeof quote.regularMarketPrice === "number") {
        setCache(cacheKey, directSymbol, 24 * 60 * 60 * 1000);

        return directSymbol;
      }
    } catch {
      console.log(`Direct Yahoo symbol failed: ${directSymbol}`);
    }
  }

  // 4. Yahoo search fallback
  try {
    console.log(`Searching Yahoo for: ${stockName}`);

    const result = await yahooFinance.search(stockName, {
      quotesCount: 10,
      newsCount: 0,
    });

    const symbol = findBestIndianSymbol(result.quotes, stockName);

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

function findBestIndianSymbol(quotes: any[], stockName: string): string | null {
  const indianQuotes = quotes.filter((quote) => {
    const symbol = String(quote.symbol ?? "").toUpperCase();

    return symbol.endsWith(".NS") || symbol.endsWith(".BO");
  });

  if (indianQuotes.length === 0) {
    return null;
  }

  const normalizedName = normalize(stockName);

  const exactName = indianQuotes.find((quote) => {
    const name = normalize(quote.longname ?? quote.shortname ?? "");

    return name === normalizedName;
  });

  if (exactName) {
    return String(exactName.symbol);
  }

  const partialName = indianQuotes.find((quote) => {
    const name = normalize(quote.longname ?? quote.shortname ?? "");

    return name.includes(normalizedName) || normalizedName.includes(name);
  });

  if (partialName) {
    return String(partialName.symbol);
  }

  return String(indianQuotes[0].symbol);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
