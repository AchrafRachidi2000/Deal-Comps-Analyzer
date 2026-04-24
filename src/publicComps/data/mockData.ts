export interface Peer {
  ticker: string;
  companyName: string;
  description: string;
  country: string;
  countryCode: string;

  sharePrice: number | null;
  marketCap: number | null;
  enterpriseValue: number | null;
  netDebt: number | null;
  cash: number | null;

  referenceDate: string;
  fiscalYearEnd: string;

  revenueLTM: number | null;
  ebitdaLTM: number | null;
  netIncomeLTM: number | null;
  epsLTM: number | null;
  revenueNTM: number | null;
  ebitdaNTM: number | null;

  evRevenueLTM: number | null;
  evEbitdaLTM: number | null;
  peLTM: number | null;
  evRevenueNTM: number | null;
  evEbitdaNTM: number | null;

  revenueGrowthYoY: number | null;
  ebitdaMargin: number | null;
  ntmRevenueGrowth: number | null;
  netDebtToEbitda: number | null;

  status: 'Included' | 'Excluded';
  exclusionReason: string | null;
  similarityScore: number;
  reasoning: string;
}

export interface PeerSet {
  id: string;
  targetCompany: string;
  sector: string;
  geography: string[];
  referenceDate: string;
  peers: Peer[];
}

export type MultipleKey = 'evRevenueLTM' | 'evEbitdaLTM' | 'peLTM' | 'evRevenueNTM' | 'evEbitdaNTM';

export interface MultipleStats {
  multiple: MultipleKey;
  label: string;
  min: number;
  p25: number;
  median: number;
  mean: number;
  p75: number;
  max: number;
  sampleSize: number;
  totalPeers: number;
}

export const MULTIPLE_DEFINITIONS: { key: MultipleKey; label: string }[] = [
  { key: 'evRevenueLTM', label: 'EV / Revenue (LTM)' },
  { key: 'evEbitdaLTM', label: 'EV / EBITDA (LTM)' },
  { key: 'peLTM', label: 'P / E (LTM)' },
  { key: 'evRevenueNTM', label: 'EV / Revenue (NTM)' },
  { key: 'evEbitdaNTM', label: 'EV / EBITDA (NTM)' },
];

