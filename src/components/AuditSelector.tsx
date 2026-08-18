import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CalendarDays, ClipboardCheck, ShieldCheck } from 'lucide-react';
import {
  AUDITS,
  BRANCH_LABELS,
  PCGC_CYCLE_LABELS,
  type AuditKey,
  type AuditRunContext,
  type BranchKey,
  type PcgcCycle,
} from '../data/auditConfig';

interface AuditSelectorProps {
  onSelect: (context: AuditRunContext) => void;
  initialAuditKey?: AuditKey | null;
}

export const AuditSelector: React.FC<AuditSelectorProps> = ({ onSelect, initialAuditKey = null }) => {
  const [auditKey, setAuditKey] = useState<AuditKey | null>(initialAuditKey);
  const [branch, setBranch] = useState<BranchKey>('jujuy');
  const [cycle, setCycle] = useState<PcgcCycle>('pcgc-1');
  const [year, setYear] = useState(new Date().getFullYear());
  const selectedAudit = auditKey ? AUDITS[auditKey] : null;
  const title = useMemo(() => selectedAudit?.title || '', [selectedAudit]);

  if (!auditKey) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] p-5 sm:p-8">
        <section className="mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200/70"><ShieldCheck className="h-7 w-7" /></div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Elegí la auditoría</h1>
            <p className="mt-2 text-sm text-slate-600">Cada auditoría mantiene sus propios criterios, resultados y evidencias.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {(['iso9001', 'pcgc'] as AuditKey[]).map((key) => {
              const isPcgc = key === 'pcgc';
              return (
                <button key={key} type="button" onClick={() => setAuditKey(key)} className={`group rounded-2xl border bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 ${isPcgc ? 'border-violet-100 hover:border-violet-300' : 'border-slate-200 hover:border-blue-300'}`}>
                  <div className={`mb-5 grid h-12 w-12 place-items-center rounded-xl ${isPcgc ? 'bg-violet-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {isPcgc ? <ClipboardCheck className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{isPcgc ? 'F21 · PCGC' : 'ISO 9001'}</h2>
                  <p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-600">{isPcgc ? 'Cuatro auditorías anuales por sede, con la matriz comercial PCGC.' : 'Auditoría anual de calidad, independiente para cada sede.'}</p>
                  <span className={`mt-5 inline-flex items-center gap-1 text-sm font-bold ${isPcgc ? 'text-violet-700' : 'text-blue-700'}`}>Ingresar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center bg-[#f6f8fc] p-5">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
        <button type="button" onClick={() => setAuditKey(null)} className="mb-5 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Cambiar auditoría</button>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">Elegí dónde se guardará esta auditoría.</p>
        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Building2 className="h-4 w-4" /> Sede</label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(BRANCH_LABELS) as BranchKey[]).map((key) => <button key={key} type="button" onClick={() => setBranch(key)} className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${branch === key ? auditKey === 'pcgc' ? 'border-violet-600 bg-violet-600 text-white' : 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}>{BRANCH_LABELS[key]}</button>)}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500"><span className="mb-2 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Año</span><input type="number" min="2025" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value) || new Date().getFullYear())} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600" /></label>
            {auditKey === 'pcgc' && <label className="text-xs font-bold uppercase tracking-wide text-slate-500"><span className="mb-2 flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Auditoría</span><select value={cycle} onChange={(event) => setCycle(event.target.value as PcgcCycle)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600">{(Object.keys(PCGC_CYCLE_LABELS) as PcgcCycle[]).map((key) => <option key={key} value={key}>{PCGC_CYCLE_LABELS[key]}</option>)}</select></label>}
          </div>
        </div>
        <button type="button" onClick={() => onSelect({ auditKey, branch, year, ...(auditKey === 'pcgc' ? { cycle } : {}) })} className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors ${auditKey === 'pcgc' ? 'bg-violet-700 hover:bg-violet-800' : 'bg-slate-900 hover:bg-slate-800'}`}>Abrir auditoría <ArrowRight className="h-4 w-4" /></button>
      </section>
    </main>
  );
};
