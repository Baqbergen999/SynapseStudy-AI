import {
  ApiHttpError,
  generatePracticalTasks,
  generateProjectPlan,
  generateStudyNotes,
  getAiStatus,
  getHealthStatus,
  transcribeAudio,
} from '../../server/aiService';

export const config = {
  path: '/api/*',
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function normalizeApiPath(rawPathname: string): string {
  let path = rawPathname;
  if (path.startsWith('/.netlify/functions/api')) {
    path = path.slice('/.netlify/functions/api'.length);
  } else if (path.startsWith('/api')) {
    path = path.slice('/api'.length);
  }
  return path.startsWith('/') ? path : `/${path}`;
}

async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ApiHttpError(400, 'Invalid JSON request body.');
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const url = new URL(req.url);
  const subPath = normalizeApiPath(url.pathname);

  try {
    if (req.method === 'GET' && subPath === '/health') {
      return jsonResponse(getHealthStatus());
    }

    if (req.method === 'GET' && subPath === '/ai/status') {
      return jsonResponse(getAiStatus('netlify'));
    }

    if (req.method === 'POST' && subPath === '/ai/transcribe') {
      const body = await parseJsonBody<Parameters<typeof transcribeAudio>[0]>(req);
      const result = await transcribeAudio(body);
      return jsonResponse(result);
    }

    if (req.method === 'POST' && subPath === '/ai/notes') {
      const body = await parseJsonBody<Parameters<typeof generateStudyNotes>[0]>(req);
      const result = await generateStudyNotes(body);
      return jsonResponse(result);
    }

    if (req.method === 'POST' && subPath === '/ai/tasks') {
      const body = await parseJsonBody<Parameters<typeof generatePracticalTasks>[0]>(req);
      const result = await generatePracticalTasks(body);
      return jsonResponse(result);
    }

    if (req.method === 'POST' && subPath === '/ai/project-plan') {
      const body = await parseJsonBody<Parameters<typeof generateProjectPlan>[0]>(req);
      const result = await generateProjectPlan(body);
      return jsonResponse(result);
    }

    return jsonResponse({ error: 'API endpoint not found.' }, 404);
  } catch (err: unknown) {
    if (err instanceof ApiHttpError) {
      return jsonResponse({ error: err.message }, err.status);
    }
    const msg = err instanceof Error ? err.message : 'Unexpected server error.';
    return jsonResponse({ error: msg }, 502);
  }
}
