import * as cheerio from "cheerio";
import { getCache, setCache } from "./cache.service.js";
export interface GoogleFinanceData {
  peRatio: number | null;
  latestEarnings: number | null;
}

function parseNumber(value: string): number | null {
  const cleaned = value
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/%/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
}

export async function getGoogleFinanceData(
  symbol: string,
): Promise<GoogleFinanceData> {
  try {
    const cacheKey = `google-finance:${symbol}`;

    const cached = getCache<GoogleFinanceData>(cacheKey);

    if (cached) {
      console.log(`Returning cached Google Finance data for ${symbol}`);

      return cached;
    }
    // const url = `https://www.google.com/finance/quote/${symbol}:NSE?hl=en`;
    const url =`https://www.google.com/finance/quote/${symbol}?hl=en`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Finance returned ${response.status}`);
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    const pageText = $("body").text();

    const peMatch = pageText.match(/P\/E ratio\s*([0-9,.]+)/i);

    const epsMatch = pageText.match(/EPS\s*₹?\s*([0-9,.]+)/i);

    const data: GoogleFinanceData = {
  peRatio: peMatch
    ? parseNumber(peMatch[1])
    : null,

  latestEarnings: epsMatch
    ? parseNumber(epsMatch[1])
    : null,
};

setCache(
  cacheKey,
  data,
  60 * 60 * 1000
);

return data;
  } catch (error) {
    console.error(`Google Finance error for ${symbol}:`, error);

    return {
      peRatio: null,
      latestEarnings: null,
    };
  }
}
