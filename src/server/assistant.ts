import type {
  AssistantChatRequest,
  AssistantState,
  AssistantStatePeer,
  CustomConstraint,
  Emit,
  ParsedFilters,
} from './types.js';
import { buildPeer } from '../publicComps/lib/peerBuilder.js';
import { fetchYahooPeer } from './yahoo.js';
import { discoverPeers, enrichCompany } from './perplexity.js';
import { azureChatWithTools, generateInsights, parseQuery } from './azure.js';

function buildAssistantSystemPrompt(state: AssistantState): string {
  const filterLines: string[] = [];
  if (state.filters?.sector) filterLines.push(`- Sector: ${state.filters.sector}`);
  if (state.filters?.geography) filterLines.push(`- Geography: ${state.filters.geography}`);
  if (state.filters?.marketCap) filterLines.push(`- Market cap: ${state.filters.marketCap}`);
  if (state.filters?.revenue) filterLines.push(`- Revenue: ${state.filters.revenue}`);
  if (state.filters?.qualitative) filterLines.push(`- Qualitative: ${state.filters.qualitative}`);
  for (const c of state.customFilters ?? []) {
    if (c.label && c.value) filterLines.push(`- ${c.label}: ${c.value}`);
  }

  const peerHeader = [
    'Ticker', 'Company', 'Country', 'Status',
    'MktCap($M)', 'EV($M)', 'RevLTM', 'EBITDA_LTM', 'Margin%', 'RevGrowth%',
    'EV/Rev_LTM', 'EV/EBITDA_LTM', 'P/E_LTM',
    'RevNTM', 'NTM_Growth%', 'EV/Rev_NTM', 'NetDebt/EBITDA',
  ].join('\t');
  const peerRows = state.peers.map((p) =>
    [
      p.ticker, p.companyName, p.country ?? '', p.status,
      p.marketCap ?? '', p.enterpriseValue ?? '',
      p.revenueLTM ?? '', p.ebitdaLTM ?? '', p.ebitdaMargin ?? '', p.revenueGrowthYoY ?? '',
      p.evRevenueLTM ?? '', p.evEbitdaLTM ?? '', p.peLTM ?? '',
      p.revenueNTM ?? '', p.ntmRevenueGrowth ?? '', p.evRevenueNTM ?? '', p.netDebtToEbitda ?? '',
    ].join('\t')
  );

  const inDashboard = state.mode === 'dashboard' && state.peers.length > 0;

  return `You are the AI assistant inside a public-comparables analysis tool. You help an M&A analyst interpret peer-set data AND take actions on their behalf via tools.

CURRENT MODE: ${state.mode === 'landing' ? 'LANDING PAGE (no analysis running yet — offer to start one)' : 'DASHBOARD (peer set loaded)'}
${inDashboard ? `Target: ${state.targetCompany || '(none)'}
${state.description ? `Description: ${state.description}\n` : ''}
Applied filters:
${filterLines.length > 0 ? filterLines.join('\n') : '(none)'}

Peer set (TSV; absolute $M may be in the peer's local reporting currency; multiples are dimensionless and always comparable):
${peerHeader}
${peerRows.join('\n')}

${state.insights ? `Current commentary below the table:\n${state.insights}\n` : ''}` : '(No peer set loaded. Offer to research a company or parse a sector query when the user asks.)'}

AVAILABLE TOOLS
- research_company(company): Call this when the user names a specific company to analyze. Returns proposed filters. DO NOT run a search yet — show the filters to the user and ask if they want to adjust anything before running discovery.
- parse_query(query): Call this when the user describes a sector/theme/criteria in free form (e.g. "AI companies > $1B in the US"). Returns proposed filters. Same confirmation rule.
- run_search(targetCompany?, filters, customFilters?, description?): Executes the full pipeline — Perplexity peer discovery, Yahoo financials, GPT commentary. Wipes any current analysis. REQUIRES explicit user confirmation in the most recent message (e.g. "yes", "go ahead", "run it", "looks good"). If the user has not just confirmed, do NOT call this — instead present the proposed filters in plain text and ask.
- update_filters(filters, customFilters?): Modify the currently-applied filters and re-run discovery. Use when the user wants to tighten/widen criteria on an existing analysis. Runs immediately, no confirmation.
- exclude_peers(tickers): Mark tickers as excluded. Runs immediately.
- include_peers(tickers): Mark tickers as included. Runs immediately.
- regenerate_insights(): Regenerate the commentary paragraph with the current peer set. Runs immediately.

WORKFLOW FOR STARTING A NEW ANALYSIS
1. User names a company OR describes a sector.
2. Call research_company / parse_query. Show the user the proposed filters in plain text.
3. User may say "change geography to Europe" or "looks good". If they ask to adjust, modify the filters in your head and present again; do NOT re-call research_company unless they name a new company.
4. When the user confirms, call run_search with the approved filters.

QUESTION-ANSWERING GUIDELINES (when peer data is loaded)
- Answer data questions directly and numerically — cite specific tickers and numbers (1 decimal place).
- When naming outliers, always say WHY (scarcity premium, scale discount, leverage, etc.).
- Be concise. 2-4 sentences for simple questions.
- If a field is null/missing, say so explicitly rather than inventing a number.`;
}

const ASSISTANT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'research_company',
      description:
        'Research a specific target company via Perplexity and return proposed filters (sector, geography, market cap, revenue, qualitative). Does NOT run a search. Always show results to the user before calling run_search.',
      parameters: {
        type: 'object',
        properties: {
          company: { type: 'string', description: 'Company name to research' },
        },
        required: ['company'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'parse_query',
      description:
        'Parse a free-form sector/theme query into structured filters via GPT-4o. Does NOT run a search. Always show results to the user before calling run_search.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-form description of the peer set to find' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_search',
      description:
        'Execute the full pipeline: Perplexity peer discovery + Yahoo financials + GPT insights. Wipes any current analysis. REQUIRES explicit user confirmation — only call this after the user has approved proposed filters in their most recent message.',
      parameters: {
        type: 'object',
        properties: {
          targetCompany: { type: 'string', description: 'Target company name (optional)' },
          filters: {
            type: 'object',
            properties: {
              sector: { type: 'string' },
              geography: { type: 'string' },
              marketCap: { type: 'string' },
              revenue: { type: 'string' },
              qualitative: { type: 'string' },
            },
          },
          customFilters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
              },
              required: ['label', 'value'],
            },
          },
          description: { type: 'string', description: 'Business description of the target (optional)' },
        },
        required: ['filters'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_filters',
      description:
        'Modify the currently-applied filters on an existing analysis and re-run discovery + Yahoo + insights. Runs immediately. Use when user wants to tighten or widen criteria.',
      parameters: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            properties: {
              sector: { type: 'string' },
              geography: { type: 'string' },
              marketCap: { type: 'string' },
              revenue: { type: 'string' },
              qualitative: { type: 'string' },
            },
          },
          customFilters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
              },
              required: ['label', 'value'],
            },
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'exclude_peers',
      description: 'Mark one or more peer tickers as excluded. Runs immediately.',
      parameters: {
        type: 'object',
        properties: {
          tickers: { type: 'array', items: { type: 'string' } },
        },
        required: ['tickers'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'include_peers',
      description: 'Mark one or more previously-excluded peer tickers as included. Runs immediately.',
      parameters: {
        type: 'object',
        properties: {
          tickers: { type: 'array', items: { type: 'string' } },
        },
        required: ['tickers'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'regenerate_insights',
      description: 'Regenerate the GPT commentary for the current peer set. Runs immediately.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

async function discoverAndBuildPeers(
  targetCompany: string,
  filters: ParsedFilters,
  customFilters: CustomConstraint[] | undefined,
  description: string | undefined,
  emit: Emit
): Promise<{ peers: AssistantStatePeer[]; failedTickers: string[]; insights: string | null }> {
  emit('status', { text: `🔍 Asking Perplexity for peers matching the filters…` });
  const discovered = await discoverPeers(
    targetCompany || filters.sector || 'peer set',
    {
      sector: filters.sector ?? undefined,
      geography: filters.geography ?? undefined,
      marketCap: filters.marketCap ?? undefined,
      revenue: filters.revenue ?? undefined,
    },
    filters.qualitative ?? description ?? undefined,
    customFilters
  );
  emit('status', { text: `✓ Perplexity returned ${discovered.length} candidate tickers` });

  if (discovered.length === 0) {
    return { peers: [], failedTickers: [], insights: null };
  }

  emit('status', { text: `📊 Fetching financials from Yahoo for ${discovered.length} tickers…` });

  const results = await Promise.all(
    discovered.map(async (d) => {
      try {
        const yahooData = await fetchYahooPeer(d.ticker);
        return { ok: true as const, d, yahooData };
      } catch (err) {
        return { ok: false as const, d, error: err instanceof Error ? err.message : 'error' };
      }
    })
  );
  const peers: AssistantStatePeer[] = [];
  const failedTickers: string[] = [];
  for (const r of results) {
    if (r.ok) {
      peers.push(buildPeer(r.d, r.yahooData));
    } else {
      failedTickers.push(r.d.ticker);
    }
  }
  emit('status', {
    text: `✓ Fetched ${peers.length} peer${peers.length === 1 ? '' : 's'} from Yahoo${failedTickers.length > 0 ? ` (${failedTickers.length} failed: ${failedTickers.join(', ')})` : ''}`,
  });

  let insights: string | null = null;
  if (peers.length > 0) {
    emit('status', { text: `✍️  Generating GPT commentary…` });
    try {
      insights = await generateInsights({
        targetCompany: targetCompany || filters.sector || 'peer set',
        peers: peers.map((p) => ({
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
      });
      emit('status', { text: `✓ Commentary generated` });
    } catch (err) {
      emit('status', { text: `⚠️  Commentary failed: ${err instanceof Error ? err.message : 'error'}` });
    }
  }

  return { peers, failedTickers, insights };
}

async function executeTool(
  name: string,
  args: any,
  liveState: AssistantState,
  emit: Emit
): Promise<string> {
  switch (name) {
    case 'research_company': {
      const company = String(args?.company ?? '').trim();
      if (!company) return JSON.stringify({ error: 'company required' });
      emit('status', { text: `🔍 Researching ${company} via Perplexity…` });
      const enriched = await enrichCompany(company);
      emit('status', {
        text: `✓ Research complete for ${company} (${enriched.filters.sector ?? 'unknown sector'}, ${enriched.filters.marketCap ?? 'unknown size'})`,
      });
      return JSON.stringify({
        success: true,
        filters: enriched.filters,
        description: enriched.description,
      });
    }

    case 'parse_query': {
      const query = String(args?.query ?? '').trim();
      if (!query) return JSON.stringify({ error: 'query required' });
      emit('status', { text: `🧠 Parsing query with GPT-4o…` });
      const filters = await parseQuery(query);
      emit('status', { text: `✓ Query parsed` });
      return JSON.stringify({ success: true, filters });
    }

    case 'run_search': {
      const filters: ParsedFilters = {
        company: null,
        sector: args?.filters?.sector ?? null,
        geography: args?.filters?.geography ?? null,
        marketCap: args?.filters?.marketCap ?? null,
        revenue: args?.filters?.revenue ?? null,
        qualitative: args?.filters?.qualitative ?? null,
      };
      const customFilters: CustomConstraint[] = Array.isArray(args?.customFilters)
        ? args.customFilters.filter(
            (c: any) => c && typeof c.label === 'string' && typeof c.value === 'string'
          )
        : [];
      const description: string = typeof args?.description === 'string' ? args.description : '';
      const targetCompany: string =
        typeof args?.targetCompany === 'string' && args.targetCompany.trim().length > 0
          ? args.targetCompany.trim()
          : filters.sector ?? 'Custom peer set';

      const { peers, failedTickers, insights } = await discoverAndBuildPeers(
        targetCompany,
        filters,
        customFilters,
        description,
        emit
      );

      liveState.mode = 'dashboard';
      liveState.targetCompany = targetCompany;
      liveState.filters = filters;
      liveState.customFilters = customFilters;
      liveState.description = description;
      liveState.peers = peers;
      liveState.insights = insights;

      emit('state_patch', {
        mode: 'dashboard',
        targetCompany,
        filters,
        customFilters,
        description,
        peers,
        insights,
        failedTickers,
      });

      return JSON.stringify({
        success: true,
        peers_count: peers.length,
        failed_count: failedTickers.length,
        median_mentioned_in_insights: !!insights,
      });
    }

    case 'update_filters': {
      const mergedFilters: ParsedFilters = {
        ...(liveState.filters ?? {
          company: null,
          sector: null,
          geography: null,
          marketCap: null,
          revenue: null,
          qualitative: null,
        }),
        ...(args?.filters ?? {}),
      };
      const customFilters: CustomConstraint[] = Array.isArray(args?.customFilters)
        ? args.customFilters.filter(
            (c: any) => c && typeof c.label === 'string' && typeof c.value === 'string'
          )
        : liveState.customFilters ?? [];

      const { peers, failedTickers, insights } = await discoverAndBuildPeers(
        liveState.targetCompany,
        mergedFilters,
        customFilters,
        liveState.description,
        emit
      );

      liveState.filters = mergedFilters;
      liveState.customFilters = customFilters;
      liveState.peers = peers;
      liveState.insights = insights;

      emit('state_patch', {
        filters: mergedFilters,
        customFilters,
        peers,
        insights,
        failedTickers,
      });

      return JSON.stringify({
        success: true,
        peers_count: peers.length,
        failed_count: failedTickers.length,
      });
    }

    case 'exclude_peers': {
      const tickers: string[] = Array.isArray(args?.tickers) ? args.tickers : [];
      const set = new Set(tickers.map((t) => String(t).toUpperCase()));
      const changed: string[] = [];
      liveState.peers = liveState.peers.map((p) => {
        if (set.has(p.ticker.toUpperCase()) && p.status !== 'Excluded') {
          changed.push(p.ticker);
          return { ...p, status: 'Excluded' as const, exclusionReason: 'Excluded by assistant' };
        }
        return p;
      });
      emit('status', { text: `✂️  Excluded ${changed.length} peer${changed.length === 1 ? '' : 's'}: ${changed.join(', ') || '(none matched)'}` });
      emit('state_patch', { peers: liveState.peers });
      return JSON.stringify({ success: true, excluded: changed });
    }

    case 'include_peers': {
      const tickers: string[] = Array.isArray(args?.tickers) ? args.tickers : [];
      const set = new Set(tickers.map((t) => String(t).toUpperCase()));
      const changed: string[] = [];
      liveState.peers = liveState.peers.map((p) => {
        if (set.has(p.ticker.toUpperCase()) && p.status !== 'Included') {
          changed.push(p.ticker);
          return { ...p, status: 'Included' as const, exclusionReason: null };
        }
        return p;
      });
      emit('status', { text: `➕ Included ${changed.length} peer${changed.length === 1 ? '' : 's'}: ${changed.join(', ') || '(none matched)'}` });
      emit('state_patch', { peers: liveState.peers });
      return JSON.stringify({ success: true, included: changed });
    }

    case 'regenerate_insights': {
      if (liveState.peers.length === 0) {
        return JSON.stringify({ error: 'no peers in current set' });
      }
      emit('status', { text: `✍️  Regenerating commentary…` });
      const text = await generateInsights({
        targetCompany: liveState.targetCompany,
        peers: liveState.peers
          .filter((p) => p.status === 'Included')
          .map((p) => ({
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
      });
      liveState.insights = text;
      emit('state_patch', { insights: text });
      return JSON.stringify({ success: true });
    }

    default:
      return JSON.stringify({ error: `unknown tool: ${name}` });
  }
}

export async function runAssistantChatStream(
  req: AssistantChatRequest,
  emit: Emit
): Promise<void> {
  const liveState: AssistantState = JSON.parse(JSON.stringify(req.state));

  const system = buildAssistantSystemPrompt(liveState);
  const conversation: any[] = [{ role: 'system', content: system }];
  for (const m of req.messages) {
    conversation.push({ role: m.role, content: m.content });
  }

  let iterations = 0;
  const MAX_ITER = 8;

  while (iterations < MAX_ITER) {
    iterations++;
    const response = await azureChatWithTools(conversation, {
      temperature: 0.3,
      tools: ASSISTANT_TOOLS,
      toolChoice: 'auto',
    });

    const toolCalls: any[] = response?.tool_calls ?? [];
    if (toolCalls.length === 0) {
      emit('final', { text: (response?.content ?? '').trim() });
      return;
    }

    conversation.push({
      role: 'assistant',
      content: response?.content ?? null,
      tool_calls: toolCalls,
    });

    for (const tc of toolCalls) {
      const name = tc?.function?.name as string;
      let args: any = {};
      try {
        args = tc?.function?.arguments ? JSON.parse(tc.function.arguments) : {};
      } catch {
        args = {};
      }

      let toolResult: string;
      try {
        toolResult = await executeTool(name, args, liveState, emit);
      } catch (err) {
        toolResult = JSON.stringify({ error: err instanceof Error ? err.message : 'tool failed' });
        emit('status', { text: `⚠️  ${name} failed: ${err instanceof Error ? err.message : 'error'}` });
      }

      conversation.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: toolResult,
      });
    }
  }

  emit('final', { text: '(exceeded tool-call iteration limit; please try a simpler request)' });
}
