import React, { useState, useMemo } from 'react';
import {
  MoreHorizontal,
  Linkedin,
  Globe,
  Info,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import { Transaction } from '@/data/mockData';
import { cn } from '@/lib/utils';

type SortKey =
  | 'dealDate'
  | 'targetCompany'
  | 'dealSize'
  | 'enterpriseValue'
  | 'revenue'
  | 'ebitda'
  | 'evRevenueMultiple'
  | 'evEbitdaMultiple'
  | 'similarityScore';
type SortDir = 'asc' | 'desc';

interface ResultsTableProps {
  transactions: Transaction[];
  originallyExcluded: Set<string>;
  onToggleStatus: (id: string) => void;
}

export function ResultsTable({ transactions, originallyExcluded, onToggleStatus }: ResultsTableProps) {
  const [filter, setFilter] = useState<'all' | 'included' | 'excluded'>('all');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = transactions.filter(tx => {
      if (filter === 'all') return true;
      if (filter === 'included') return tx.status === 'Included';
      if (filter === 'excluded') return tx.status === 'Excluded';
      return true;
    });

    if (sortKey) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        // nulls go to the end
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }

    return list;
  }, [transactions, filter, sortKey, sortDir]);

  const counts = {
    all: transactions.length,
    included: transactions.filter(tx => tx.status === 'Included').length,
    excluded: transactions.filter(tx => tx.status === 'Excluded').length,
  };

  return (
    <div className="flex flex-col">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white">
        <FilterTab label="All Transactions" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Included" count={counts.included} active={filter === 'included'} onClick={() => setFilter('included')} color="green" />
        <FilterTab label="Excluded" count={counts.excluded} active={filter === 'excluded'} onClick={() => setFilter('excluded')} color="amber" subtitle="Incomplete data" />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse min-w-[1900px]">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label="Target" sortKey="targetCompany" currentKey={sortKey} dir={sortDir} onSort={handleSort} sticky className="w-[300px]" />
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">Action</th>
              <SortableHeader label="Date" sortKey="dealDate" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[100px]" />
              <SortableHeader label="Deal Size" sortKey="dealSize" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="EV ($M)" sortKey="enterpriseValue" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="LTM Rev ($M)" sortKey="revenue" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="LTM EBITDA ($M)" sortKey="ebitda" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="TEV / Rev" sortKey="evRevenueMultiple" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[100px]" />
              <SortableHeader label="TEV / EBITDA" sortKey="evEbitdaMultiple" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[100px]" />
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[200px]">Buyer</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[150px]">Location</th>
              <SortableHeader label="Similarity" sortKey="similarityScore" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[150px]" />
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[250px]">News</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-[300px]">Reasoning</th>
              <th className="p-4 w-10 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSorted.map((tx) => (
              <TableRow
                key={tx.id}
                tx={tx}
                hasWarning={originallyExcluded.has(tx.id) && tx.status === 'Included'}
                onToggle={() => onToggleStatus(tx.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Sortable column header ── */

function SortableHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
  sticky,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  sticky?: boolean;
  className?: string;
}) {
  const active = currentKey === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={cn(
        "p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:text-gray-700 select-none",
        sticky && "sticky left-0 bg-gray-50 z-20",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );
}

/* ── Filter tab ── */

function FilterTab({ label, count, active, onClick, color = 'gray', subtitle }: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: 'gray' | 'green' | 'amber';
  subtitle?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
        active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      )}
    >
      {label}
      {subtitle && active && (
        <span className="text-[10px] text-gray-400 font-normal">({subtitle})</span>
      )}
      <span className={cn(
        "px-2 py-0.5 rounded-full text-xs",
        active ? "bg-white shadow-sm" : "bg-gray-100",
        color === 'green' && active ? "text-green-700" : "",
        color === 'amber' && active ? "text-amber-700" : ""
      )}>
        {count}
      </span>
    </button>
  );
}

/* ── Missing value placeholder ── */

function MissingValue() {
  return <span className="text-gray-300 font-medium">—</span>;
}

/* ── Table row ── */

