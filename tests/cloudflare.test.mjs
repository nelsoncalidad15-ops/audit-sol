import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { onRequest as auth } from '../functions/api/auth.js';
import { onRequest as audit } from '../functions/api/audit.js';
import { createSessionCookie, hasValidSession } from '../server/session.mjs';
import worker from '../server/worker.mjs';

test('Worker routes API requests separately from static assets', async () => {
  const config = { ASSETS: { fetch: async () => new Response('interface') } };
  assert.equal((await worker.fetch(new Request('https://example.com/api/missing'), config)).status, 404);
  const authResponse = await worker.fetch(new Request('https://example.com/api/auth'), config);
  assert.deepEqual(await authResponse.json(), { authenticated: false });
  assert.equal(await (await worker.fetch(new Request('https://example.com/pcgc'), config)).text(), 'interface');
});

const env = { PORTAL_PASSWORD: 'contraseña-de-prueba' };
const request = (path, body, cookie) => new Request(`https://example.com/api/${path}`, {
  method: body ? 'POST' : 'GET',
  headers: cookie ? { cookie } : {},
  ...(body ? { body: JSON.stringify(body) } : {}),
});

test('login accepts the password and issues a secure session', async () => {
  const response = await auth({ request: request('auth', { password: env.PORTAL_PASSWORD }), env });
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict/);
  const session = await auth({ request: request('auth', null, cookie), env });
  assert.deepEqual(await session.json(), { authenticated: true });
});

test('incorrect or unconfigured passwords fail closed', async () => {
  for (const config of [env, {}]) {
    const response = await auth({ request: request('auth', { password: 'incorrecta' }), env: config });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('set-cookie'), null);
  }
});

test('tampered, expired and rotated sessions are rejected', () => {
  const cookie = createSessionCookie(env).split(';')[0];
  assert.equal(hasValidSession(request('auth', null, cookie + 'x'), env), false);
  assert.equal(hasValidSession(request('auth', null, cookie), { PORTAL_PASSWORD: 'changed' }), false);
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() - 1000 })).toString('base64url');
  const signature = createHmac('sha256', env.PORTAL_PASSWORD).update(payload).digest('base64url');
  assert.equal(hasValidSession(request('auth', null, `audit_portal_session=${payload}.${signature}`), env), false);
});

test('audit requires authorization and forwards the server token', async (t) => {
  assert.equal((await audit({ request: request('audit', { action: 'load_all' }), env })).status, 401);
  const cookie = createSessionCookie(env);
  const config = { ...env, APPS_SCRIPT_URL: 'https://example.com/exec', AUDIT_API_TOKEN: 'server-secret' };
  let forwarded;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, config.APPS_SCRIPT_URL);
    forwarded = JSON.parse(options.body);
    return Response.json({ success: true, items: [] });
  });
  const response = await audit({ request: request('audit', { action: 'load_all', token: 'forged' }, cookie), env: config });
  assert.equal(response.status, 200);
  assert.equal(forwarded.token, config.AUDIT_API_TOKEN);
  assert.equal((await audit({ request: request('audit', { action: 'unknown' }, cookie), env: config })).status, 400);
});
