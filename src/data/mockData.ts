export interface Transaction {
  id: string;
  targetCompany: string;
  targetDescription: string;
  dealDate: string;
  buyer: string;
  buyerType: 'Strategic' | 'Financial' | 'Hybrid';
  advisor: string;
  dealSize: number; // in millions
  currency: string;
  ebitda: number; // in millions
  enterpriseValue: number; // in millions
  evEbitdaMultiple: number;
  status: 'Selected' | 'Excluded';
  reasoning: string; // Why it's a good comp
  multipleComment: string; // Why multiple is high/low
  location: string;
  countryCode: string; // for flags
  similarityScore: number;
  newsLink: string;
  newsTitle: string;
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
    status: 'Selected',
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
    enterpriseValue: 310, // Converted roughly
    evEbitdaMultiple: 12.5,
    status: 'Selected',
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
    status: 'Selected',
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
    status: 'Selected',
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
    evEbitdaMultiple: 0, // N/A
    status: 'Excluded',
    reasoning: 'Pre-profitability, distressed asset sale.',
    multipleComment: 'N/A - Negative EBITDA.',
    location: 'France',
    countryCode: 'FR',
    similarityScore: 45,
    newsLink: '#',
    newsTitle: 'Hillrom acquires distressed ventilator maker VentilateNow'
  },
  {
    id: '6',
    targetCompany: 'BreatheEasy Systems',
    targetDescription: 'Home sleep apnea testing devices.',
    dealDate: '2025-01-20',
    buyer: 'ResMed',
    buyerType: 'Strategic',
    advisor: 'Jefferies',
    dealSize: 1500,
    currency: 'USD',
    ebitda: 110,
    enterpriseValue: 1500,
    evEbitdaMultiple: 13.6,
    status: 'Selected',
    reasoning: 'Market leader in adjacent sleep apnea space.',
    multipleComment: 'Solid multiple for market leader.',
    location: 'Australia',
    countryCode: 'AU',
    similarityScore: 60,
    newsLink: '#',
    newsTitle: 'ResMed consolidates market position with BreatheEasy acquisition'
  }
];

export const STATISTICS = {
  totalConsidered: 142,
  filteredOutHard: 85,
  filteredOutSoft: 30,
  lackingData: 12,
  finalListCount: 15,
};

export const CHAT_HISTORY = [
  {
    role: 'assistant',
    content: "I've analyzed the uploaded documents for **Respiratory Monitoring Devices**. Based on the company profile, I've identified 15 highly relevant precedent transactions.\n\nWould you like me to refine the list based on specific geography or deal size constraints?",
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
