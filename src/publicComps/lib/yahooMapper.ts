import type { Peer } from '../data/mockData.js';
import { COUNTRY_TO_CODE } from './yahooSymbols.js';

export type RealPeerFields = Partial<
  Pick<
    Peer,
    | 'companyName'
    | 'country'
    | 'countryCode'
    | 'sharePrice'
    | 'marketCap'
    | 'enterpriseValue'
    | 'netDebt'
    | 'cash'
    | 'referenceDate'
    | 'fiscalYearEnd'
    | 'revenueLTM'
    | 'ebitdaLTM'
    | 'netIncomeLTM'
    | 'epsLTM'
    | 'revenueNTM'
    | 'ebitdaNTM'
    | 'evRevenueLTM'
    | 'evEbitdaLTM'
    | 'peLTM'
    | 'evRevenueNTM'
    | 'evEbitdaNTM'
    | 'revenueGrowthYoY'
    | 'ebitdaMargin'
    | 'ntmRevenueGrowth'
    | 'netDebtToEbitda'
  >
> & { currency?: string };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toMillions(v: unknown): number | null {
  const n = typeof v === 'number' ? v : null;
  if (n === null || !Number.isFinite(n)) return null;
  return n / 1_000_000;
}

function toNumber(v: unknown): number | null {
  const n = typeof v === 'number' ? v : null;
  if (n === null || !Number.isFinite(n)) return null;
  return n;
}

function toPercent(fraction: unknown): number | null {
  const n = toNumber(fraction);
  if (n === null) return null;
  return n * 100;
}

function formatQuarter(d: unknown): string | null {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d as string | number);
  if (Number.isNaN(date.getTime())) return null;
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `LTM Q${q} ${date.getFullYear()}`;
}

export function mapYahooQuoteSummary(raw: any): RealPeerFields {
  const price = raw?.price ?? {};
  const profile = raw?.summaryProfile ?? {};
  const stats = raw?.defaultKeyStatistics ?? {};
  const fin = raw?.financialData ?? {};
  const summary = raw?.summaryDetail ?? {};
  const trend: any[] = raw?.earningsTrend?.trend ?? [];

  const marketCap = toMillions(price.marketCap);
  const enterpriseValue = toMillions(stats.enterpriseValue);
  const cash = toMillions(fin.totalCash);
  const totalDebt = toMillions(fin.totalDebt);
  const netDebt = cash !== null && totalDebt !== null ? totalDebt - cash : null;

  const revenueLTM = toMillions(fin.totalRevenue);
  const ebitdaLTM = toMillions(fin.ebitda);
  const netIncomeLTM = toMillions(stats.netIncomeToCommon);

  const trailingEps = toNumber(stats.trailingEps);
  const forwardEps = toNumber(stats.forwardEps);

  const evRevenueLTM = toNumber(stats.enterpriseToRevenue);
  const evEbitdaLTM = toNumber(stats.enterpriseToEbitda);
  const peLTM = toNumber(summary.trailingPE) ?? toNumber(stats.trailingPE);

  const ntmTrend = trend.find((t) => t?.period === '+1y');
  const revenueNTM = toMillions(ntmTrend?.revenueEstimate?.avg);
  const ntmRevenueGrowth = toPercent(ntmTrend?.revenueEstimate?.growth);

  const evRevenueNTM =
    enterpriseValue !== null && revenueNTM !== null && revenueNTM > 0
      ? enterpriseValue / revenueNTM
      : null;

  const revenueGrowthYoY = toPercent(fin.revenueGrowth);
  const ebitdaMargin = toPercent(fin.ebitdaMargins);

  const netDebtToEbitda =
    netDebt !== null && ebitdaLTM !== null && ebitdaLTM > 0 ? netDebt / ebitdaLTM : null;

  const country = typeof profile.country === 'string' ? profile.country : null;
  const countryCode = country ? COUNTRY_TO_CODE[country] ?? country.slice(0, 2).toUpperCase() : null;

  const fyeMonth = toNumber(stats.nextFiscalYearEnd);
  const fyeDate = raw?.defaultKeyStatistics?.lastFiscalYearEnd;
  const fyeFormatted = (() => {
    const d = fyeDate instanceof Date ? fyeDate : fyeDate ? new Date(fyeDate) : null;
    if (d && !Number.isNaN(d.getTime())) return MONTH_NAMES[d.getMonth()];
    if (fyeMonth && fyeMonth >= 1 && fyeMonth <= 12) return MONTH_NAMES[fyeMonth - 1];
    return null;
  })();

  const out: RealPeerFields = {
    companyName: typeof price.longName === 'string' ? price.longName : undefined,
    country: country ?? undefined,
    countryCode: countryCode ?? undefined,
    sharePrice: toNumber(price.regularMarketPrice) ?? undefined,
    marketCap: marketCap ?? undefined,
    enterpriseValue: enterpriseValue ?? undefined,
    netDebt: netDebt ?? undefined,
    cash: cash ?? undefined,
    referenceDate: formatQuarter(stats.mostRecentQuarter) ?? undefined,
    fiscalYearEnd: fyeFormatted ?? undefined,
    revenueLTM: revenueLTM ?? undefined,
    ebitdaLTM: ebitdaLTM ?? undefined,
    netIncomeLTM: netIncomeLTM ?? undefined,
    epsLTM: trailingEps ?? undefined,
    revenueNTM: revenueNTM ?? undefined,
    ebitdaNTM: null,
    evRevenueLTM: evRevenueLTM ?? undefined,
    evEbitdaLTM: evEbitdaLTM ?? undefined,
    peLTM: peLTM ?? undefined,
    evRevenueNTM: evRevenueNTM ?? undefined,
    evEbitdaNTM: null,
    revenueGrowthYoY: revenueGrowthYoY ?? undefined,
    ebitdaMargin: ebitdaMargin ?? undefined,
    ntmRevenueGrowth: ntmRevenueGrowth ?? undefined,
    netDebtToEbitda: netDebtToEbitda ?? undefined,
    currency: typeof price.currency === 'string' ? price.currency : undefined,
  };

  // forwardEps is not stored on Peer; drop to avoid confusion
  void forwardEps;

  return out;
}
