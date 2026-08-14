import { createSessionCookie, hasValidSession, isCorrectPassword } from './session.mjs';

const json = (payload, status = 200, headers = {}) => Response.json(payload, {
  status,
  headers: { 'Cache-Control': 'no-store', ...headers },
});

export default async (request) => {
  if (request.method === 'GET') return json({ authenticated: hasValidSession(request) });
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  try {
    const { password } = await request.json();
    if (!isCorrectPassword(password)) return json({ error: 'Contraseña incorrecta.' }, 401);
    return json({ success: true }, 200, { 'Set-Cookie': createSessionCookie() });
  } catch {
    return json({ error: 'No se pudo iniciar sesión.' }, 400);
  }
};
