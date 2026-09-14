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
  const cacheKey = `google-finance:${symbol}`;

  // 1. Check cache first.
  const cached = getCache<GoogleFinanceData>(cacheKey);

  if (cached) {
    console.log(`Google Finance cache hit: ${symbol}`);

    return cached;
  }

  console.log(`Fetching Google Finance: ${symbol}`);

  try {
    const url = `https://www.google.com/finance/quote/${symbol}?hl=en`;

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

    const result: GoogleFinanceData = {
      peRatio: peMatch ? parseNumber(peMatch[1]) : null,

      latestEarnings: epsMatch ? parseNumber(epsMatch[1]) : null,
    };

    // Fundamentals are relatively stable,
    // so cache them for one hour.
    setCache(cacheKey, result, 60 * 60 * 1000);

    return result;
  } catch (error) {
    console.error(`Google Finance failed for ${symbol}:`, error);

    // Do not crash the entire portfolio
    // if one external provider fails.
    return {
      peRatio: null,
      latestEarnings: null,
    };
  }
}
