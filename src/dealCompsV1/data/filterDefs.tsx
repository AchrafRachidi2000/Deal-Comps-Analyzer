import React from 'react';
import { Building2, Briefcase, Globe, Users, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import type { CompTransaction, DealCompFilters } from './types';
import { SECTORS, REGIONS, BUYER_TYPES } from './types';

export type FilterKind = 'multi' | 'range' | 'date';

export interface FilterDef {
  key: keyof DealCompFilters;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  kind: FilterKind;
  options?: string[];
  /** CompTransaction numeric field used to derive slider extents (range filters only). */
  field?: keyof CompTransaction;
  unit?: string;
  suffix?: string;
  step?: number;
}

export const FILTER_DEFS: FilterDef[] = [
  { key: 'sector', label: 'Sector', shortLabel: 'Sector', icon: <Building2 className="w-3 h-3" />, kind: 'multi', options: SECTORS },
  { key: 'buyerType', label: 'Buyer Type', shortLabel: 'Buyer', icon: <Briefcase className="w-3 h-3" />, kind: 'multi', options: BUYER_TYPES },
  { key: 'geography', label: 'Geography', shortLabel: 'Geo', icon: <Globe className="w-3 h-3" />, kind: 'multi', options: REGIONS },
  { key: 'employees', label: 'Employees', shortLabel: 'Employees', icon: <Users className="w-3 h-3" />, kind: 'range', field: 'employees', step: 1 },
  { key: 'revenue', label: 'Revenue', shortLabel: 'Revenue', icon: <BarChart3 className="w-3 h-3" />, kind: 'range', field: 'revenue', unit: '$', suffix: 'M', step: 1 },
  { key: 'ebitda', label: 'EBITDA', shortLabel: 'EBITDA', icon: <BarChart3 className="w-3 h-3" />, kind: 'range', field: 'ebitda', unit: '$', suffix: 'M', step: 1 },
  { key: 'evEbitda', label: 'EV / EBITDA', shortLabel: 'EV/EBITDA', icon: <TrendingUp className="w-3 h-3" />, kind: 'range', field: 'evEbitdaMultiple', suffix: 'x', step: 0.1 },
  { key: 'evRevenue', label: 'EV / Revenue', shortLabel: 'EV/Rev', icon: <TrendingUp className="w-3 h-3" />, kind: 'range', field: 'evRevenueMultiple', suffix: 'x', step: 0.1 },
  { key: 'announcementDate', label: 'Announcement Date', shortLabel: 'Date', icon: <Calendar className="w-3 h-3" />, kind: 'date' },
];
