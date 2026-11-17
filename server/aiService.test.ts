import test from 'node:test';
import assert from 'node:assert/strict';
import { isRetryableModelError, resolveGeminiApiKey } from './aiService';
import netlifyApiHandler from '../netlify/functions/api';

test('resolveGeminiApiKey rejects empty values and placeholders', () => {
  assert.equal(resolveGeminiApiKey({ processEnv: {} }), null);
  assert.equal(
    resolveGeminiApiKey({ processEnv: { GEMINI_API_KEY: 'MY_GEMINI_API_KEY' } }),
    null
  );
  assert.equal(
    resolveGeminiApiKey({ processEnv: { GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY' } }),
    null
  );
});

test('resolveGeminiApiKey reads GEMINI_API_KEY and fallback env var names', () => {
  assert.equal(
    resolveGeminiApiKey({ processEnv: { GEMINI_API_KEY: '  test-key-123  ' } }),
    'test-key-123'
  );
  assert.equal(
    resolveGeminiApiKey({ processEnv: { GOOGLE_API_KEY: 'google-key-456' } }),
    'google-key-456'
  );
  assert.equal(
    resolveGeminiApiKey({
      processEnv: {},
      netlifyGet: (k) => (k === 'GEMINI_API_KEY' ? 'netlify-env-key' : undefined),
    }),
    'netlify-env-key'
  );
});

test('isRetryableModelError retries model fallback errors but stops on invalid API key', () => {
  assert.equal(isRetryableModelError(new Error('404 models/gemini-4-hydrogen not found')), true);
  assert.equal(isRetryableModelError(new Error('503 Service Unavailable')), true);
  assert.equal(isRetryableModelError(new Error('API key not valid (API_KEY_INVALID)')), false);
});

test('netlify/functions/api handles /api/health, /api/ai/status, and 404 cleanly', async () => {
  const healthRes = await netlifyApiHandler(new Request('https://example.netlify.app/api/health'));
  assert.equal(healthRes.status, 200);
  const healthJson = (await healthRes.json()) as { ok: boolean; service: string };
  assert.equal(healthJson.ok, true);
  assert.equal(healthJson.service, 'SynapseStudy AI');

  const statusRes = await netlifyApiHandler(
    new Request('https://example.netlify.app/.netlify/functions/api/ai/status')
  );
  assert.equal(statusRes.status, 200);
  const statusJson = (await statusRes.json()) as {
    serverReachable: boolean;
    runtime: string;
  };
  assert.equal(statusJson.serverReachable, true);
  assert.equal(statusJson.runtime, 'netlify');

  const missingRes = await netlifyApiHandler(
    new Request('https://example.netlify.app/api/unknown-route')
  );
  assert.equal(missingRes.status, 404);
});
