import type { CompTransaction } from '@/dealCompsV1/data/types';
import { formatMoney, formatMultiple, formatNumber, formatDate } from './format';

export type ColumnGroup = 'Company' | 'Transaction' | 'Multiples';

export interface ColumnDef {
  key: string;
  label: string;
  group: ColumnGroup;
  align: 'left' | 'right';
  alwaysOn?: boolean;
  defaultVisible: boolean;
  value: (t: CompTransaction) => string | number | null;
  display: (t: CompTransaction) => string;
}

export const COLUMN_DEFS: ColumnDef[] = [
  { key: 'target', label: 'Target', group: 'Company', align: 'left', alwaysOn: true, defaultVisible: true,
    value: (t) => t.targetCompany, display: (t) => t.targetCompany },
  { key: 'similarity', label: 'Similarity', group: 'Company', align: 'left', defaultVisible: true,
    value: (t) => t.similarityScore, display: (t) => `${t.similarityScore}%` },
  { key: 'sector', label: 'Sector', group: 'Company', align: 'left', defaultVisible: true,
    value: (t) => t.sector, display: (t) => t.sector },
  { key: 'geography', label: 'Geography', group: 'Company', align: 'left', defaultVisible: true,
    value: (t) => t.location, display: (t) => t.location },
  { key: 'employees', label: 'Employees', group: 'Company', align: 'right', defaultVisible: false,
    value: (t) => t.employees, display: (t) => formatNumber(t.employees) },
  { key: 'announcementDate', label: 'Announced', group: 'Transaction', align: 'left', defaultVisible: true,
    value: (t) => t.announcementDate, display: (t) => formatDate(t.announcementDate) },
  { key: 'buyer', label: 'Buyer', group: 'Transaction', align: 'left', defaultVisible: true,
    value: (t) => t.buyer, display: (t) => t.buyer },
  { key: 'buyerType', label: 'Buyer Type', group: 'Transaction', align: 'left', defaultVisible: true,
    value: (t) => t.buyerType, display: (t) => t.buyerType },
  { key: 'dealSize', label: 'Deal Size', group: 'Transaction', align: 'right', defaultVisible: true,
    value: (t) => t.dealSize, display: (t) => formatMoney(t.dealSize) },
  { key: 'enterpriseValue', label: 'EV', group: 'Transaction', align: 'right', defaultVisible: true,
    value: (t) => t.enterpriseValue, display: (t) => formatMoney(t.enterpriseValue) },
  { key: 'revenue', label: 'Revenue', group: 'Transaction', align: 'right', defaultVisible: true,
    value: (t) => t.revenue, display: (t) => formatMoney(t.revenue) },
  { key: 'ebitda', label: 'EBITDA', group: 'Transaction', align: 'right', defaultVisible: true,
    value: (t) => t.ebitda, display: (t) => formatMoney(t.ebitda) },
  { key: 'evEbitdaMultiple', label: 'EV/EBITDA', group: 'Multiples', align: 'right', defaultVisible: true,
    value: (t) => t.evEbitdaMultiple, display: (t) => formatMultiple(t.evEbitdaMultiple) },
  { key: 'evRevenueMultiple', label: 'EV/Revenue', group: 'Multiples', align: 'right', defaultVisible: true,
    value: (t) => t.evRevenueMultiple, display: (t) => formatMultiple(t.evRevenueMultiple) },
];

export function defaultVisibleColumns(): Set<string> {
  return new Set(COLUMN_DEFS.filter((c) => c.defaultVisible).map((c) => c.key));
}

export function toggleColumn(visible: Set<string>, key: string): Set<string> {
  const def = COLUMN_DEFS.find((c) => c.key === key);
  const next = new Set(visible);
  if (def?.alwaysOn) return next; // cannot hide
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}
