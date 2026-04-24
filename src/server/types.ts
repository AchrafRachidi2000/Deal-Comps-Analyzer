import type { Peer } from '../publicComps/data/mockData.js';

export interface DiscoveredPeer {
  ticker: string;
  companyName: string;
  description: string;
  rationale: string;
  similarityScore: number;
}

export interface CustomConstraint {
  label: string;
  value: string;
}

export interface ParsedFilters {
  company: string | null;
  sector: string | null;
  geography: string | null;
  marketCap: string | null;
  revenue: string | null;
  qualitative: string | null;
}

export interface CompanyEnrichment {
  description: string;
  filters: ParsedFilters;
}

export interface InsightsRequest {
  targetCompany: string;
  peers: Array<{
    ticker: string;
    companyName: string;
    country: string | null;
    marketCap: number | null;
    enterpriseValue: number | null;
    revenueLTM: number | null;
    ebitdaLTM: number | null;
    ebitdaMargin: number | null;
    revenueGrowthYoY: number | null;
    evRevenueLTM: number | null;
    evEbitdaLTM: number | null;
    peLTM: number | null;
    revenueNTM: number | null;
    ntmRevenueGrowth: number | null;
    evRevenueNTM: number | null;
    netDebtToEbitda: number | null;
  }>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type AssistantStatePeer = Peer;

export interface AssistantState {
  mode: 'landing' | 'dashboard';
  targetCompany: string;
  description?: string;
  filters?: ParsedFilters;
  customFilters?: CustomConstraint[];
  peers: AssistantStatePeer[];
  insights?: string | null;
}

export interface AssistantChatRequest {
  state: AssistantState;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export type Emit = (event: string, data: any) => void;
