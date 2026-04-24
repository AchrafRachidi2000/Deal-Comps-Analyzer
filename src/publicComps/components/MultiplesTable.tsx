import React, { useMemo, useState } from 'react';
import {
  MinusCircle,
  PlusCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MoreHorizontal,
} from 'lucide-react';
import { Peer } from '@/publicComps/data/mockData';
import { formatMoney, formatMultiple, formatPercent, formatNumber } from '@/publicComps/lib/stats';
import { cn } from '@/lib/utils';

type SortKey =
  | 'ticker'
  | 'marketCap'
  | 'enterpriseValue'
  | 'revenueLTM'
  | 'ebitdaLTM'
  | 'ebitdaMargin'
  | 'revenueGrowthYoY'
  | 'evRevenueLTM'
  | 'evEbitdaLTM'
  | 'peLTM'
  | 'revenueNTM'
  | 'ebitdaNTM'
  | 'ntmRevenueGrowth'
  | 'evRevenueNTM'
  | 'evEbitdaNTM'
  | 'netDebtToEbitda';
type SortDir = 'asc' | 'desc';

interface MultiplesTableProps {
  peers: Peer[];
  onTogglePeer: (ticker: string) => void;
}

export function MultiplesTable({ peers, onTogglePeer }: MultiplesTableProps) {
  const [filter, setFilter] = useState<'all' | 'included' | 'excluded'>('all');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = peers.filter((p) => {
      if (filter === 'all') return true;
      if (filter === 'included') return p.status === 'Included';
      if (filter === 'excluded') return p.status === 'Excluded';
      return true;
    });

    if (sortKey) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
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
  }, [peers, filter, sortKey, sortDir]);

  const counts = {
    all: peers.length,
    included: peers.filter((p) => p.status === 'Included').length,
    excluded: peers.filter((p) => p.status === 'Excluded').length,
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white">
        <FilterTab label="All Peers" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Included" count={counts.included} active={filter === 'included'} onClick={() => setFilter('included')} color="green" />
        <FilterTab label="Excluded" count={counts.excluded} active={filter === 'excluded'} onClick={() => setFilter('excluded')} color="amber" />
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse min-w-[2400px]">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label="Peer" sortKey="ticker" currentKey={sortKey} dir={sortDir} onSort={handleSort} sticky className="w-[260px]" />
              <SortableHeader label="Ticker" sortKey="ticker" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[110px]" />
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">Action</th>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">Country</th>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[130px]">Ref Date</th>
              <SortableHeader label="Market Cap" sortKey="marketCap" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="EV" sortKey="enterpriseValue" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="LTM Rev" sortKey="revenueLTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[110px]" />
              <SortableHeader label="LTM EBITDA" sortKey="ebitdaLTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="EBITDA Margin" sortKey="ebitdaMargin" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="Rev Growth (YoY)" sortKey="revenueGrowthYoY" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[130px]" />
              <SortableHeader label="EV / Rev (LTM)" sortKey="evRevenueLTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px]" />
              <SortableHeader label="EV / EBITDA (LTM)" sortKey="evEbitdaLTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[130px]" />
              <SortableHeader label="P / E (LTM)" sortKey="peLTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[110px]" />
              <SortableHeader label="NTM Rev" sortKey="revenueNTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[110px] bg-indigo-50/40" />
              <SortableHeader label="NTM EBITDA" sortKey="ebitdaNTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px] bg-indigo-50/40" />
              <SortableHeader label="NTM Rev Growth" sortKey="ntmRevenueGrowth" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[130px] bg-indigo-50/40" />
              <SortableHeader label="EV / Rev (NTM)" sortKey="evRevenueNTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[120px] bg-indigo-50/40" />
              <SortableHeader label="EV / EBITDA (NTM)" sortKey="evEbitdaNTM" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[130px] bg-indigo-50/40" />
              <SortableHeader label="Net Debt / EBITDA" sortKey="netDebtToEbitda" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="w-[130px]" />
              <th className="p-3 w-10 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSorted.map((peer) => (
              <MultiplesRow key={peer.ticker} peer={peer} onToggle={() => onTogglePeer(peer.ticker)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MultiplesRow({ peer, onToggle }: { peer: Peer; onToggle: () => void; key?: string }) {
  const isExcluded = peer.status === 'Excluded';

  return (
    <tr className={cn('hover:bg-gray-50 transition-colors group', isExcluded && 'bg-amber-50/30')}>
      <td
        className={cn(
          'p-3 align-top sticky left-0 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]',
          isExcluded ? 'bg-amber-50/30 group-hover:bg-gray-50' : 'bg-white group-hover:bg-gray-50'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 transition-opacity',
              isExcluded ? 'bg-gray-200 text-gray-500 opacity-50' : 'bg-gray-900 text-white'
            )}
          >
            {peer.ticker}
          </div>
          <div className={cn('transition-opacity min-w-0', isExcluded && 'opacity-60')}>
            <div className="font-semibold text-gray-900 text-sm">{peer.companyName}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-[180px]">{peer.description}</div>
          </div>
        </div>
      </td>

      <td className="p-3 align-top">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border',
            isExcluded
              ? 'bg-gray-100 text-gray-500 border-gray-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          )}
        >
          {peer.ticker}
        </span>
      </td>

      <td className="p-3 align-top">
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border',
            isExcluded
              ? 'bg-white border-gray-300 text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
              : 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100'
          )}
        >
          {isExcluded ? (
            <><PlusCircle className="w-3 h-3" /> Include</>
          ) : (
            <><MinusCircle className="w-3 h-3" /> Exclude</>
          )}
        </button>
      </td>

      <td className="p-3 align-top">
        <div className={cn('flex items-center gap-2', isExcluded && 'opacity-50')}>
          <img
            src={`https://flagcdn.com/w20/${peer.countryCode.toLowerCase()}.png`}
            alt={peer.countryCode}
            className="w-5 h-auto rounded-sm shadow-sm"
          />
          <span className="text-xs text-gray-700 whitespace-nowrap">{peer.country}</span>
        </div>
      </td>

      <td className="p-3 align-top">
        <span className={cn('text-xs text-gray-600 whitespace-nowrap', isExcluded && 'text-gray-400')}>
          {peer.referenceDate}
        </span>
        <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">FYE: {peer.fiscalYearEnd}</div>
      </td>

      <NumericCell value={peer.marketCap} money isExcluded={isExcluded} />
      <NumericCell value={peer.enterpriseValue} money isExcluded={isExcluded} />
      <NumericCell value={peer.revenueLTM} money isExcluded={isExcluded} />
      <NumericCell value={peer.ebitdaLTM} money isExcluded={isExcluded} />

      <PercentCell value={peer.ebitdaMargin} isExcluded={isExcluded} />
      <PercentCell value={peer.revenueGrowthYoY} isExcluded={isExcluded} />

      <MultipleCell value={peer.evRevenueLTM} tone="blue" isExcluded={isExcluded} />
      <MultipleCell value={peer.evEbitdaLTM} tone="indigo" isExcluded={isExcluded} />
      <MultipleCell value={peer.peLTM} tone="purple" isExcluded={isExcluded} />

      <NumericCell value={peer.revenueNTM} money isExcluded={isExcluded} ntm />
      <NumericCell value={peer.ebitdaNTM} money isExcluded={isExcluded} ntm />
      <PercentCell value={peer.ntmRevenueGrowth} isExcluded={isExcluded} ntm />
      <MultipleCell value={peer.evRevenueNTM} tone="blue" isExcluded={isExcluded} ntm />
      <MultipleCell value={peer.evEbitdaNTM} tone="indigo" isExcluded={isExcluded} ntm />

      <LeverageCell value={peer.netDebtToEbitda} isExcluded={isExcluded} />

      <td className="p-3 align-top text-right">
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

function NumericCell({
  value,
  money,
  isExcluded,
  ntm,
}: {
  value: number | null;
  money?: boolean;
  isExcluded: boolean;
  ntm?: boolean;
}) {
  return (
    <td className={cn('p-3 align-top whitespace-nowrap tabular-nums', ntm && 'bg-indigo-50/20')}>
      {value !== null ? (
        <span className={cn('font-medium text-gray-900 text-sm', isExcluded && 'text-gray-500')}>
          {money ? formatMoney(value) : value.toLocaleString()}
        </span>
      ) : (
        <MissingValue />
      )}
    </td>
  );
}

function PercentCell({
  value,
  isExcluded,
  ntm,
}: {
  value: number | null;
  isExcluded: boolean;
  ntm?: boolean;
}) {
  return (
    <td className={cn('p-3 align-top whitespace-nowrap tabular-nums', ntm && 'bg-indigo-50/20')}>
      {value !== null && Number.isFinite(value) ? (
        <span
          className={cn(
            'text-sm font-medium',
            isExcluded
              ? 'text-gray-500'
              : value > 0
              ? 'text-gray-900'
              : 'text-red-600'
          )}
        >
          {formatPercent(value)}
        </span>
      ) : (
        <MissingValue />
      )}
    </td>
  );
}

function LeverageCell({ value, isExcluded }: { value: number | null; isExcluded: boolean }) {
  return (
    <td className="p-3 align-top whitespace-nowrap tabular-nums">
      {value !== null && Number.isFinite(value) ? (
        <span
          className={cn(
            'text-sm font-medium',
            isExcluded ? 'text-gray-500' : value > 3 ? 'text-amber-700' : 'text-gray-900'
          )}
        >
          {formatNumber(value)}x
        </span>
      ) : (
        <MissingValue />
      )}
    </td>
  );
}

function MultipleCell({
  value,
  tone,
  isExcluded,
  ntm,
}: {
  value: number | null;
  tone: 'blue' | 'indigo' | 'purple';
  isExcluded: boolean;
  ntm?: boolean;
}) {
  const toneClass =
    tone === 'blue' ? 'bg-blue-100 text-blue-800' : tone === 'indigo' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800';
  return (
    <td className={cn('p-3 align-top tabular-nums', ntm && 'bg-indigo-50/20')}>
      {value !== null && Number.isFinite(value) && value > 0 ? (
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit',
            isExcluded ? 'bg-gray-100 text-gray-500' : toneClass
          )}
        >
          {formatMultiple(value)}
        </span>
      ) : (
        <MissingValue />
      )}
    </td>
  );
}

function MissingValue() {
  return <span className="text-gray-300 font-medium">—</span>;
}

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
        'p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:text-gray-700 select-none',
        sticky && 'sticky left-0 bg-gray-50 z-20',
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

function FilterTab({
  label,
  count,
  active,
  onClick,
  color = 'gray',
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: 'gray' | 'green' | 'amber';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      )}
    >
      {label}
      <span
        className={cn(
          'px-2 py-0.5 rounded-full text-xs',
          active ? 'bg-white shadow-sm' : 'bg-gray-100',
          color === 'green' && active ? 'text-green-700' : '',
          color === 'amber' && active ? 'text-amber-700' : ''
        )}
      >
        {count}
      </span>
    </button>
  );
}
