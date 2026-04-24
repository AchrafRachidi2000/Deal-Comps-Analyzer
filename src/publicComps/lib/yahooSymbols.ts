export const TICKER_TO_YAHOO: Record<string, string> = {
  RMD: 'RMD',
  PHG: 'PHG',
  MASI: 'MASI',
  FPH: 'FPH.NZ',
  INGN: 'INGN',
  'GETI-B': 'GETI-B.ST',
  DRW3: 'DRW3.DE',
  VPG: 'VAPO',
  BAX: 'BAX',
  NHKO: '6849.T',
};

export function toYahooSymbol(ticker: string): string {
  return TICKER_TO_YAHOO[ticker] ?? ticker;
}

export const COUNTRY_TO_CODE: Record<string, string> = {
  'United States': 'US',
  'United Kingdom': 'GB',
  Netherlands: 'NL',
  'New Zealand': 'NZ',
  Sweden: 'SE',
  Germany: 'DE',
  Japan: 'JP',
  France: 'FR',
  Switzerland: 'CH',
  Ireland: 'IE',
  Denmark: 'DK',
  Canada: 'CA',
  Australia: 'AU',
  China: 'CN',
  'Hong Kong': 'HK',
  Singapore: 'SG',
  'South Korea': 'KR',
  India: 'IN',
  Italy: 'IT',
  Spain: 'ES',
  Belgium: 'BE',
  Finland: 'FI',
  Norway: 'NO',
};
