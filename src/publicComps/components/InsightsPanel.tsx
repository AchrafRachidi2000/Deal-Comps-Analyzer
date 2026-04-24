import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Peer } from '@/publicComps/data/mockData';
import { formatMultiple, formatNumber, formatPercent } from '@/publicComps/lib/stats';

interface InsightsPanelProps {
  peers: Peer[];
  insights?: string | null;
  loading?: boolean;
  error?: string | null;
  onRegenerate?: () => void;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  return n % 2 === 1 ? sorted[Math.floor(n / 2)] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

function findExtremes<T>(items: T[], getter: (t: T) => number | null): { min: T | null; max: T | null } {
  let min: T | null = null;
  let max: T | null = null;
  for (const item of items) {
    const v = getter(item);
    if (v === null || !Number.isFinite(v) || v <= 0) continue;
    if (min === null || (getter(min) as number) > v) min = item;
    if (max === null || (getter(max) as number) < v) max = item;
  }
  return { min, max };
}

export function InsightsPanel({
  peers,
  insights = null,
  loading = false,
  error = null,
  onRegenerate,
}: InsightsPanelProps) {
  const insight = useMemo(() => {
    const included = peers.filter((p) => p.status === 'Included');

    const evEbitdaVals = included.map((p) => p.evEbitdaLTM).filter((v): v is number => v !== null && v > 0);
    const evRevVals = included.map((p) => p.evRevenueLTM).filter((v): v is number => v !== null && v > 0);
    const revGrowthVals = included.map((p) => p.revenueGrowthYoY).filter((v): v is number => v !== null && Number.isFinite(v));
    const marginVals = included.map((p) => p.ebitdaMargin).filter((v): v is number => v !== null && Number.isFinite(v));
    const ntmGrowthVals = included.map((p) => p.ntmRevenueGrowth).filter((v): v is number => v !== null && Number.isFinite(v));
    const leverageVals = included.map((p) => p.netDebtToEbitda).filter((v): v is number => v !== null && Number.isFinite(v));

    const evEbitdaExtremes = findExtremes(included, (p) => p.evEbitdaLTM);
    const marginExtremes = findExtremes(included, (p) => p.ebitdaMargin);
    const leverageMax = included.reduce<Peer | null>((acc, p) => {
      const v = p.netDebtToEbitda;
      if (v === null || !Number.isFinite(v)) return acc;
      if (acc === null || (acc.netDebtToEbitda as number) < v) return p;
      return acc;
    }, null);

    return {
      count: included.length,
      medianEvEbitda: median(evEbitdaVals),
      medianEvRev: median(evRevVals),
      medianRevGrowth: median(revGrowthVals),
      medianMargin: median(marginVals),
      medianNtmGrowth: median(ntmGrowthVals),
      medianLeverage: median(leverageVals),
      highEvEbitda: evEbitdaExtremes.max,
      lowEvEbitda: evEbitdaExtremes.min,
      highMargin: marginExtremes.max,
      lowMargin: marginExtremes.min,
      highLeverage: leverageMax && leverageMax.netDebtToEbitda !== null && leverageMax.netDebtToEbitda > 3 ? leverageMax : null,
    };
  }, [peers]);

  if (insight.count === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-5">
        <p className="text-sm text-gray-500">No peers included — exclude fewer rows to generate insights.</p>
      </div>
    );
  }

  const isLLM = !!insights && insights.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Peer Set Insights</h3>
        <span className="ml-auto text-[11px] text-gray-400 flex items-center gap-2">
          Across {insight.count} included peers
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
              title="Regenerate insights"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            </button>
          )}
        </span>
      </div>

      {loading && !insights && (
        <div className="px-5 py-6 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Generating commentary…
        </div>
      )}

      {error && !insights && (
        <div className="px-5 py-4 text-sm text-amber-800 bg-amber-50 border-b border-amber-100">
          Insights unavailable: {error}. Showing rule-based fallback below.
        </div>
      )}

      {isLLM && (
        <div className="px-5 py-4 space-y-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {insights}
        </div>
      )}

      {!isLLM && !loading && (
      <div className="px-5 py-4 space-y-4 text-sm text-gray-700 leading-relaxed">
        <p>
          The peer set trades at a median <strong>EV/EBITDA (LTM) of {formatMultiple(insight.medianEvEbitda)}</strong>
          {' '}and median <strong>EV/Revenue (LTM) of {formatMultiple(insight.medianEvRev)}</strong>.
          {insight.highEvEbitda && insight.lowEvEbitda && (
            <>
              {' '}The range is wide — <strong>{insight.highEvEbitda.companyName} ({insight.highEvEbitda.ticker})</strong> sits at the top at{' '}
              <strong>{formatMultiple(insight.highEvEbitda.evEbitdaLTM)}</strong>, reflecting its scarcity premium and best-in-class margins,
              while <strong>{insight.lowEvEbitda.companyName} ({insight.lowEvEbitda.ticker})</strong> anchors the low end at{' '}
              <strong>{formatMultiple(insight.lowEvEbitda.evEbitdaLTM)}</strong> — diversified exposure and listing overhang typically explain that compression.
            </>
          )}
        </p>

        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Growth and margin picture.</strong> Median LTM revenue growth sits at{' '}
            <strong>{formatPercent(insight.medianRevGrowth)}</strong> with a median EBITDA margin of{' '}
            <strong>{formatPercent(insight.medianMargin)}</strong>.
            {insight.highMargin && insight.lowMargin && (
              <>
                {' '}Margins span from <strong>{formatPercent(insight.lowMargin.ebitdaMargin)}</strong> ({insight.lowMargin.ticker}) to{' '}
                <strong>{formatPercent(insight.highMargin.ebitdaMargin)}</strong> ({insight.highMargin.ticker}), which tracks with the multiple dispersion.
              </>
            )}
            {insight.medianNtmGrowth !== null && (
              <>
                {' '}NTM consensus points to median revenue growth of <strong>{formatPercent(insight.medianNtmGrowth)}</strong> — if the target's business plan assumes materially higher growth, the multiple may need a premium.
              </>
            )}
          </p>
        </div>

        {insight.medianLeverage !== null && (
          <div className="flex items-start gap-2">
            {insight.highLeverage ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            ) : (
              <TrendingUp className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            )}
            <p>
              <strong>Leverage check.</strong> Median Net Debt / EBITDA of{' '}
              <strong>{formatNumber(insight.medianLeverage)}x</strong>
              {insight.highLeverage ? (
                <>
                  {' '}— but <strong>{insight.highLeverage.companyName} ({insight.highLeverage.ticker})</strong> is an outlier at{' '}
                  <strong>{formatNumber(insight.highLeverage.netDebtToEbitda)}x</strong>, reflecting structural balance-sheet leverage; treat it as a large-cap anchor rather than a direct peer.
                </>
              ) : (
                <> — the set is conservatively levered overall, which keeps the EV bridge clean.</>
              )}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 italic">
          Auto-generated from the included peer set. Toggling peers above refreshes these insights.
        </p>
      </div>
      )}
    </div>
  );
}
