import { Peer } from '@/publicComps/data/mockData';
import type { RealPeerFields } from './yahooMapper';
import { buildPeer } from './peerBuilder';

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

export interface DiscoveryFilters {
  sector?: string;
  geography?: string;
  marketCap?: string;
  revenue?: string;
  qualitative?: string;
  customConstraints?: CustomConstraint[];
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

export async function enrichCompany(company: string): Promise<CompanyEnrichment> {
  const res = await fetch('/api/company/enrich', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ company }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error ?? `enrich failed (${res.status})`);
  }
  return (await res.json()) as CompanyEnrichment;
}

export async function parseQuery(query: string): Promise<ParsedFilters> {
  const res = await fetch('/api/query/parse-filters', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error ?? `parse failed (${res.status})`);
  }
  const json = (await res.json()) as { filters: ParsedFilters };
  return json.filters;
}

export async function discoverPeers(
  company: string,
  filters: DiscoveryFilters
): Promise<DiscoveredPeer[]> {
  const params = new URLSearchParams({ company });
  if (filters.sector) params.set('sector', filters.sector);
  if (filters.geography) params.set('geography', filters.geography);
  if (filters.marketCap) params.set('marketCap', filters.marketCap);
  if (filters.revenue) params.set('revenue', filters.revenue);
  if (filters.qualitative) params.set('qualitative', filters.qualitative);
  if (filters.customConstraints && filters.customConstraints.length > 0) {
    const clean = filters.customConstraints.filter((c) => c.label.trim() && c.value.trim());
    if (clean.length > 0) params.set('custom', JSON.stringify(clean));
  }

  const res = await fetch(`/api/peers/discover?${params.toString()}`);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error ?? `discovery failed (${res.status})`);
  }
  const json = (await res.json()) as { peers: DiscoveredPeer[] };
  return json.peers;
}

async function fetchYahooOne(
  ticker: string
): Promise<{ ok: true; data: RealPeerFields } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/peer/${encodeURIComponent(ticker)}`);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = (await res.json()) as { data?: RealPeerFields; error?: string };
    if (json.error || !json.data) return { ok: false, error: json.error ?? 'empty response' };
    return { ok: true, data: json.data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' };
  }
}

export interface FetchFinancialsResult {
  peers: Peer[];
  failedTickers: string[];
}

export async function fetchFinancialsForDiscovered(
  discovered: DiscoveredPeer[]
): Promise<FetchFinancialsResult> {
  const results = await Promise.all(
    discovered.map(async (d) => ({ d, res: await fetchYahooOne(d.ticker) }))
  );

  const peers: Peer[] = [];
  const failedTickers: string[] = [];
  for (const { d, res } of results) {
    if (!res.ok) {
      failedTickers.push(d.ticker);
      continue;
    }
    peers.push(buildPeer(d, res.data));
  }
  return { peers, failedTickers };
}

export interface AssistantChatState {
  mode: 'landing' | 'dashboard';
  targetCompany: string;
  description?: string;
  filters?: {
    sector?: string | null;
    geography?: string | null;
    marketCap?: string | null;
    revenue?: string | null;
    qualitative?: string | null;
  };
  customFilters?: CustomConstraint[];
  peers: Peer[];
  insights?: string | null;
}

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantStatePatch {
  mode?: 'landing' | 'dashboard';
  targetCompany?: string;
  description?: string;
  filters?: {
    sector?: string | null;
    geography?: string | null;
    marketCap?: string | null;
    revenue?: string | null;
    qualitative?: string | null;
    company?: string | null;
  };
  customFilters?: CustomConstraint[];
  peers?: Peer[];
  insights?: string | null;
  failedTickers?: string[];
}

export interface AssistantStreamHandlers {
  onStatus?: (text: string) => void;
  onStatePatch?: (patch: AssistantStatePatch) => void;
  onError?: (message: string) => void;
}

export async function assistantChatStream(
  messages: AssistantChatMessage[],
  state: AssistantChatState,
  handlers: AssistantStreamHandlers
): Promise<string> {
  const res = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, state }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `assistant chat failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) >= 0) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (!rawEvent.trim()) continue;

      let eventName = 'message';
      const dataLines: string[] = [];
      for (const line of rawEvent.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
      }
      const dataStr = dataLines.join('\n');
      if (!dataStr) continue;

      let payload: any;
      try {
        payload = JSON.parse(dataStr);
      } catch {
        continue;
      }

      if (eventName === 'status') {
        handlers.onStatus?.(String(payload.text ?? ''));
      } else if (eventName === 'state_patch') {
        handlers.onStatePatch?.(payload as AssistantStatePatch);
      } else if (eventName === 'final') {
        finalText = String(payload.text ?? '');
      } else if (eventName === 'error') {
        handlers.onError?.(String(payload.message ?? 'assistant error'));
      }
    }
  }

  return finalText;
}

export async function generateInsights(targetCompany: string, peers: Peer[]): Promise<string> {
  const included = peers.filter((p) => p.status === 'Included');
  const payload = {
    targetCompany,
    peers: included.map((p) => ({
      ticker: p.ticker,
      companyName: p.companyName,
      country: p.country,
      marketCap: p.marketCap,
      enterpriseValue: p.enterpriseValue,
      revenueLTM: p.revenueLTM,
      ebitdaLTM: p.ebitdaLTM,
      ebitdaMargin: p.ebitdaMargin,
      revenueGrowthYoY: p.revenueGrowthYoY,
      evRevenueLTM: p.evRevenueLTM,
      evEbitdaLTM: p.evEbitdaLTM,
      peLTM: p.peLTM,
      revenueNTM: p.revenueNTM,
      ntmRevenueGrowth: p.ntmRevenueGrowth,
      evRevenueNTM: p.evRevenueNTM,
      netDebtToEbitda: p.netDebtToEbitda,
    })),
  };
  const res = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error ?? `insights failed (${res.status})`);
  }
  const json = (await res.json()) as { insights: string };
  return json.insights;
}
