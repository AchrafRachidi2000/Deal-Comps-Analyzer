import * as XLSX from 'xlsx';
import type { CompTransaction } from '@/dealCompsV1/data/types';
import type { ColumnDef } from './columns';
import type { MultipleStat } from './stats';

export function toExportObjects(
  rows: CompTransaction[],
  columns: ColumnDef[]
): Record<string, string | number | null>[] {
  return rows.map((t) => {
    const obj: Record<string, string | number | null> = {};
    for (const c of columns) obj[c.label] = c.value(t);
    return obj;
  });
}

function csvCell(value: string | number | null): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildCsv(rows: CompTransaction[], columns: ColumnDef[]): string {
  const header = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((t) => columns.map((c) => csvCell(c.value(t))).join(',')).join('\n');
  return body ? `${header}\n${body}` : header;
}

export function buildWorkbook(
  rows: CompTransaction[],
  columns: ColumnDef[],
  stats: MultipleStat[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const summary = stats.map((s) => ({
    Multiple: s.label,
    Min: s.min,
    Median: s.median,
    Max: s.max,
    N: s.n,
  }));
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  wsSummary['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 6 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const objects = toExportObjects(rows, columns);
  const wsRows = XLSX.utils.json_to_sheet(
    objects.length ? objects : [Object.fromEntries(columns.map((c) => [c.label, '']))]
  );
  wsRows['!cols'] = columns.map((c) => ({ wch: Math.min(Math.max(c.label.length + 2, 12), 40) }));
  XLSX.utils.book_append_sheet(wb, wsRows, 'Transactions');

  return wb;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadWorkbook(filename: string, wb: XLSX.WorkBook): void {
  XLSX.writeFile(wb, filename);
}
