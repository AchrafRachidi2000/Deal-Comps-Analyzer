import type { VercelRequest, VercelResponse } from '@vercel/node';
import { discoverPeers } from '../../src/server/perplexity';
import type { CustomConstraint } from '../../src/server/types';

function asString(v: unknown): string | undefined {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET');
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const company = (asString(req.query.company) ?? '').trim();
  if (!company) {
    res.status(400).json({ error: 'company required' });
    return;
  }

  const filters = {
    sector: asString(req.query.sector),
    geography: asString(req.query.geography),
    marketCap: asString(req.query.marketCap),
    revenue: asString(req.query.revenue),
  };
  const qualitative = asString(req.query.qualitative);

  let customConstraints: CustomConstraint[] | undefined;
  const customRaw = asString(req.query.custom);
  if (customRaw) {
    try {
      const parsed = JSON.parse(customRaw);
      if (Array.isArray(parsed)) {
        customConstraints = parsed
          .filter((c: any) => c && typeof c.label === 'string' && typeof c.value === 'string')
          .map((c: any) => ({ label: c.label.trim(), value: c.value.trim() }))
          .filter((c) => c.label && c.value);
      }
    } catch {
      /* ignore malformed custom */
    }
  }

  try {
    const peers = await discoverPeers(company, filters, qualitative, customConstraints);
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({ peers });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(502).json({ error: message });
  }
}
