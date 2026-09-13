export function getGoogleFinanceSymbol(
  exchangeCode: string
): string | null {
  const code = exchangeCode.trim();

  if (!code) {
    return null;
  }

  if (/^\d+$/.test(code)) {
    return `${code}:BOM`;
  }

  return `${code}:NSE`;
}