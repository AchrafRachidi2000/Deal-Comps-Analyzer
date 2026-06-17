export type BuyerType = 'Strategic' | 'Financial';
export type Status = 'Included' | 'Excluded';

export interface CompTransaction {
  id: string;
  targetCompany: string;
  targetDescription: string;
  sector: string;
  region: string;
  location: string;
  countryCode: string;
  announcementDate: string; // ISO YYYY-MM-DD
  buyer: string;
  buyerType: BuyerType;
  employees: number | null;
  dealSize: number | null;
  currency: string;
  revenue: number | null;
  ebitda: number | null;
  ebit: number | null;
  enterpriseValue: number | null;
  evRevenueMultiple: number | null;
  evEbitdaMultiple: number | null;
  evEbitMultiple: number | null;
  status: Status;
}

export interface RangeFilter {
  min: number | null;
  max: number | null;
}

export interface DealCompFilters {
  transactionAge: RangeFilter; // years since announcement
  sector: string[];
  buyerType: BuyerType[];
  geography: string[];
  employees: RangeFilter;
  revenue: RangeFilter;
  ebitda: RangeFilter;
  evEbitda: RangeFilter;
  evRevenue: RangeFilter;
}

export interface PresetCompany {
  id: string;
  name: string;
  description: string;
  presetFilters: DealCompFilters;
  transactions: CompTransaction[];
}

export const SECTORS = [
  'Fintech',
  'AI / ML',
  'Software',
  'Consumer',
  'Hardware',
  'Industrial',
  'Media & Data',
  'Healthcare',
];

export const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];

export const BUYER_TYPES: BuyerType[] = ['Strategic', 'Financial'];

export const EMPTY_FILTERS: DealCompFilters = {
  transactionAge: { min: null, max: null },
  sector: [],
  buyerType: [],
  geography: [],
  employees: { min: null, max: null },
  revenue: { min: null, max: null },
  ebitda: { min: null, max: null },
  evEbitda: { min: null, max: null },
  evRevenue: { min: null, max: null },
};
