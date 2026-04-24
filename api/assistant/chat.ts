import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runAssistantChatStream } from '../../src/server/assistant';
import type { AssistantChatRequest } from '../../src/server/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const body = req.body as AssistantChatRequest;
  if (!body?.state || !Array.isArray(body?.messages) || body.messages.length === 0) {
    res.status(400).json({ error: 'state and non-empty messages[] required' });
    return;
  }

  res.statusCode = 200;
  res.setHeader('content-type', 'text/event-stream; charset=utf-8');
  res.setHeader('cache-control', 'no-cache, no-transform');
  res.setHeader('connection', 'keep-alive');
  res.setHeader('x-accel-buffering', 'no');
  // Flush headers so the client starts receiving events immediately.
  (res as any).flushHeaders?.();

  const emit = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await runAssistantChatStream(body, emit);
  } catch (err) {
    emit('error', { message: err instanceof Error ? err.message : 'assistant failed' });
  } finally {
    res.end();
  }
}
