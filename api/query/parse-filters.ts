import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseQuery } from '../../src/server/azure';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const query = String((req.body as any)?.query ?? '').trim();
  if (!query) {
    res.status(400).json({ error: 'query required' });
    return;
  }

  try {
    const filters = await parseQuery(query);
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({ filters });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(502).json({ error: message });
  }
}
