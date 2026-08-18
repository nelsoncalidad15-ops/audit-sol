import React from 'react';
import { ShieldCheck, ArrowLeftRight, LockKeyhole, LockKeyholeOpen, Cloud, CloudCheck } from 'lucide-react';

interface HeaderProps {
  auditTitle: string;
  auditRunLabel: string;
  onChangeAudit: () => void;
  auditClosed: boolean;
  saveState: 'saved' | 'saving' | 'error';
  onToggleAuditClosed: () => void;
}

export const Header: React.FC<HeaderProps> = ({ auditTitle, auditRunLabel, onChangeAudit, auditClosed, saveState, onToggleAuditClosed }) => (
  <header className="h-16 bg-slate-950 text-white flex items-center px-4 sm:px-6 border-b border-slate-800 shrink-0 z-30 select-none">
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 p-2.5 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-950/30">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Auditoría de Calidad</p>
        <p className="mt-0.5 text-sm font-bold text-white">{auditTitle} <span className="font-medium text-slate-400">· {auditRunLabel}</span></p>
      </div>
    </div>
    <div className="ml-auto flex items-center gap-2">
      <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold ${saveState === 'error' ? 'text-rose-300' : 'text-slate-400'}`}>
        {saveState === 'saved' ? <CloudCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Cloud className="h-3.5 w-3.5" />}
        {saveState === 'saving' ? 'Guardando…' : saveState === 'error' ? 'Revisar guardado' : 'Guardado'}
      </span>
      <button type="button" onClick={onToggleAuditClosed} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors ${auditClosed ? 'border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white'}`}>
        {auditClosed ? <LockKeyholeOpen className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
        {auditClosed ? 'Reabrir' : 'Cerrar'}
      </button>
      <button type="button" onClick={onChangeAudit} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"><ArrowLeftRight className="h-3.5 w-3.5" /> Cambiar</button>
    </div>
  </header>
);
