import { hasValidSession } from './session.mjs';

const json = (payload, status = 200) => Response.json(payload, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  if (!hasValidSession(request)) return json({ error: 'Acceso no autorizado.' }, 401);

  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const scriptToken = process.env.AUDIT_API_TOKEN;
  if (!scriptUrl || !scriptToken) return json({ error: 'El servicio de auditoría no está configurado.' }, 503);

  try {
    const body = await request.json();
    if (!['save_all', 'upload_evidence'].includes(body.action)) return json({ error: 'Acción no permitida.' }, 400);

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, token: scriptToken, auditorName: 'Portal privado' }),
    });
    const result = await response.json();
    return json(result, response.ok && result.success ? 200 : 502);
  } catch {
    return json({ error: 'No se pudo procesar la solicitud segura.' }, 500);
  }
};
