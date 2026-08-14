import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Edit,
  FilePlus2,
  HelpCircle,
  Info,
  XCircle,
} from 'lucide-react';
import { AuditItem, ComplianceStatus, EvidenceLink } from '../types/audit';
import { EvidenceButton } from './EvidenceTypeBadge';
import { STATUS_CONFIG } from './AuditItemCard';

interface AuditModeProps {
  items: AuditItem[];
  onUpdateStatus: (itemId: string, status: ComplianceStatus) => void;
  onOpenEvidenceManager: (item: AuditItem) => void;
  onPreviewEvidence: (evidence: EvidenceLink) => void;
}

const statusActions: Array<{ status: ComplianceStatus; icon: React.ComponentType<{ className?: string }> }> = [
  { status: 'cumplida', icon: CheckCircle2 },
  { status: 'no_cumplida', icon: XCircle },
  { status: 'en_progreso', icon: HelpCircle },
];

export const AuditMode: React.FC<AuditModeProps> = ({
  items,
  onUpdateStatus,
  onOpenEvidenceManager,
  onPreviewEvidence,
}) => {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) {
      setActiveId(items[0]?.id ?? null);
    }
  }, [activeId, items]);

  const activeIndex = useMemo(
    () => Math.max(0, items.findIndex((item) => item.id === activeId)),
    [activeId, items]
  );
  const item = items[activeIndex];

  const goTo = (direction: -1 | 1) => {
    if (!items.length) return;
    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), items.length - 1);
    setActiveId(items[nextIndex].id);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, items]);

  if (!item) {
    return (
      <div className="flex-1 grid place-items-center p-8 text-center text-gray-500">
        <div>
          <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">No hay criterios con estos filtros</p>
          <p className="text-xs mt-1">Limpia o ajusta los filtros para continuar la auditoría.</p>
        </div>
      </div>
    );
  }

  const evidences = item.evidences || [];
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pendiente;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100/70 p-3 sm:p-5">
      <div className="max-w-5xl mx-auto">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5 rounded bg-slate-900 px-2 py-1 font-bold text-white">
              <ClipboardCheck className="w-3.5 h-3.5" /> Modo Auditoría
            </span>
            <span className="font-mono">Criterio {activeIndex + 1} de {items.length}</span>
          </div>
          <span className="hidden sm:inline text-[11px] text-gray-400">Usá ← y → para avanzar</span>
        </div>

        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 rounded bg-white/15 px-2.5 py-1 font-mono text-sm font-bold text-white">{item.code}</span>
              <span className="truncate text-xs font-medium text-slate-300">{item.section}</span>
            </div>
            <span className={`shrink-0 rounded border px-2 py-1 text-[11px] font-bold ${statusConfig.pillClass}`}>
              {statusConfig.label}
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center gap-1.5">
              {item.pv && <span className="rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">POSVENTA · PV</span>}
              {item.v && <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">VENTAS · V</span>}
            </div>

            <h1 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">{item.requirement}</h1>
            {item.question && item.question !== item.requirement && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.question}</p>
            )}

            {item.howToAudit && (
              <section className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-3.5">
                <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-blue-900">
                  <Info className="w-4 h-4" /> Cómo verificarlo
                </h2>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-blue-950">{item.howToAudit}</p>
              </section>
            )}

            <section className="mt-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-800">Evidencias ({evidences.length})</h2>
                <button
                  type="button"
                  onClick={() => onOpenEvidenceManager(item)}
                  className="inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                >
                  <FilePlus2 className="w-3.5 h-3.5" /> Vincular evidencia
                </button>
              </div>

              {evidences.length ? (
                <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {evidences.map((evidence) => (
                    <EvidenceButton
                      key={evidence.id}
                      evidence={evidence}
                      onClick={() => {
                        if (evidence.type === 'photo' || evidence.type === 'pdf') onPreviewEvidence(evidence);
                        else if (evidence.url) window.open(evidence.url, '_blank', 'noopener,noreferrer');
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                  Aún no hay evidencia vinculada para este criterio.
                </div>
              )}
            </section>

            <section className="mt-5 border-t border-slate-200 pt-4">
              <h2 className="mb-2 text-sm font-bold text-slate-800">Resultado de la verificación</h2>
              <div className="flex flex-wrap gap-2">
                {statusActions.map(({ status, icon: Icon }) => {
                  const config = STATUS_CONFIG[status];
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onUpdateStatus(item.id, status)}
                      className={`inline-flex items-center gap-1.5 rounded border px-3 py-2 text-xs font-bold transition-colors ${config.pillClass} ${item.status === status ? 'ring-2 ring-offset-1 ring-slate-400' : 'hover:brightness-95'}`}
                    >
                      <Icon className="w-4 h-4" /> {config.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => onOpenEvidenceManager(item)}
                  className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Edit className="w-4 h-4" /> Hallazgo y notas
                </button>
              </div>
            </section>
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            <button type="button" onClick={() => goTo(-1)} disabled={activeIndex === 0} className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
            <button type="button" onClick={() => goTo(1)} disabled={activeIndex === items.length - 1} className="inline-flex items-center gap-1 rounded bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-35">
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
};
