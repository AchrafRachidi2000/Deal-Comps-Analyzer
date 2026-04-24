import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchYahooPeer } from '../../src/server/yahoo.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET');
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const ticker = String(req.query.ticker ?? '').trim();
  if (!ticker) {
    res.status(400).json({ error: 'ticker required' });
    return;
  }

  try {
    const data = await fetchYahooPeer(ticker);
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({ ticker, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(502).json({ ticker, error: message });
  }
}
