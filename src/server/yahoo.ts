import YahooFinance from 'yahoo-finance2';
import { mapYahooQuoteSummary, RealPeerFields } from '../publicComps/lib/yahooMapper.js';
import { toYahooSymbol } from '../publicComps/lib/yahooSymbols.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
const yahooCache = new Map<string, { at: number; data: RealPeerFields }>();

const YAHOO_MODULES = [
  'price',
  'summaryProfile',
  'summaryDetail',
  'defaultKeyStatistics',
  'financialData',
  'earningsTrend',
] as const;

let yf: InstanceType<typeof YahooFinance> | null = null;
function yahoo() {
  if (!yf) yf = new YahooFinance();
  return yf;
}

export async function fetchYahooPeer(ticker: string): Promise<RealPeerFields> {
  const cached = yahooCache.get(ticker);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;

  const symbol = toYahooSymbol(ticker);
  const raw = await yahoo().quoteSummary(
    symbol,
    { modules: YAHOO_MODULES as any },
    { validateResult: false }
  );
  const mapped = mapYahooQuoteSummary(raw);
  yahooCache.set(ticker, { at: Date.now(), data: mapped });
  return mapped;
}
