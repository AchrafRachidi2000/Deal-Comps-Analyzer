import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Linkedin, 
  Globe, 
  Info,
  ExternalLink,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { MOCK_TRANSACTIONS, Transaction } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function ResultsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [filter, setFilter] = useState<'all' | 'included' | 'excluded'>('all');

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'included') return tx.status === 'Selected';
    if (filter === 'excluded') return tx.status === 'Excluded';
    return true;
  });

  const toggleStatus = (id: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        return {
          ...tx,
          status: tx.status === 'Selected' ? 'Excluded' : 'Selected'
        };
      }
      return tx;
    }));
  };

  const counts = {
    all: transactions.length,
    included: transactions.filter(tx => tx.status === 'Selected').length,
    excluded: transactions.filter(tx => tx.status === 'Excluded').length
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white sticky top-0 z-20">
        <FilterTab 
          label="All Transactions" 
          count={counts.all} 
          active={filter === 'all'} 
          onClick={() => setFilter('all')} 
        />
        <FilterTab 
          label="Included" 
          count={counts.included} 
          active={filter === 'included'} 
          onClick={() => setFilter('included')} 
          color="green"
        />
        <FilterTab 
          label="Excluded" 
          count={counts.excluded} 
          active={filter === 'excluded'} 
          onClick={() => setFilter('excluded')} 
          color="red"
        />
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left border-collapse min-w-[1600px]">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 w-10 border-b border-gray-200 bg-gray-50 sticky left-0 z-20">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky left-10 bg-gray-50 z-20 w-[300px]">Target</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[100px]">Action</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">Deal Size</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">EV</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[120px]">EBITDA</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[100px]">Multiple</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[200px]">Buyer</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[150px]">Location</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[150px]">
                <div className="flex items-center gap-1">
                  Similarity
                  <Info className="w-3 h-3" />
                </div>
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[250px]">News</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-[300px]">Reasoning</th>
              <th className="p-4 w-10 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.map((tx) => (
              // @ts-ignore
              <TableRow key={tx.id} tx={tx} onToggle={() => toggleStatus(tx.id)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterTab({ label, count, active, onClick, color = 'gray' }: { label: string, count: number, active: boolean, onClick: () => void, color?: 'gray' | 'green' | 'red' }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
        active 
          ? "bg-gray-100 text-gray-900" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      )}
    >
      {label}
      <span className={cn(
        "px-2 py-0.5 rounded-full text-xs",
        active ? "bg-white shadow-sm" : "bg-gray-100",
        color === 'green' && active ? "text-green-700" : "",
        color === 'red' && active ? "text-red-700" : ""
      )}>
        {count}
      </span>
    </button>
  );
}

interface TableRowProps {
  tx: Transaction;
  onToggle: () => void;
}

function TableRow({ tx, onToggle }: TableRowProps) {
  const isExcluded = tx.status === 'Excluded';

  return (
    <tr className={cn(
      "hover:bg-gray-50 transition-colors group",
      isExcluded ? "bg-gray-50/50" : ""
    )}>
      <td className="p-4 align-top sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-transparent group-hover:border-gray-100">
        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
      </td>
      
      <td className="p-4 align-top sticky left-10 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 transition-opacity",
            isExcluded ? "bg-gray-200 text-gray-500 opacity-50" : "bg-gray-900 text-white"
          )}>
            {tx.targetCompany.substring(0, 2).toUpperCase()}
          </div>
          <div className={cn("transition-opacity", isExcluded ? "opacity-50" : "")}>
            <div className="font-semibold text-gray-900">{tx.targetCompany}</div>
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
            <>
              <PlusCircle className="w-3.5 h-3.5" /> Include
            </>
          ) : (
            <>
              <MinusCircle className="w-3.5 h-3.5" /> Exclude
            </>
          )}
        </button>
      </td>

      <td className="p-4 align-top whitespace-nowrap">
        <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.dealSize}M</span>
      </td>

      <td className="p-4 align-top whitespace-nowrap">
        <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.enterpriseValue}M</span>
      </td>

      <td className="p-4 align-top whitespace-nowrap">
        <span className={cn("font-medium text-gray-900", isExcluded && "text-gray-500")}>${tx.ebitda}M</span>
      </td>

      <td className="p-4 align-top">
        {tx.evEbitdaMultiple > 0 ? (
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
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        )}
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
