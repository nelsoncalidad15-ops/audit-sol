import React, { useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

export const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const [isReady, setIsReady] = useState(isLocal);
  const [isAuthenticated, setIsAuthenticated] = useState(isLocal);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLocal) return;
    fetch('/.netlify/functions/auth', { credentials: 'same-origin' })
      .then((response) => response.json())
      .then((data) => setIsAuthenticated(Boolean(data.authenticated)))
      .catch(() => setError('No se pudo verificar el acceso.'))
      .finally(() => setIsReady(true));
  }, [isLocal]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'No se pudo ingresar.');
      setPassword('');
      setIsAuthenticated(true);
    } catch (reason: any) {
      setError(reason.message || 'Contraseña incorrecta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <main className="min-h-screen grid place-items-center bg-slate-100 p-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/70">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white"><ShieldCheck className="h-6 w-6" /></div>
        <h1 className="text-xl font-bold text-slate-900">Auditoría de Calidad</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Ingresá la contraseña del equipo para continuar.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={!isReady || isSubmitting}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          <button type="submit" disabled={!isReady || !password || isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            <LockKeyhole className="h-4 w-4" /> {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
};
