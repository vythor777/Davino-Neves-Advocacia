import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { AxiosError, AxiosHeaders } from 'axios';
import { NextRequest } from 'next/server';
import api from '../frontend/services/api.ts';
import authService from '../frontend/services/authService.ts';
import { clearSession, getSessionToken, SESSION_CLEARED_EVENT } from '../frontend/services/session.ts';
import { getLoginRedirect } from '../frontend/utils/loginRedirect.ts';
import { proxy } from '../frontend/proxy.ts';
import { getBackendApiUrl } from '../frontend/utils/backendUrl.ts';

const originalAdapter = api.defaults.adapter;
const globalNames = ['window', 'document', 'localStorage'] as const;
const originalGlobals = new Map(globalNames.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
let cookies: Map<string, string>;
let storage: Map<string, string>;
let events: EventTarget;

beforeEach(() => {
  cookies = new Map();
  storage = new Map();
  events = new EventTarget();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    location: { pathname: '/', protocol: 'https:' },
    dispatchEvent: events.dispatchEvent.bind(events),
  } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    get cookie() { return [...cookies].map(([name, value]) => `${name}=${value}`).join('; '); },
    set cookie(value: string) {
      const [pair] = value.split(';');
      const equals = pair.indexOf('=');
      const name = pair.slice(0, equals);
      if (/max-age=0/i.test(value)) cookies.delete(name);
      else cookies.set(name, pair.slice(equals + 1));
    },
  } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  } });
});

afterEach(() => {
  api.defaults.adapter = originalAdapter;
  for (const name of globalNames) {
    const descriptor = originalGlobals.get(name);
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});

function rejectWithStatus(status: number, beforeReject = () => {}) {
  api.defaults.adapter = async (config) => {
    beforeReject();
    throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
      status, statusText: 'Error', config, headers: new AxiosHeaders(),
      data: { message: 'Acesso não autorizado.' },
    });
  };
}

const user = { id: 1, nome: 'Teste', email: 'test@example.invalid', role: 'ADVOGADO' as const };

test('logout clears storage, current and legacy cookies and notifies the UI', () => {
  authService.setSession('current', user);
  cookies.set('auth_token', 'legacy');
  cookies.set('token', 'legacy');
  cookies.set('theme', 'dark');
  let notified = 0;
  events.addEventListener(SESSION_CLEARED_EVENT, () => notified++);
  clearSession();
  assert.equal(getSessionToken(), null);
  assert.equal(storage.size, 0);
  assert.deepEqual([...cookies], [['theme', 'dark']]);
  assert.equal(notified, 1);
});

test('cookie-only sessions send the bearer token to the API', async () => {
  cookies.set('davino_token', 'cookie-token');
  api.defaults.adapter = async (config) => {
    assert.equal(config.headers.Authorization, 'Bearer cookie-token');
    return { status: 200, statusText: 'OK', config, headers: {}, data: user };
  };
  assert.deepEqual(await authService.getProfile(), user);
});

test('401 clears both cookies and storage even while on the login page', async () => {
  authService.setSession('expired', user);
  window.location.pathname = '/login';
  rejectWithStatus(401);
  await assert.rejects(authService.getProfile(), { message: 'Acesso não autorizado.' });
  assert.equal(getSessionToken(), null);
  assert.equal(cookies.size, 0);
});

test('a stale request does not clear a newer login session', async () => {
  authService.setSession('old', user);
  rejectWithStatus(401, () => authService.setSession('new', user));
  await assert.rejects(authService.getProfile());
  assert.equal(getSessionToken(), 'new');
});

test('a network/server error preserves the login session', async () => {
  authService.setSession('valid', user);
  rejectWithStatus(503);
  await assert.rejects(authService.getProfile());
  assert.equal(getSessionToken(), 'valid');
});

test('invalid login credentials do not clear an existing session', async () => {
  authService.setSession('valid', user);
  rejectWithStatus(401);
  await assert.rejects(authService.login({ email: user.email, senha: 'incorrect' }));
  assert.equal(getSessionToken(), 'valid');
});

test('malformed cookies do not break login', () => {
  cookies.set('davino_token', '%E0%A4%A');
  assert.equal(getSessionToken(), null);
});

test('login accepts only local non-login redirect paths', () => {
  for (const value of [null, '', 'https://evil.invalid', '//evil.invalid', '/\\evil.invalid', 'javascript:alert(1)', '/login', '/login?redirect=/', '/login/extra', '/a/../login', '/%6cogin', '/\n/evil.invalid']) {
    assert.equal(getLoginRedirect(value), '/', String(value));
  }
  assert.equal(getLoginRedirect('/processos?q=123#detalhes'), '/processos?q=123#detalhes');
});

test('the proxy lets expired-cookie visitors reach login for reauthentication', () => {
  const request = new NextRequest('https://app.invalid/login?redirect=/processos', {
    headers: { cookie: 'davino_token=expired' },
  });
  const response = proxy(request);
  assert.equal(response.headers.get('location'), null);
  assert.equal(response.headers.get('x-middleware-next'), '1');
});

test('the proxy redirects visitors without a session to login', () => {
  const response = proxy(new NextRequest('https://app.invalid/processos'));
  assert.equal(response.headers.get('location'), 'https://app.invalid/login?redirect=%2Fprocessos');
});


test('Vercel can forward API requests using the configured public Render URL', () => {
  assert.equal(getBackendApiUrl({ NEXT_PUBLIC_API_URL: 'https://backend.onrender.com/api' }), 'https://backend.onrender.com/api');
});

test('backend routing preserves priority and avoids duplicate API prefixes', () => {
  assert.equal(getBackendApiUrl({ BACKEND_INTERNAL_URL: 'http://internal:10000/', BACKEND_URL: 'https://external.invalid/api' }), 'http://internal:10000/api');
  assert.equal(getBackendApiUrl({ BACKEND_URL: 'https://backend.invalid/api/' }), 'https://backend.invalid/api');
  assert.equal(getBackendApiUrl({ NEXT_PUBLIC_API_URL: '/api' }), 'http://127.0.0.1:10000/api');
});
