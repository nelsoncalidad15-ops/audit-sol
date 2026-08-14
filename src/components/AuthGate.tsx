import React, { useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

declare global {
  interface Window { netlifyIdentity?: any; }
}

export const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const [isReady, setIsReady] = useState(isLocal);
  const [isAuthenticated, setIsAuthenticated] = useState(isLocal);

  useEffect(() => {
    if (isLocal || !window.netlifyIdentity) return;
    const identity = window.netlifyIdentity;
    identity.on('init', (user: unknown) => { setIsAuthenticated(Boolean(user)); setIsReady(true); });
    identity.on('login', () => { setIsAuthenticated(true); identity.close(); });
    identity.on('logout', () => setIsAuthenticated(false));
    identity.init();
  }, [isLocal]);

  if (isAuthenticated) return <>{children}</>;

  return (
    <main className="min-h-screen grid place-items-center bg-slate-100 p-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/70">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white"><ShieldCheck className="h-6 w-6" /></div>
        <h1 className="text-xl font-bold text-slate-900">Auditoría de Calidad</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Acceso reservado para el equipo autorizado.</p>
        <button type="button" disabled={!isReady || !window.netlifyIdentity} onClick={() => window.netlifyIdentity?.open('login')} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50">
          <LockKeyhole className="h-4 w-4" /> Ingresar
        </button>
      </section>
    </main>
  );
};