function TableRow({ tx, hasWarning, onToggle }: { tx: Transaction; hasWarning: boolean; onToggle: () => void; key?: string }) {
  const isExcluded = tx.status === 'Excluded';

  return (
    <tr className={cn(
      "hover:bg-gray-50 transition-colors group",
      isExcluded ? "bg-amber-50/30" : ""
    )}>
      <td className={cn(
        "p-4 align-top sticky left-0 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]",
        isExcluded ? "bg-amber-50/30 group-hover:bg-gray-50" : "bg-white group-hover:bg-gray-50"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 transition-opacity",
            isExcluded ? "bg-gray-200 text-gray-500 opacity-50" : "bg-gray-900 text-white"
          )}>
            {tx.targetCompany.substring(0, 2).toUpperCase()}
          </div>
          <div className={cn("transition-opacity", isExcluded ? "opacity-60" : "")}>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900">{tx.targetCompany}</span>
              {hasWarning && (
                <span title="Originally excluded — incomplete data" className="flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-[200px]">{tx.targetDescription}</div>
            <div className="flex gap-2 mt-1.5">
              <button className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
                <Linkedin className="w-3 h-3" />
              </button>
              <button className="p-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
                <Globe className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </td>

      {/* Action */}
      <td className="p-4 align-top">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
            isExcluded
              ? "bg-white border-gray-300 text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
              : "bg-red-50 border-red-100 text-red-700 hover:bg-red-100"
          )}
        >
          {isExcluded ? (
            <><PlusCircle className="w-3.5 h-3.5" /> Include</>
          ) : (
            <><MinusCircle className="w-3.5 h-3.5" /> Exclude</>
          )}
        </button>
        {isExcluded && tx.exclusionReason && (
          <p className="text-[10px] text-amber-600/80 leading-tight max-w-[140px] mt-1">
            {tx.exclusionReason}
          </p>
        )}
      </td>

      {/* Announcement Date */}
      <td className="p-4 align-top whitespace-nowrap">
        <span className={cn("text-sm text-gray-700", isExcluded && "text-gray-400")}>
          {new Date(tx.dealDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </td>

      <td className="p-4 align-top whitespace-nowrap">
        {tx.dealSize !== null ? (
          <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.dealSize}M</span>
        ) : <MissingValue />}
      </td>

      <td className="p-4 align-top whitespace-nowrap">
        {tx.enterpriseValue !== null ? (
          <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.enterpriseValue}M</span>
        ) : <MissingValue />}
      </td>

      <td className="p-4 align-top whitespace-nowrap">
        {tx.revenue !== null ? (
          <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.revenue}M</span>
        ) : <MissingValue />}
      </td>

      <td className="p-4 align-top whitespace-nowrap">
        {tx.ebitda !== null ? (
          <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.ebitda}M</span>
        ) : <MissingValue />}
      </td>

      <td className="p-4 align-top">
        {tx.evRevenueMultiple !== null && tx.evRevenueMultiple > 0 ? (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit",
            isExcluded ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-800"
          )}>
            {tx.evRevenueMultiple}x
          </span>
        ) : <MissingValue />}
      </td>

      <td className="p-4 align-top">
        {tx.evEbitdaMultiple !== null && tx.evEbitdaMultiple > 0 ? (
          <div className="flex flex-col gap-1">
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit",
              isExcluded ? "bg-gray-100 text-gray-500" : "bg-indigo-100 text-indigo-800"
            )}>
              {tx.evEbitdaMultiple}x
            </span>
            <span className="text-[10px] text-gray-400 italic leading-tight max-w-[120px]">
              {tx.multipleComment}
            </span>
          </div>
        ) : <MissingValue />}
      </td>

      <td className="p-4 align-top">
        <div className={cn("space-y-1", isExcluded && "opacity-50")}>
          <div className="font-medium text-gray-900">{tx.buyer}</div>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
              {tx.buyerType}
            </span>
            {tx.advisor && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                Adv: {tx.advisor}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="p-4 align-top">
        <div className={cn("flex items-center gap-2", isExcluded && "opacity-50")}>
          <img
            src={`https://flagcdn.com/w20/${tx.countryCode.toLowerCase()}.png`}
            alt={tx.countryCode}
            className="w-5 h-auto rounded-sm shadow-sm"
          />
          <span className="text-sm text-gray-700">{tx.location}</span>
        </div>
      </td>

      <td className="p-4 align-top">
        <div className={cn("flex items-center gap-3", isExcluded && "opacity-50")}>
          <div className={cn(
            "text-sm font-bold",
            tx.similarityScore > 90 ? "text-green-600" :
            tx.similarityScore > 70 ? "text-emerald-600" : "text-amber-600"
          )}>
            {tx.similarityScore}%
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-1.5 rounded-full",
                  (tx.similarityScore / 20) >= i ? "bg-green-500" : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </td>

      <td className="p-4 align-top">
        <a
          href={tx.newsLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-start gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline leading-snug",
            isExcluded && "text-gray-400 hover:text-gray-600 hover:no-underline"
          )}
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
          {tx.newsTitle}
        </a>
      </td>

      <td className="p-4 align-top">
        <div className={cn("text-sm text-gray-600 leading-relaxed", isExcluded && "text-gray-400")}>
          {tx.reasoning}
        </div>
      </td>

      <td className="p-4 align-top text-right">
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}
