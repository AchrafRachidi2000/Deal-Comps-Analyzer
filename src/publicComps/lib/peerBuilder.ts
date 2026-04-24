import type { Peer } from '../data/mockData.js';
import type { RealPeerFields } from './yahooMapper.js';

export interface DiscoveredPeerInput {
  ticker: string;
  companyName: string;
  description: string;
  rationale: string;
  similarityScore: number;
}

export function buildPeer(d: DiscoveredPeerInput, real: RealPeerFields): Peer {
  return {
    ticker: d.ticker,
    companyName: real.companyName ?? d.companyName,
    description: d.description,
    country: real.country ?? '—',
    countryCode: real.countryCode ?? 'XX',
    sharePrice: real.sharePrice ?? null,
    marketCap: real.marketCap ?? null,
    enterpriseValue: real.enterpriseValue ?? null,
    netDebt: real.netDebt ?? null,
    cash: real.cash ?? null,
    referenceDate: real.referenceDate ?? '—',
    fiscalYearEnd: real.fiscalYearEnd ?? '—',
    revenueLTM: real.revenueLTM ?? null,
    ebitdaLTM: real.ebitdaLTM ?? null,
    netIncomeLTM: real.netIncomeLTM ?? null,
    epsLTM: real.epsLTM ?? null,
    revenueNTM: real.revenueNTM ?? null,
    ebitdaNTM: null,
    evRevenueLTM: real.evRevenueLTM ?? null,
    evEbitdaLTM: real.evEbitdaLTM ?? null,
    peLTM: real.peLTM ?? null,
    evRevenueNTM: real.evRevenueNTM ?? null,
    evEbitdaNTM: null,
    revenueGrowthYoY: real.revenueGrowthYoY ?? null,
    ebitdaMargin: real.ebitdaMargin ?? null,
    ntmRevenueGrowth: real.ntmRevenueGrowth ?? null,
    netDebtToEbitda: real.netDebtToEbitda ?? null,
    status: 'Included',
    exclusionReason: null,
    similarityScore: d.similarityScore,
    reasoning: d.rationale,
  };
}
