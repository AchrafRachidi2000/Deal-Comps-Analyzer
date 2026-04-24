import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateInsights } from '../src/server/azure.js';
import type { InsightsRequest } from '../src/server/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const body = req.body as InsightsRequest;
  if (!body?.targetCompany || !Array.isArray(body?.peers) || body.peers.length === 0) {
    res.status(400).json({ error: 'targetCompany and non-empty peers[] required' });
    return;
  }

  try {
    const insights = await generateInsights(body);
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({ insights });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(502).json({ error: message });
  }
}
