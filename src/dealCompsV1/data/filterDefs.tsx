import React from 'react';
import { Building2, Briefcase, Globe, Users, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import type { DealCompFilters } from './types';
import { SECTORS, BUYER_TYPES } from './types';

export type FilterKind = 'single' | 'multi' | 'geo' | 'range' | 'date';

export interface FilterDef {
  key: keyof DealCompFilters;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  kind: FilterKind;
  options?: string[];
  /** Fixed slider bounds (range filters only). */
  min?: number;
  max?: number;
  unit?: string;
  suffix?: string;
  step?: number;
}

export const FILTER_DEFS: FilterDef[] = [
  { key: 'announcementDate', label: 'Announcement Date', shortLabel: 'Date', icon: <Calendar className="w-3 h-3" />, kind: 'date' },
  { key: 'sector', label: 'Sector', shortLabel: 'Sector', icon: <Building2 className="w-3 h-3" />, kind: 'single', options: SECTORS },
  { key: 'buyerType', label: 'Buyer Type', shortLabel: 'Buyer', icon: <Briefcase className="w-3 h-3" />, kind: 'multi', options: BUYER_TYPES },
  { key: 'geography', label: 'Geography', shortLabel: 'Geo', icon: <Globe className="w-3 h-3" />, kind: 'geo' },
  { key: 'employees', label: 'Employees', shortLabel: 'Employees', icon: <Users className="w-3 h-3" />, kind: 'range', min: 0, max: 10000, step: 100 },
  { key: 'revenue', label: 'Revenue', shortLabel: 'Revenue', icon: <BarChart3 className="w-3 h-3" />, kind: 'range', min: 0, max: 10000, unit: '$', suffix: 'M', step: 50 },
  { key: 'ebitda', label: 'EBITDA', shortLabel: 'EBITDA', icon: <BarChart3 className="w-3 h-3" />, kind: 'range', min: 0, max: 10000, unit: '$', suffix: 'M', step: 50 },
  { key: 'evEbitda', label: 'EV / EBITDA', shortLabel: 'EV/EBITDA', icon: <TrendingUp className="w-3 h-3" />, kind: 'range', min: 0, max: 100, suffix: 'x', step: 0.5 },
  { key: 'evRevenue', label: 'EV / Revenue', shortLabel: 'EV/Rev', icon: <TrendingUp className="w-3 h-3" />, kind: 'range', min: 0, max: 100, suffix: 'x', step: 0.5 },
];
