export function getYahooSymbol(exchangeCode: string): string | null {
  const code = exchangeCode.trim().toUpperCase();

  if (!code) {
    return null;
  }

  // BSE security code
  if (/^\d+$/.test(code)) {
    return `${code}.BO`;
  }

  // NSE ticker
  return `${code}.NS`;
}
