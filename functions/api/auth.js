import { createSessionCookie, hasValidSession, isCorrectPassword } from '../../server/session.mjs';

const json = (payload, status = 200, headers = {}) => Response.json(payload, {
  status,
  headers: { 'Cache-Control': 'no-store', ...headers },
});

export const onRequest = async ({ request, env }) => {
  if (request.method === 'GET') return json({ authenticated: hasValidSession(request, env) });
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  try {
    const { password } = await request.json();
    if (!isCorrectPassword(password, env)) return json({ error: 'Contraseña incorrecta.' }, 401);
    return json({ success: true }, 200, { 'Set-Cookie': createSessionCookie(env) });
  } catch {
    return json({ error: 'No se pudo iniciar sesión.' }, 400);
  }
};
