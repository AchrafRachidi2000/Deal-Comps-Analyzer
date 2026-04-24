import type { DiscoveredPeer, CustomConstraint, CompanyEnrichment } from './types';

const DISCOVERY_PROMPT = (
  company: string,
  filters: { sector?: string; geography?: string; marketCap?: string; revenue?: string },
  qualitative?: string,
  custom?: CustomConstraint[]
) => `You are an M&A analyst building a TRADING COMPARABLES (public comps) peer set for "${company}". Find 8 to 12 peer companies.

HARD REQUIREMENTS — every peer you return MUST satisfy ALL of these. No exceptions:
1. The company is CURRENTLY publicly traded on a recognized stock exchange (NYSE, NASDAQ, LSE, Euronext, XETRA, OMX, NZX, TSE, HKEX, TSX, ASX, BMV, BVMF, NSE, KRX, etc.).
2. The company has an active, currently-resolvable Yahoo Finance ticker symbol that you can name with confidence.
3. The company is NOT any of: a private company, a recently-delisted ticker, a blank-check SPAC without an announced target, a shell / holding-company stub, a wholly-owned subsidiary that doesn't trade independently, an OTC pink-sheet name with no real float, or a ticker you are uncertain exists.
4. If two listings exist (ADR + primary local listing), pick the primary local listing — but only if it is liquid and currently trading.

If you cannot find 8 peers that ALL satisfy the hard requirements, return ONLY the ones that do. Do NOT pad the list with private companies, weak/uncertain tickers, or invented symbols. Quality over quantity — 4 verified public peers beat 10 with garbage in them.

Soft guidance (preferences, not gates):
- Sector: ${filters.sector ?? 'no preference'}
- Geography: ${filters.geography ?? 'global'}
- Market cap range: ${filters.marketCap ?? 'no preference'}
- Revenue range: ${filters.revenue ?? 'no preference'}
${(custom ?? []).map((c) => `- ${c.label}: ${c.value}`).join('\n')}${qualitative ? `\nQualitative profile: ${qualitative}` : ''}

Use the EXACT Yahoo Finance ticker symbol, including the exchange suffix for non-US listings:
- US (NYSE / NASDAQ): no suffix → "RMD", "MASI", "BAX"
- Amsterdam Euronext: ".AS" → "PHIA.AS"
- London LSE: ".L" → "SN.L"
- Frankfurt XETRA: ".DE" → "DRW3.DE"
- Stockholm OMX: ".ST" → "GETI-B.ST"
- New Zealand NZX: ".NZ" → "FPH.NZ"
- Tokyo TSE: ".T" → "6849.T"
- Hong Kong HKEX: ".HK" → "1093.HK"
- Toronto TSX: ".TO" → "WELL.TO"

Before finalizing each peer, mentally verify: "Is this company publicly traded today? Is this the correct Yahoo ticker? Have I seen it referenced in actual financial filings or stock data?" If you are not sure, drop the peer.

Respond with STRICT JSON only — no prose, no code fences, no commentary. Schema:
{ "peers": [ { "ticker": "string (Yahoo Finance symbol)", "companyName": "string", "description": "one-sentence business description", "rationale": "one-sentence reason this is a relevant peer", "similarityScore": number 0-100 } ] }`;

async function callPerplexity(systemPrompt: string, userPrompt: string, temperature: number): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY missing in environment');

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Perplexity ${res.status}: ${text.slice(0, 300)}`);
  }
  const json: any = await res.json();
  return String(json?.choices?.[0]?.message?.content ?? '');
}

function extractJson(content: string): any {
  const cleaned = content
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Perplexity returned no JSON object: ${content.slice(0, 200)}`);
  try {
    return JSON.parse(match[0]);
  } catch (e) {
    throw new Error(`Perplexity JSON parse failed: ${(e as Error).message}`);
  }
}

export async function discoverPeers(
  company: string,
  filters: { sector?: string; geography?: string; marketCap?: string; revenue?: string },
  qualitative?: string,
  custom?: CustomConstraint[]
): Promise<DiscoveredPeer[]> {
  const content = await callPerplexity(
    'You are a precise M&A research assistant building public comparables. You ONLY return companies that are currently publicly traded on a recognized stock exchange and have an active Yahoo Finance ticker. Private companies, delisted names, SPACs without targets, and uncertain tickers are STRICTLY excluded. Return fewer peers rather than including any non-public or uncertain name. Always respond with strict JSON when asked.',
    DISCOVERY_PROMPT(company, filters, qualitative, custom),
    0.2
  );

  const parsed = extractJson(content);
  const list = Array.isArray(parsed?.peers) ? parsed.peers : [];
  return list
    .filter((p: any) => p && typeof p.ticker === 'string' && p.ticker.length > 0)
    .map((p: any): DiscoveredPeer => ({
      ticker: String(p.ticker).trim().toUpperCase(),
      companyName: String(p.companyName ?? p.name ?? p.ticker),
      description: String(p.description ?? ''),
      rationale: String(p.rationale ?? p.reasoning ?? ''),
      similarityScore: Number.isFinite(Number(p.similarityScore)) ? Math.round(Number(p.similarityScore)) : 75,
    }));
}

export async function enrichCompany(company: string): Promise<CompanyEnrichment> {
  const prompt = `Look up the company "${company}" and return a structured profile.

Respond with STRICT JSON only — no prose, no code fences, no commentary. Schema:
{
  "description": "1-2 sentence description of what the company actually does (its product / service)",
  "sector": "primary industry vertical (e.g. 'AI software for private equity', 'medical devices — respiratory', 'enterprise data infrastructure')",
  "geography": "primary HQ country, or region if multi-region",
  "marketCap": "estimated market cap range as a human string. If private, infer from funding stage and last-known valuation. Use one of: '< $50M', '$50M – $250M', '$250M – $1B', '$1B – $10B', '$10B – $50B', '> $50B'",
  "revenue": "estimated revenue range. Use one of: '< $10M', '$10M – $50M', '$50M – $250M', '$250M – $1B', '$1B – $10B', '> $10B'",
  "stage": "private | public | unknown",
  "qualitative": "1 sentence on the business model nuance that should drive peer selection (e.g. 'vertical-specific SaaS for PE diligence with embedded AI workflows')"
}

Rules:
- If you cannot find the company, set every string field to "unknown" rather than inventing.
- Even for private companies, infer the size band — the goal is to pick PUBLIC peer companies of similar size + business model later.
- Be specific in the sector — "software" is too generic; prefer "vertical SaaS for X" or "data infrastructure for Y".`;

  const content = await callPerplexity(
    'You are a precise research assistant. Always respond with strict JSON when asked.',
    prompt,
    0.1
  );

  const parsed = extractJson(content);
  const norm = (v: any) =>
    typeof v === 'string' && v.trim().length > 0 && v.trim().toLowerCase() !== 'unknown'
      ? v.trim()
      : null;

  return {
    description: typeof parsed?.description === 'string' ? parsed.description.trim() : '',
    filters: {
      company,
      sector: norm(parsed?.sector),
      geography: norm(parsed?.geography),
      marketCap: norm(parsed?.marketCap),
      revenue: norm(parsed?.revenue),
      qualitative: norm(parsed?.qualitative),
    },
  };
}
