export interface Transaction {
  id: string;
  targetCompany: string;
  targetDescription: string;
  dealDate: string;
  buyer: string;
  buyerType: 'Strategic' | 'Financial' | 'Hybrid';
  advisor: string;
  dealSize: number | null; // in millions, null if missing
  currency: string;
  ebitda: number | null; // in millions, null if missing
  enterpriseValue: number | null; // in millions, null if missing
  evEbitdaMultiple: number | null;
  revenue: number | null; // LTM Revenue in $M, null if missing
  evRevenueMultiple: number | null; // TEV / Revenue, null if missing
  status: 'Included' | 'Excluded';
  exclusionReason: string | null; // Why it's excluded (incomplete data)
  reasoning: string; // Why it's a good comp
  multipleComment: string; // Why multiple is high/low
  location: string;
  countryCode: string; // for flags
  similarityScore: number;
  newsLink: string;
  newsTitle: string;
}

export interface EvidenceSource {
  name: string;
  year: string;
  verified: boolean;
}

export interface ClaimWithEvidence {
  claim: string;
  sources: EvidenceSource[];
}

export interface DealImplication {
  id: string;
  type: 'opportunity' | 'risk';
  title: string;
  description: string;
  claims: ClaimWithEvidence[];
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    targetCompany: 'RespiraTech Solutions',
    targetDescription: 'Leading provider of non-invasive respiratory monitoring devices for ICU settings.',
    dealDate: '2025-11-15',
    buyer: 'Medtronic',
    buyerType: 'Strategic',
    advisor: 'Goldman Sachs',
    dealSize: 450,
    currency: 'USD',
    ebitda: 32,
    enterpriseValue: 450,
    evEbitdaMultiple: 14.1,
    revenue: 85,
    evRevenueMultiple: 5.3,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'High overlap in product portfolio and customer base (Tier 1 hospitals).',
    multipleComment: 'Premium paid for proprietary sensor technology.',
    location: 'United States',
    countryCode: 'US',
    similarityScore: 95,
    newsLink: '#',
    newsTitle: 'Medtronic expands respiratory portfolio with RespiraTech acquisition'
  },
  {
    id: '2',
    targetCompany: 'AirFlow Diagnostics',
    targetDescription: 'Portable spirometry and lung function testing equipment manufacturer.',
    dealDate: '2025-08-22',
    buyer: 'Philips Healthcare',
    buyerType: 'Strategic',
    advisor: 'J.P. Morgan',
    dealSize: 280,
    currency: 'EUR',
    ebitda: 22,
    enterpriseValue: 310,
    evEbitdaMultiple: 12.5,
    revenue: 72,
    evRevenueMultiple: 4.3,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'Direct competitor in the home-care segment.',
    multipleComment: 'In line with historical averages for diagnostic hardware.',
    location: 'Germany',
    countryCode: 'DE',
    similarityScore: 88,
    newsLink: '#',
    newsTitle: 'Philips strengthens home care diagnostics with AirFlow deal'
  },
  {
    id: '3',
    targetCompany: 'OxySense Labs',
    targetDescription: 'AI-powered pulse oximetry software and hardware.',
    dealDate: '2025-05-10',
    buyer: 'Carlyle Group',
    buyerType: 'Financial',
    advisor: 'Morgan Stanley',
    dealSize: 120,
    currency: 'USD',
    ebitda: 8,
    enterpriseValue: 120,
    evEbitdaMultiple: 15.0,
    revenue: 28,
    evRevenueMultiple: 4.3,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'Strong recurring revenue component from software subscription.',
    multipleComment: 'Higher multiple due to SaaS-like revenue profile.',
    location: 'United Kingdom',
    countryCode: 'GB',
    similarityScore: 82,
    newsLink: '#',
    newsTitle: 'Carlyle bets on AI-driven medtech with OxySense investment'
  },
  {
    id: '4',
    targetCompany: 'LungGuard Inc.',
    targetDescription: 'Disposable respiratory filters and accessories.',
    dealDate: '2024-12-01',
    buyer: '3M',
    buyerType: 'Strategic',
    advisor: 'Lazard',
    dealSize: 850,
    currency: 'USD',
    ebitda: 95,
    enterpriseValue: 850,
    evEbitdaMultiple: 8.9,
    revenue: 320,
    evRevenueMultiple: 2.7,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'Scale acquisition, lower growth profile but high cash flow.',
    multipleComment: 'Lower multiple reflects commoditized nature of consumables.',
    location: 'United States',
    countryCode: 'US',
    similarityScore: 75,
    newsLink: '#',
    newsTitle: '3M adds LungGuard to its medical consumables division'
  },
  {
    id: '5',
    targetCompany: 'PulmoTech AG',
    targetDescription: 'CPAP and BiPAP therapy devices with connected patient monitoring platform.',
    dealDate: '2025-03-08',
    buyer: 'EQT Partners',
    buyerType: 'Financial',
    advisor: 'Rothschild & Co',
    dealSize: 340,
    currency: 'EUR',
    ebitda: 28,
    enterpriseValue: 370,
    evEbitdaMultiple: 13.2,
    revenue: 95,
    evRevenueMultiple: 3.9,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'PE-backed platform deal with buy-and-build thesis in connected respiratory care.',
    multipleComment: 'Multiple in line with connected device peers; 35% recurring revenue from monitoring subscriptions.',
    location: 'Switzerland',
    countryCode: 'CH',
    similarityScore: 90,
    newsLink: '#',
    newsTitle: 'EQT Partners acquires PulmoTech in respiratory care platform bet'
  },
  {
    id: '6',
    targetCompany: 'NebulaSoft Health',
    targetDescription: 'Cloud-based respiratory data analytics platform for hospital networks.',
    dealDate: '2025-06-14',
    buyer: 'Warburg Pincus',
    buyerType: 'Financial',
    advisor: 'William Blair',
    dealSize: 195,
    currency: 'USD',
    ebitda: 12,
    enterpriseValue: 195,
    evEbitdaMultiple: 16.3,
    revenue: 38,
    evRevenueMultiple: 5.1,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'Pure-play SaaS in respiratory analytics; 90%+ recurring revenue, high gross margins.',
    multipleComment: 'Premium multiple justified by 40% YoY revenue growth and 85% gross margins.',
    location: 'United States',
    countryCode: 'US',
    similarityScore: 85,
    newsLink: '#',
    newsTitle: 'Warburg Pincus leads $195M investment in NebulaSoft Health'
  },
  {
    id: '7',
    targetCompany: 'CapnoStream Medical',
    targetDescription: 'Capnography monitoring systems for anesthesia and critical care departments.',
    dealDate: '2024-09-20',
    buyer: 'Danaher Corporation',
    buyerType: 'Strategic',
    advisor: 'Centerview Partners',
    dealSize: 580,
    currency: 'USD',
    ebitda: 52,
    enterpriseValue: 580,
    evEbitdaMultiple: 11.2,
    revenue: 148,
    evRevenueMultiple: 3.9,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'Strong installed base in top 200 US hospitals; 70% of revenue from consumable refills.',
    multipleComment: 'Moderate multiple reflects mature growth but high cash conversion and recurring consumables stream.',
    location: 'United States',
    countryCode: 'US',
    similarityScore: 79,
    newsLink: '#',
    newsTitle: 'Danaher acquires CapnoStream to bolster critical care monitoring'
  },
  {
    id: '8',
    targetCompany: 'TidalSense Ltd',
    targetDescription: 'Handheld COPD and asthma diagnostic device with AI-driven severity scoring.',
    dealDate: '2025-09-02',
    buyer: 'Apax Partners',
    buyerType: 'Financial',
    advisor: 'Houlihan Lokey',
    dealSize: 85,
    currency: 'GBP',
    ebitda: 5,
    enterpriseValue: 105,
    evEbitdaMultiple: 21.0,
    revenue: 15,
    evRevenueMultiple: 7.0,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'Early-stage but high-conviction play; FDA-cleared device with NHS adoption accelerating.',
    multipleComment: 'Elevated multiple reflects early-stage scarcity premium and high growth trajectory (70%+ YoY).',
    location: 'United Kingdom',
    countryCode: 'GB',
    similarityScore: 77,
    newsLink: '#',
    newsTitle: 'Apax acquires TidalSense in high-growth medtech bet'
  },
  {
    id: '9',
    targetCompany: 'Inspiro Systems',
    targetDescription: 'Neonatal ventilator and respiratory support systems for NICUs.',
    dealDate: '2024-07-11',
    buyer: 'Getinge AB',
    buyerType: 'Strategic',
    advisor: 'Guggenheim Securities',
    dealSize: 220,
    currency: 'SEK',
    ebitda: 18,
    enterpriseValue: 245,
    evEbitdaMultiple: 13.6,
    revenue: 62,
    evRevenueMultiple: 4.0,
    status: 'Included',
    exclusionReason: null,
    reasoning: 'Niche neonatal focus with strong IP portfolio (12 patents) and limited direct competitors.',
    multipleComment: 'Multiple reflects specialty niche premium and defensible IP moat.',
    location: 'Sweden',
    countryCode: 'SE',
    similarityScore: 73,
    newsLink: '#',
    newsTitle: 'Getinge expands neonatal care portfolio with Inspiro acquisition'
  },
  {
    id: '10',
    targetCompany: 'VentilateNow',
    targetDescription: 'Emergency ventilator manufacturing startup.',
    dealDate: '2024-10-15',
    buyer: 'Hillrom',
    buyerType: 'Strategic',
    advisor: 'Piper Sandler',
    dealSize: 65,
    currency: 'USD',
    ebitda: -2,
    enterpriseValue: 65,
    evEbitdaMultiple: null,
    revenue: null,
    evRevenueMultiple: null,
    status: 'Excluded',
    exclusionReason: 'Missing LTM Revenue; negative EBITDA prevents multiple calculation.',
    reasoning: 'Pre-profitability, distressed asset sale.',
    multipleComment: 'N/A — Negative EBITDA.',
    location: 'France',
    countryCode: 'FR',
    similarityScore: 45,
    newsLink: '#',
    newsTitle: 'Hillrom acquires distressed ventilator maker VentilateNow'
  },
  {
    id: '11',
    targetCompany: 'BreatheEasy Systems',
    targetDescription: 'Home sleep apnea testing devices.',
    dealDate: '2025-01-20',
    buyer: 'ResMed',
    buyerType: 'Strategic',
    advisor: 'Jefferies',
    dealSize: 1500,
    currency: 'USD',
    ebitda: null,
    enterpriseValue: 1500,
    evEbitdaMultiple: null,
    revenue: 410,
    evRevenueMultiple: 3.7,
    status: 'Excluded',
    exclusionReason: 'LTM EBITDA not publicly disclosed; EV/EBITDA multiple cannot be computed.',
    reasoning: 'Market leader in adjacent sleep apnea space.',
    multipleComment: 'EBITDA not available.',
    location: 'Australia',
    countryCode: 'AU',
    similarityScore: 60,
    newsLink: '#',
    newsTitle: 'ResMed consolidates market position with BreatheEasy acquisition'
  },
  {
    id: '12',
    targetCompany: 'AeroLung Therapeutics',
    targetDescription: 'Inhalation drug-device combo products for asthma and COPD.',
    dealDate: '2025-04-18',
    buyer: 'AstraZeneca',
    buyerType: 'Strategic',
    advisor: 'Evercore',
    dealSize: 2200,
    currency: 'USD',
    ebitda: null,
    enterpriseValue: 2200,
    evEbitdaMultiple: null,
    revenue: 180,
    evRevenueMultiple: 12.2,
    status: 'Excluded',
    exclusionReason: 'EBITDA not disclosed; drug-device combo falls outside core monitoring device mandate.',
    reasoning: 'Pharma-adjacent transaction; primarily drug delivery rather than monitoring.',
    multipleComment: 'Revenue multiple inflated by pharma pipeline value not applicable to device comps.',
    location: 'United States',
    countryCode: 'US',
    similarityScore: 35,
    newsLink: '#',
    newsTitle: 'AstraZeneca acquires AeroLung to strengthen inhaled therapeutics pipeline'
  },
  {
    id: '13',
    targetCompany: 'SinoResp Medical',
    targetDescription: 'Chinese manufacturer of low-cost ventilators and oxygen concentrators.',
    dealDate: '2024-11-30',
    buyer: 'Mindray Medical',
    buyerType: 'Strategic',
    advisor: 'CICC',
    dealSize: 90,
    currency: 'CNY',
    ebitda: 11,
    enterpriseValue: null,
    evEbitdaMultiple: null,
    revenue: 55,
    evRevenueMultiple: null,
    status: 'Excluded',
    exclusionReason: 'Enterprise value not disclosed in USD terms; domestic Chinese transaction with limited data transparency.',
    reasoning: 'Domestic consolidation play in Chinese market; limited comparability to Western deals.',
    multipleComment: 'Insufficient data for reliable multiple calculation.',
    location: 'China',
    countryCode: 'CN',
    similarityScore: 30,
    newsLink: '#',
    newsTitle: 'Mindray acquires SinoResp in domestic respiratory care consolidation'
  },
  {
    id: '14',
    targetCompany: 'PneumaVista',
    targetDescription: 'Early-stage wearable respiratory rate monitor for post-surgical patients.',
    dealDate: '2025-07-25',
    buyer: 'Sofina',
    buyerType: 'Financial',
    advisor: 'SVB Securities',
    dealSize: 35,
    currency: 'USD',
    ebitda: -4,
    enterpriseValue: 35,
    evEbitdaMultiple: null,
    revenue: 3,
    evRevenueMultiple: null,
    status: 'Excluded',
    exclusionReason: 'Pre-revenue stage with negative EBITDA; venture-stage transaction not comparable to mid-market PE deals.',
    reasoning: 'Seed/Series A stage company; product not yet commercially scaled.',
    multipleComment: 'N/A — Pre-revenue, negative EBITDA.',
    location: 'Israel',
    countryCode: 'IL',
    similarityScore: 25,
    newsLink: '#',
    newsTitle: 'Sofina leads Series A in wearable respiratory monitoring startup PneumaVista'
  },
  {
    id: '15',
    targetCompany: 'RespiCore Instruments',
    targetDescription: 'Pulmonary function testing (PFT) lab equipment for hospitals and clinics.',
    dealDate: '2024-06-05',
    buyer: 'Vyaire Medical',
    buyerType: 'Strategic',
    advisor: 'Baird',
    dealSize: 160,
    currency: 'USD',
    ebitda: 19,
    enterpriseValue: null,
    evEbitdaMultiple: null,
    revenue: 68,
    evRevenueMultiple: null,
    status: 'Excluded',
    exclusionReason: 'Enterprise value not publicly confirmed; deal size sourced from press reports only.',
    reasoning: 'Direct overlap in PFT segment but insufficient valuation data for multiple benchmarking.',
    multipleComment: 'EV not confirmed — cannot compute reliable multiples.',
    location: 'Canada',
    countryCode: 'CA',
    similarityScore: 55,
    newsLink: '#',
    newsTitle: 'Vyaire Medical acquires RespiCore to expand PFT product line'
  },
];

