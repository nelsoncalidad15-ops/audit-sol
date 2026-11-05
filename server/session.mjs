import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'audit_portal_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;
const getSecret = (env) => env.PORTAL_PASSWORD || '';
const sign = (value, env) => createHmac('sha256', getSecret(env)).update(value).digest('base64url');

const readCookie = (request, name) => {
  const value = request.headers.get('cookie') || '';
  return value.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
};

export const hasValidSession = (request, env) => {
  const secret = getSecret(env);
  const token = readCookie(request, COOKIE_NAME);
  if (!secret || !token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || token.split('.').length !== 2) return false;
  const expected = sign(payload, env);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  try {
    return Number(JSON.parse(Buffer.from(payload, 'base64url').toString()).exp) > Date.now();
  } catch {
    return false;
  }
};

export const isCorrectPassword = (password, env) => {
  const secret = getSecret(env);
  if (!secret || typeof password !== 'string' || Buffer.byteLength(password) !== Buffer.byteLength(secret)) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(secret));
};

export const createSessionCookie = (env) => {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE_SECONDS * 1000 })).toString('base64url');
  return `${COOKIE_NAME}=${payload}.${sign(payload, env)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`;
};
