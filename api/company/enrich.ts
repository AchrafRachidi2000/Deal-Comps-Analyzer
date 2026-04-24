import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enrichCompany } from '../../src/server/perplexity';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const company = String((req.body as any)?.company ?? '').trim();
  if (!company) {
    res.status(400).json({ error: 'company required' });
    return;
  }

  try {
    const enrichment = await enrichCompany(company);
    res.setHeader('cache-control', 'no-store');
    res.status(200).json(enrichment);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(502).json({ error: message });
  }
}
