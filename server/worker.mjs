import { onRequest as auth } from '../functions/api/auth.js';
import { onRequest as audit } from '../functions/api/audit.js';

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/auth') return auth({ request, env });
    if (path === '/api/audit') return audit({ request, env });
    if (path.startsWith('/api/')) {
      return Response.json({ error: 'Ruta no encontrada.' }, { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
};
