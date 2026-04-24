import type { ChatMessage, InsightsRequest, ParsedFilters } from './types.js';

export function azureChatUrl(deployment = 'gpt-4o'): string {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiVersion = process.env.OPENAI_API_VERSION ?? '2024-10-21';
  if (!endpoint) throw new Error('AZURE_OPENAI_ENDPOINT missing in environment');
  return `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
}

export async function azureChat(
  messages: ChatMessage[],
  options: { temperature?: number; deployment?: string; jsonMode?: boolean } = {}
): Promise<string> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('AZURE_OPENAI_API_KEY missing in environment');

  const body: any = {
    messages,
    temperature: options.temperature ?? 0.3,
  };
  if (options.jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(azureChatUrl(options.deployment), {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure OpenAI ${res.status}: ${text.slice(0, 300)}`);
  }
  const json: any = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? '';
  return content.trim();
}

export async function azureChatWithTools(
  messages: any[],
  options: { temperature?: number; deployment?: string; tools?: any[]; toolChoice?: string } = {}
): Promise<any> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('AZURE_OPENAI_API_KEY missing in environment');

  const body: any = {
    messages,
    temperature: options.temperature ?? 0.3,
  };
  if (options.tools) body.tools = options.tools;
  if (options.toolChoice) body.tool_choice = options.toolChoice;

  const res = await fetch(azureChatUrl(options.deployment), {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure OpenAI ${res.status}: ${text.slice(0, 300)}`);
  }
  const json: any = await res.json();
  return json?.choices?.[0]?.message ?? { content: '' };
}

function buildPeerCsv(req: InsightsRequest): string {
  const headers = [
    'Ticker', 'Company', 'Country', 'MktCap($M)', 'EV($M)',
    'RevLTM($M)', 'EBITDA_LTM($M)', 'EBITDA_Margin(%)', 'RevGrowthYoY(%)',
    'EV/Rev_LTM', 'EV/EBITDA_LTM', 'P/E_LTM',
    'RevNTM($M)', 'NTM_RevGrowth(%)', 'EV/Rev_NTM', 'NetDebt/EBITDA',
  ];
  const rows = req.peers.map((p) =>
    [
      p.ticker, p.companyName, p.country ?? '',
      p.marketCap ?? '', p.enterpriseValue ?? '',
      p.revenueLTM ?? '', p.ebitdaLTM ?? '', p.ebitdaMargin ?? '', p.revenueGrowthYoY ?? '',
      p.evRevenueLTM ?? '', p.evEbitdaLTM ?? '', p.peLTM ?? '',
      p.revenueNTM ?? '', p.ntmRevenueGrowth ?? '', p.evRevenueNTM ?? '', p.netDebtToEbitda ?? '',
    ].join('\t')
  );
  return [headers.join('\t'), ...rows].join('\n');
}

export async function generateInsights(req: InsightsRequest): Promise<string> {
  const csv = buildPeerCsv(req);

  const userPrompt = `Target company: ${req.targetCompany}
Peer set (TSV — multiples are dimensionless ratios; absolute $M values may be in the peer's local reporting currency):

${csv}

Write a concise analyst-style commentary on this peer set in three short paragraphs:

1. Valuation: median EV/Revenue (LTM), median EV/EBITDA (LTM), and median P/E (LTM). Name the top and bottom outliers explicitly with their ticker and multiple, and offer a one-line reason (scarcity premium, scale discount, etc.).
2. Growth & margin profile: where does the median sit; who is leading; who is lagging.
3. Leverage / risk: median Net Debt / EBITDA. Flag any peer above 3.0x by ticker.

Style: direct, professional, specific numbers (1 decimal place). No bullet points. No preamble. About 180-220 words total.`;

  return azureChat(
    [
      { role: 'system', content: 'You are a senior M&A analyst writing commentary on a public-comparables analysis. Be specific and numerate.' },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.3 }
  );
}

export async function parseQuery(query: string): Promise<ParsedFilters> {
  const userPrompt = `Convert the following analyst query about a public-comparables search into a structured JSON object.

Query: "${query}"

Respond with STRICT JSON only — no prose, no code fences. Schema:
{
  "company": "specific target company if mentioned, otherwise null",
  "sector": "industry / sector / vertical, or null",
  "geography": "geographies / regions / countries, or null",
  "marketCap": "market cap range as a human string (e.g. \\"> $100M\\", \\"$1B – $10B\\"), or null",
  "revenue": "revenue range as a human string (e.g. \\"> $10M\\", \\"$50M – $500M\\"), or null",
  "qualitative": "any qualitative business-model nuance the user expressed (one sentence), or null"
}

Rules:
- Use null (not empty string) for fields the query does not specify.
- Use the user's exact size language when reasonable. Normalize "above $100M" to "> $100M".
- "company" is only set when the user names a specific target company. If they describe a sector, leave company null.`;

  const raw = await azureChat(
    [
      { role: 'system', content: 'You convert analyst queries into structured filter JSON. Always respond with strict JSON.' },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.1, jsonMode: true }
  );

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`parse-filters: not JSON: ${raw.slice(0, 200)}`);
    parsed = JSON.parse(match[0]);
  }

  const norm = (v: any) =>
    typeof v === 'string' && v.trim().length > 0 && v.trim().toLowerCase() !== 'null' ? v.trim() : null;

  return {
    company: norm(parsed?.company),
    sector: norm(parsed?.sector),
    geography: norm(parsed?.geography),
    marketCap: norm(parsed?.marketCap),
    revenue: norm(parsed?.revenue),
    qualitative: norm(parsed?.qualitative),
  };
}
