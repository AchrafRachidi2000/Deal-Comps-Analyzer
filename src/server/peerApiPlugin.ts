import type { Plugin } from 'vite';
import dotenv from 'dotenv';
import { fetchYahooPeer } from './yahoo.js';
import { discoverPeers, enrichCompany } from './perplexity.js';
import { generateInsights, parseQuery } from './azure.js';
import { runAssistantChatStream } from './assistant.js';
import type {
  AssistantChatRequest,
  CustomConstraint,
  InsightsRequest,
} from './types.js';

dotenv.config();

async function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export function peerApiPlugin(): Plugin {
  return {
    name: 'peer-api',
    configureServer(server) {
      server.middlewares.use('/api/peer', async (req, res, next) => {
        if (req.method !== 'GET') return next();
        const url = new URL(req.url ?? '/', 'http://localhost');
        const ticker = url.pathname.replace(/^\/+/, '').trim();
        if (!ticker) {
          res.statusCode = 400;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'ticker required' }));
          return;
        }
        try {
          const data = await fetchYahooPeer(ticker);
          res.statusCode = 200;
          res.setHeader('content-type', 'application/json');
          res.setHeader('cache-control', 'no-store');
          res.end(JSON.stringify({ ticker, data }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error';
          res.statusCode = 502;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ticker, error: message }));
        }
      });

      server.middlewares.use('/api/peers/discover', async (req, res, next) => {
        if (req.method !== 'GET') return next();
        const url = new URL(req.url ?? '/', 'http://localhost');
        const company = (url.searchParams.get('company') ?? '').trim();
        if (!company) {
          res.statusCode = 400;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'company required' }));
          return;
        }
        const filters = {
          sector: url.searchParams.get('sector') ?? undefined,
          geography: url.searchParams.get('geography') ?? undefined,
          marketCap: url.searchParams.get('marketCap') ?? undefined,
          revenue: url.searchParams.get('revenue') ?? undefined,
        };
        const qualitative = url.searchParams.get('qualitative') ?? undefined;
        let customConstraints: CustomConstraint[] | undefined;
        const customRaw = url.searchParams.get('custom');
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
          res.statusCode = 200;
          res.setHeader('content-type', 'application/json');
          res.setHeader('cache-control', 'no-store');
          res.end(JSON.stringify({ peers }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error';
          res.statusCode = 502;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });

      server.middlewares.use('/api/company/enrich', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const body = (await readJsonBody(req)) as { company?: string };
          const company = (body?.company ?? '').trim();
          if (!company) {
            res.statusCode = 400;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: 'company required' }));
            return;
          }
          const enrichment = await enrichCompany(company);
          res.statusCode = 200;
          res.setHeader('content-type', 'application/json');
          res.setHeader('cache-control', 'no-store');
          res.end(JSON.stringify(enrichment));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error';
          res.statusCode = 502;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });

      server.middlewares.use('/api/query/parse-filters', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const body = (await readJsonBody(req)) as { query?: string };
          const query = (body?.query ?? '').trim();
          if (!query) {
            res.statusCode = 400;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: 'query required' }));
            return;
          }
          const filters = await parseQuery(query);
          res.statusCode = 200;
          res.setHeader('content-type', 'application/json');
          res.setHeader('cache-control', 'no-store');
          res.end(JSON.stringify({ filters }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error';
          res.statusCode = 502;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });

      server.middlewares.use('/api/assistant/chat', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body: AssistantChatRequest;
        try {
          body = (await readJsonBody(req)) as AssistantChatRequest;
        } catch {
          res.statusCode = 400;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'invalid JSON body' }));
          return;
        }

        if (!body?.state || !Array.isArray(body?.messages) || body.messages.length === 0) {
          res.statusCode = 400;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'state and non-empty messages[] required' }));
          return;
        }

        res.statusCode = 200;
        res.setHeader('content-type', 'text/event-stream; charset=utf-8');
        res.setHeader('cache-control', 'no-cache, no-transform');
        res.setHeader('connection', 'keep-alive');
        res.setHeader('x-accel-buffering', 'no');
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
      });

      server.middlewares.use('/api/insights', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const body = (await readJsonBody(req)) as InsightsRequest;
          if (!body?.targetCompany || !Array.isArray(body?.peers) || body.peers.length === 0) {
            res.statusCode = 400;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: 'targetCompany and non-empty peers[] required' }));
            return;
          }
          const insights = await generateInsights(body);
          res.statusCode = 200;
          res.setHeader('content-type', 'application/json');
          res.setHeader('cache-control', 'no-store');
          res.end(JSON.stringify({ insights }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error';
          res.statusCode = 502;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}
