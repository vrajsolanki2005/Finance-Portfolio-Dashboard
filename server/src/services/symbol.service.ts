export function getYahooSymbol(
  exchangeCode: string
): string | null {
  const code = exchangeCode.trim();

  if (!code) {
    return null;
  }

  // Numeric codes are BSE codes
  if (/^\d+$/.test(code)) {
    return `${code}.BO`;
  }

  // Alphabetic NSE symbols
  return `${code}.NS`;
}