export const MOCK_PEERS: Peer[] = [
  {
    ticker: 'RMD',
    companyName: 'ResMed Inc.',
    description: 'Global leader in sleep apnea, CPAP/BiPAP therapy, and connected respiratory care software.',
    country: 'United States',
    countryCode: 'US',
    sharePrice: 255.40,
    marketCap: 37500,
    enterpriseValue: 38100,
    netDebt: 600,
    cash: 250,
    referenceDate: 'LTM Q1 2026',
    fiscalYearEnd: 'June',
    revenueLTM: 4950,
    ebitdaLTM: 1585,
    netIncomeLTM: 1080,
    epsLTM: 7.35,
    revenueNTM: 5380,
    ebitdaNTM: 1755,
    evRevenueLTM: 7.7,
    evEbitdaLTM: 24.0,
    peLTM: 34.7,
    evRevenueNTM: 7.1,
    evEbitdaNTM: 21.7,
    revenueGrowthYoY: 11.2,
    ebitdaMargin: 32.0,
    ntmRevenueGrowth: 8.7,
    netDebtToEbitda: 0.4,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 94,
    reasoning: 'Closest direct peer — same respiratory monitoring segment with proven connected-device attach rate.',
  },
  {
    ticker: 'PHG',
    companyName: 'Koninklijke Philips N.V.',
    description: 'Diversified health technology; connected care, respiratory, and patient monitoring portfolio.',
    country: 'Netherlands',
    countryCode: 'NL',
    sharePrice: 29.80,
    marketCap: 27400,
    enterpriseValue: 32800,
    netDebt: 5400,
    cash: 1800,
    referenceDate: 'LTM Q4 2025',
    fiscalYearEnd: 'December',
    revenueLTM: 19200,
    ebitdaLTM: 2210,
    netIncomeLTM: 680,
    epsLTM: 0.74,
    revenueNTM: 19950,
    ebitdaNTM: 2620,
    evRevenueLTM: 1.7,
    evEbitdaLTM: 14.8,
    peLTM: 40.3,
    evRevenueNTM: 1.6,
    evEbitdaNTM: 12.5,
    revenueGrowthYoY: 2.4,
    ebitdaMargin: 11.5,
    ntmRevenueGrowth: 3.9,
    netDebtToEbitda: 2.4,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 82,
    reasoning: 'Broader diversified peer; connected-care and respiratory businesses give material read-across.',
  },
  {
    ticker: 'MASI',
    companyName: 'Masimo Corporation',
    description: 'Non-invasive patient monitoring technologies including pulse oximetry and capnography.',
    country: 'United States',
    countryCode: 'US',
    sharePrice: 168.20,
    marketCap: 8950,
    enterpriseValue: 9750,
    netDebt: 800,
    cash: 310,
    referenceDate: 'LTM Q1 2026',
    fiscalYearEnd: 'December',
    revenueLTM: 2165,
    ebitdaLTM: 430,
    netIncomeLTM: 188,
    epsLTM: 3.54,
    revenueNTM: 2320,
    ebitdaNTM: 495,
    evRevenueLTM: 4.5,
    evEbitdaLTM: 22.7,
    peLTM: 47.5,
    evRevenueNTM: 4.2,
    evEbitdaNTM: 19.7,
    revenueGrowthYoY: 6.8,
    ebitdaMargin: 19.9,
    ntmRevenueGrowth: 7.2,
    netDebtToEbitda: 1.9,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 88,
    reasoning: 'Pure-play non-invasive monitoring; closest analog on technology and hospital customer mix.',
  },
  {
    ticker: 'FPH',
    companyName: 'Fisher & Paykel Healthcare',
    description: 'Respiratory humidification, nasal high-flow therapy, and anaesthesia consumables.',
    country: 'New Zealand',
    countryCode: 'NZ',
    sharePrice: 34.10,
    marketCap: 19800,
    enterpriseValue: 19700,
    netDebt: -100,
    cash: 280,
    referenceDate: 'LTM Q3 2025',
    fiscalYearEnd: 'March',
    revenueLTM: 1180,
    ebitdaLTM: 360,
    netIncomeLTM: 205,
    epsLTM: 0.35,
    revenueNTM: 1310,
    ebitdaNTM: 415,
    evRevenueLTM: 16.7,
    evEbitdaLTM: 54.7,
    peLTM: 97.4,
    evRevenueNTM: 15.0,
    evEbitdaNTM: 47.5,
    revenueGrowthYoY: 14.5,
    ebitdaMargin: 30.5,
    ntmRevenueGrowth: 11.0,
    netDebtToEbitda: -0.3,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 85,
    reasoning: 'High-margin respiratory consumables peer; commands scarcity premium, likely outlier on multiples.',
  },
  {
    ticker: 'INGN',
    companyName: 'Inogen Inc.',
    description: 'Portable oxygen concentrators for ambulatory and home-based respiratory patients.',
    country: 'United States',
    countryCode: 'US',
    sharePrice: 8.45,
    marketCap: 205,
    enterpriseValue: 125,
    netDebt: -80,
    cash: 105,
    referenceDate: 'LTM Q1 2026',
    fiscalYearEnd: 'December',
    revenueLTM: 328,
    ebitdaLTM: 5,
    netIncomeLTM: -22,
    epsLTM: -0.91,
    revenueNTM: 345,
    ebitdaNTM: 12,
    evRevenueLTM: 0.4,
    evEbitdaLTM: 25.0,
    peLTM: null,
    evRevenueNTM: 0.4,
    evEbitdaNTM: 10.4,
    revenueGrowthYoY: -4.3,
    ebitdaMargin: 1.5,
    ntmRevenueGrowth: 5.2,
    netDebtToEbitda: -16.0,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 78,
    reasoning: 'Home-oxygen peer; thin profitability and negative earnings make P/E NM, but EV/Revenue is informative.',
  },
  {
    ticker: 'GETI-B',
    companyName: 'Getinge AB',
    description: 'Ventilators, critical care equipment, and medical systems for hospitals and life sciences.',
    country: 'Sweden',
    countryCode: 'SE',
    sharePrice: 25.60,
    marketCap: 6900,
    enterpriseValue: 8100,
    netDebt: 1200,
    cash: 420,
    referenceDate: 'LTM Q4 2025',
    fiscalYearEnd: 'December',
    revenueLTM: 3150,
    ebitdaLTM: 495,
    netIncomeLTM: 185,
    epsLTM: 0.68,
    revenueNTM: 3295,
    ebitdaNTM: 575,
    evRevenueLTM: 2.6,
    evEbitdaLTM: 16.4,
    peLTM: 37.6,
    evRevenueNTM: 2.5,
    evEbitdaNTM: 14.1,
    revenueGrowthYoY: 4.1,
    ebitdaMargin: 15.7,
    ntmRevenueGrowth: 4.6,
    netDebtToEbitda: 2.4,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 80,
    reasoning: 'Direct ventilator peer; critical care exposure overlaps strongly with target ICU segment.',
  },
  {
    ticker: 'DRW3',
    companyName: 'Drägerwerk AG',
    description: 'Medical and safety technology; ventilators, anaesthesia, and patient monitoring systems.',
    country: 'Germany',
    countryCode: 'DE',
    sharePrice: 52.30,
    marketCap: 925,
    enterpriseValue: 760,
    netDebt: -165,
    cash: 240,
    referenceDate: 'LTM Q4 2025',
    fiscalYearEnd: 'December',
    revenueLTM: 3420,
    ebitdaLTM: 295,
    netIncomeLTM: 102,
    epsLTM: 5.78,
    revenueNTM: 3560,
    ebitdaNTM: 330,
    evRevenueLTM: 0.2,
    evEbitdaLTM: 2.6,
    peLTM: 9.0,
    evRevenueNTM: 0.2,
    evEbitdaNTM: 2.3,
    revenueGrowthYoY: 3.2,
    ebitdaMargin: 8.6,
    ntmRevenueGrowth: 4.1,
    netDebtToEbitda: -0.6,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 76,
    reasoning: 'Closest European ventilator peer; multiples depressed by diversified safety-tech segment and German listing overhang.',
  },
  {
    ticker: 'VPG',
    companyName: 'Vapotherm Inc.',
    description: 'High-velocity nasal insufflation therapy for respiratory distress and home oxygen support.',
    country: 'United States',
    countryCode: 'US',
    sharePrice: 2.15,
    marketCap: 68,
    enterpriseValue: 95,
    netDebt: 27,
    cash: 32,
    referenceDate: 'LTM Q4 2025',
    fiscalYearEnd: 'December',
    revenueLTM: 78,
    ebitdaLTM: -15,
    netIncomeLTM: -28,
    epsLTM: -0.88,
    revenueNTM: null,
    ebitdaNTM: null,
    evRevenueLTM: 1.2,
    evEbitdaLTM: null,
    peLTM: null,
    evRevenueNTM: null,
    evEbitdaNTM: null,
    revenueGrowthYoY: -8.5,
    ebitdaMargin: -19.2,
    ntmRevenueGrowth: null,
    netDebtToEbitda: null,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 72,
    reasoning: 'Small-cap respiratory peer; thin analyst coverage, no NTM consensus available — shown LTM only.',
  },
  {
    ticker: 'BAX',
    companyName: 'Baxter International',
    description: 'Hospital products including respiratory and critical care infusion therapy.',
    country: 'United States',
    countryCode: 'US',
    sharePrice: 38.60,
    marketCap: 19700,
    enterpriseValue: 34800,
    netDebt: 15100,
    cash: 2400,
    referenceDate: 'LTM Q4 2025',
    fiscalYearEnd: 'December',
    revenueLTM: 14850,
    ebitdaLTM: 2570,
    netIncomeLTM: 345,
    epsLTM: 0.68,
    revenueNTM: 15420,
    ebitdaNTM: 2890,
    evRevenueLTM: 2.3,
    evEbitdaLTM: 13.5,
    peLTM: 56.8,
    evRevenueNTM: 2.3,
    evEbitdaNTM: 12.0,
    revenueGrowthYoY: 1.8,
    ebitdaMargin: 17.3,
    ntmRevenueGrowth: 3.8,
    netDebtToEbitda: 5.9,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 64,
    reasoning: 'Partial-overlap peer; respiratory exposure is a minor segment, included to anchor the large-cap end of the range.',
  },
  {
    ticker: 'NHKO',
    companyName: 'Nihon Kohden Corp.',
    description: 'Patient monitoring, diagnostic cardiology, and respiratory medical devices.',
    country: 'Japan',
    countryCode: 'JP',
    sharePrice: 21.30,
    marketCap: 1850,
    enterpriseValue: 1580,
    netDebt: -270,
    cash: 380,
    referenceDate: 'LTM Q3 2025',
    fiscalYearEnd: 'March',
    revenueLTM: 1380,
    ebitdaLTM: 175,
    netIncomeLTM: 98,
    epsLTM: 1.14,
    revenueNTM: 1435,
    ebitdaNTM: 195,
    evRevenueLTM: 1.1,
    evEbitdaLTM: 9.0,
    peLTM: 18.7,
    evRevenueNTM: 1.1,
    evEbitdaNTM: 8.1,
    revenueGrowthYoY: 3.6,
    ebitdaMargin: 12.7,
    ntmRevenueGrowth: 4.0,
    netDebtToEbitda: -1.5,
    status: 'Included',
    exclusionReason: null,
    similarityScore: 70,
    reasoning: 'Japanese patient-monitoring peer; different FYE (March) — see reference date per row.',
  },
];

export const MOCK_PEER_SET: PeerSet = {
  id: 'peer-set-1',
  targetCompany: 'NovaPulse Medical',
  sector: 'Medical Devices — Respiratory Monitoring',
  geography: ['North America', 'Europe', 'Asia Pacific'],
  referenceDate: 'Q1 2026',
  peers: MOCK_PEERS,
};

export const PUBLIC_COMPS_CHAT_HISTORY = [
  {
    role: 'assistant',
    content: "I've assembled an initial peer set of **10 listed companies** for NovaPulse Medical. Reference date defaults to the latest reported quarter across the set.\n\nWant me to narrow the peer list by size band or geography?",
    timestamp: '09:14 AM',
  },
  {
    role: 'user',
    content: 'Drop anything with market cap above $20B — too large to be comparable.',
    timestamp: '09:16 AM',
  },
  {
    role: 'assistant',
    content: "Excluded Philips (PHG) and Baxter (BAX). The median EV/EBITDA LTM for the remaining peer set is now **16.4x**.",
    timestamp: '09:16 AM',
  },
];