export const STATISTICS = {
  totalConsidered: 247,
};

export const DEAL_OVERVIEW = {
  impliedTicketSize: '$100M – $400M equity',
  ticketSizeDescription: 'Based on included comps, the fund\'s $150M–$350M equity check aligns with 7 of 9 included transactions. Sweet spot for mid-market PE entry without competing against large-cap strategics.',
  entryMultipleRange: '11.2x – 14.1x EV/EBITDA',
  multipleDescription: 'Interquartile range for financial sponsor deals. Median of 13.2x is achievable at entry if targeting assets with recurring revenue or connected-device profiles.',
};

export const DEAL_IMPLICATIONS: DealImplication[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Favorable entry window for financial sponsors',
    description: 'Only 3 of 9 included deals were PE-backed (Carlyle, EQT, Warburg Pincus), indicating the sector is still underpenetrated by financial sponsors. Strategics dominate at higher price points ($500M+), leaving the $100M–$400M EV range as a less contested entry zone for mid-market PE.',
    claims: [
      {
        claim: 'Financial sponsors accounted for just 33% of respiratory monitoring M&A by deal count, vs. 55% across broader medtech — suggesting room for increased PE activity before the market becomes crowded.',
        sources: [
          { name: 'PitchBook Annual PE Report', year: '2025', verified: true },
          { name: 'Bain & Company Global Healthcare PE Review', year: '2025', verified: true },
        ],
      },
      {
        claim: 'Average PE entry multiples in respiratory monitoring (13.6x) were 1.5–2.0x turns below strategic acquirer multiples (15.2x), providing a valuation arbitrage opportunity for sponsors willing to build scale organically.',
        sources: [
          { name: 'Mergermarket Deal Report', year: '2025', verified: true },
          { name: 'Company CIM', year: '2025', verified: true },
        ],
      },
    ],
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Buy-and-build thesis supported by fragmented landscape',
    description: 'The comp set reveals a highly fragmented sector with no single player commanding >5% market share in non-invasive monitoring. EQT\'s PulmoTech deal (13.2x) and Warburg\'s NebulaSoft deal (16.3x) both follow a platform acquisition strategy — enter at a reasonable multiple, then bolt on smaller targets at 8–10x to compress blended entry cost.',
    claims: [
      {
        claim: 'Sector fragmentation index (Herfindahl) of 0.04 places respiratory monitoring among the most fragmented medtech verticals, making it a textbook buy-and-build opportunity for PE sponsors.',
        sources: [
          { name: 'Capital IQ Screener', year: '2025', verified: true },
          { name: 'McKinsey MedTech M&A Playbook', year: '2024', verified: true },
        ],
      },
      {
        claim: 'Bolt-on acquisitions in respiratory monitoring have historically closed at 7.5–9.5x EV/EBITDA, 3–5 turns below platform entry multiples, enabling meaningful multiple arbitrage for PE sponsors pursuing roll-up strategies.',
        sources: [
          { name: 'Houlihan Lokey Healthcare M&A Data', year: '2025', verified: true },
        ],
      },
    ],
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Strong exit optionality via strategic sale',
    description: 'Strategic buyers (Medtronic, Philips, Danaher, 3M, Getinge) are actively acquiring in this space at premium multiples. A PE-backed platform built to $200M+ revenue would attract competitive tension from at least 4–5 strategic bidders at exit, supporting a 15–18x exit multiple — a 2–4x turn expansion over entry.',
    claims: [
      {
        claim: 'Strategic acquirers paid a median 15.8% control premium over financial sponsors in contested respiratory monitoring auctions, validating the PE-to-strategic exit pathway as a reliable value realization mechanism.',
        sources: [
          { name: 'Goldman Sachs Equity Research', year: '2025', verified: true },
          { name: 'Dealogic Sector Analysis', year: '2025', verified: true },
        ],
      },
    ],
  },
  {
    id: '4',
    type: 'risk',
    title: 'Strategic buyer competition may bid up entry prices',
    description: 'Medtronic (14.1x), Philips (12.5x), and Danaher (11.2x) are actively consolidating the space. In contested auctions involving both strategics and PE, strategics have consistently prevailed on price — increasing the risk that the fund overpays or loses auctions on its target assets.',
    claims: [
      {
        claim: 'In 6 bilateral processes tracked over 2024–2025, strategic buyers outbid financial sponsors by an average of 18% on final offer price, driven by synergy credits that PE sponsors cannot replicate.',
        sources: [
          { name: 'Mergermarket Auction Analytics', year: '2025', verified: true },
          { name: 'Jefferies MedTech Banking Insights', year: '2024', verified: true },
        ],
      },
      {
        claim: 'Win rate for PE sponsors in respiratory monitoring auctions has declined from 42% (2022) to 28% (2025), as strategics become more aggressive in the $200M–$600M EV range.',
        sources: [
          { name: 'PitchBook Deal Multiples Report', year: '2025', verified: true },
        ],
      },
    ],
  },
  {
    id: '5',
    type: 'risk',
    title: 'Margin pressure on pure hardware assets limits value creation',
    description: 'LungGuard (8.9x) and CapnoStream (11.2x) show that commoditized hardware with limited software attachment trades at 4–6x turns below software-enabled peers. If the fund targets a hardware-heavy platform without a clear software/data monetization roadmap, EBITDA expansion via pricing power will be limited and the exit multiple may compress.',
    claims: [
      {
        claim: 'Gross margins for pure-play respiratory hardware companies averaged 42%, vs. 72% for software-enabled respiratory monitoring — directly limiting EBITDA expansion potential under PE ownership.',
        sources: [
          { name: 'Bain & Company MedTech M&A Report', year: '2024', verified: true },
          { name: 'Capital IQ Screening Data', year: '2025', verified: true },
        ],
      },
      {
        claim: 'Hardware-only respiratory companies experienced 1.5–2.0x EV/EBITDA multiple compression at exit vs. entry over a 5-year hold period, while software-enabled peers saw 2.0–3.0x expansion.',
        sources: [
          { name: 'Cambridge Associates PE Benchmark', year: '2025', verified: true },
          { name: 'Transaction Comp Set Analysis', year: '2025', verified: false },
        ],
      },
    ],
  },
  {
    id: '6',
    type: 'risk',
    title: 'Regulatory and reimbursement risk in key markets',
    description: 'FDA 510(k) clearance timelines for respiratory monitoring devices have extended from 6 to 11 months on average since 2023, and CMS reimbursement cuts for durable medical equipment (DME) in 2025 may compress revenue for home-care-focused targets. The fund should stress-test underwriting assumptions against a -10% reimbursement scenario.',
    claims: [
      {
        claim: 'CMS proposed a 3.6% reduction in DME reimbursement rates for respiratory equipment effective FY2026, directly impacting home-care monitoring revenue streams for 4 of 9 included targets.',
        sources: [
          { name: 'CMS FY2026 Proposed Rule', year: '2025', verified: true },
          { name: 'AdvaMed Regulatory Tracker', year: '2025', verified: true },
        ],
      },
      {
        claim: 'Average FDA 510(k) review time for respiratory devices increased 83% (6→11 months) since 2023, creating product launch delays that erode first-mover advantage for AI-enabled entrants.',
        sources: [
          { name: 'FDA CDRH Annual Report', year: '2025', verified: true },
        ],
      },
    ],
  },
];

export const CHAT_HISTORY = [
  {
    role: 'assistant',
    content: "I've analyzed the uploaded documents for **NovaPulse Medical**. Based on the company profile, I've identified 15 highly relevant precedent transactions.\n\nWould you like me to refine the list based on specific geography or deal size constraints?",
    timestamp: '10:23 AM'
  },
  {
    role: 'user',
    content: "Show me only transactions above $100M EV.",
    timestamp: '10:25 AM'
  },
  {
    role: 'assistant',
    content: "I've filtered the list. 4 transactions were removed. The average EV/EBITDA multiple for the remaining set is **13.2x**.",
    timestamp: '10:25 AM'
  }
];
