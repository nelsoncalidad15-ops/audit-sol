import { DocumentList } from './DocumentList';
import { RequirementDetails } from './iso/RequirementDetails';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Edit,
  FilePlus2,
  HelpCircle,
  XCircle,
  Search,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  User,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileCheck2
} from 'lucide-react';
import { AuditItem, ComplianceStatus, EvidenceLink } from '../types/audit';
import { EvidenceButton } from './EvidenceTypeBadge';
import { StatusBadge, STATUS_CONFIG } from './common/StatusBadge';
import { OriginBadge } from './common/OriginBadge';
import { IsoClauseBadge } from './common/IsoClauseBadge';

interface AuditModeProps {
  items: AuditItem[];
  initialItemId?: string | null;
  onUpdateStatus: (itemId: string, status: ComplianceStatus) => void;
  onOpenEvidenceManager: (item: AuditItem) => void;
  onPreviewEvidence: (evidence: EvidenceLink) => void;
  onSaveFinding?: (itemId: string, finding: string) => void;
  onOpenActionItemModal?: (requirement: AuditItem) => void;
  readOnly?: boolean;
}

const statusActions: Array<{ status: ComplianceStatus; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { status: 'cumplida', label: 'Conforme (Cumple)', icon: CheckCircle2 },
  { status: 'en_progreso', label: 'En Proceso / Parcial', icon: HelpCircle },
  { status: 'no_cumplida', label: 'No Conforme (Desvío)', icon: XCircle },
  { status: 'no_aplica', label: 'No Aplica', icon: HelpCircle },
];

export const AuditMode: React.FC<AuditModeProps> = ({
  items,
  initialItemId = null,
  onUpdateStatus,
  onOpenEvidenceManager,
  onPreviewEvidence,
  onSaveFinding,
  onOpenActionItemModal,
  readOnly = false,
}) => {
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (initialItemId && items.some((i) => i.id === initialItemId)) return initialItemId;
    return items[0]?.id ?? null;
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [isHowToCheckOpen, setIsHowToCheckOpen] = useState(false);
  const [isFindingEditing, setIsFindingEditing] = useState(false);
  const [findingText, setFindingText] = useState('');

  // Keep activeId in sync if filtered list changes
  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) {
      setActiveId(items[0]?.id ?? null);
    }
  }, [initialItemId, items, activeId]);

  const activeIndex = useMemo(
    () => Math.max(0, items.findIndex((item) => item.id === activeId)),
    [activeId, items]
  );
  const item = items[activeIndex];

  // Initialize finding text when item changes
  useEffect(() => {
    if (item) {
      setFindingText(item.finding || '');
      setIsFindingEditing(false);
    }
  }, [item?.id]);

  const goTo = (direction: -1 | 1) => {
    if (!items.length) return;
    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), items.length - 1);
    setActiveId(items[nextIndex].id);
  };

  // Keyboard navigation
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

  const handleSaveInlineFinding = () => {
    if (item && onSaveFinding) {
      onSaveFinding(item.id, findingText);
    }
    setIsFindingEditing(false);
  };

  if (!item) {
    return (
      <div className="flex-1 grid place-items-center p-8 text-center text-slate-500 bg-slate-50">
        <div>
          <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-800">No hay criterios para auditar con estos filtros</p>
          <p className="text-xs text-slate-500 mt-1">Ajustá la búsqueda o limpiá los filtros para continuar.</p>
        </div>
      </div>
    );
  }

  const evidences = item.evidences || [];
  const validEvidences = evidences.filter((e) => Boolean(e.url && e.url.trim().length > 0));
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pendiente;

  // Filter dropdown options by search
  const searchableItems = searchFilter
    ? items.filter(it => [it.code, it.requirement, ...it.evidences.flatMap(ev => [ev.title, ev.description, ev.revision, ev.documentKind === 'procedure' ? 'procedimiento' : ev.documentKind === 'record' ? 'registro' : ''])].some(text => (text || '').toLowerCase().includes(searchFilter.toLowerCase().trim())))
    : items;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100/70 p-3 sm:p-5 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-3">
        {/* TOP DIRECT JUMP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-2.5 sm:px-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shrink-0">
              <ClipboardCheck className="w-3.5 h-3.5" /> Modo Auditor
            </span>

            <span className="text-xs font-mono text-slate-500">
              {activeIndex + 1} de {items.length}
            </span>
          </div>

          {/* Direct jump selector without exiting */}
          <div className="flex items-center gap-2 flex-1 max-w-xs justify-end">
            <select
              value={item.id}
              onChange={(e) => setActiveId(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 outline-none focus:border-blue-500"
            >
              {items.map((it, idx) => (
                <option key={it.id} value={it.id}>
                  {idx + 1}. [{it.code}] {it.requirement.substring(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium hidden md:inline-flex">
            <span>Usá flechas ← y → del teclado</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label htmlFor="auditor-search" className="block text-xs font-medium text-slate-600 mb-2">Encontrar un punto o documento</label>
          <input id="auditor-search" type="search" value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Ej.: 8.4, compras, PR-07…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          {searchFilter.trim() && <div className="max-h-60 overflow-y-auto mt-2" aria-live="polite">
            <p className="text-xs text-slate-500 py-2">{searchableItems.length} puntos encontrados</p>
            {searchableItems.map(result => <button key={result.id} type="button" onClick={() => { setActiveId(result.id); setSearchFilter(''); }} className="block w-full text-left p-2 rounded-lg hover:bg-slate-50 text-sm">
              <span className="font-mono text-blue-700 mr-2">{result.code}</span>{result.requirement}
              <span className="block text-xs text-slate-500 mt-1">{result.evidences.filter(e => e.url).map(e => e.title).join(' · ') || 'Sin documentos'}</span>
            </button>)}
          </div>}
        </div>
        {/* MAIN AUDIT REQUIREMENT CARD */}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Card Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-5 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="font-mono text-sm font-extrabold bg-blue-600 px-2.5 py-0.5 rounded text-white">
                {item.code}
              </span>
              <div className="min-w-0">
                <span className="text-xs text-slate-300 truncate block">
                  {item.chapter} › {item.section}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.originType && <OriginBadge originType={item.originType} size="sm" />}
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${statusConfig.pillClass}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* Badges and Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {item.isoClause && <IsoClauseBadge clause={item.isoClause} size="sm" />}
              {item.pv && (
                <span className="rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                  POSVENTA · PV
                </span>
              )}
              {item.v && (
                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  VENTAS · V
                </span>
              )}
            </div>

            {/* Requirement Title */}
            <div>
              <h1 className="text-lg sm:text-xl font-bold leading-snug text-slate-900">
                {item.requirement}
              </h1>
              {item.question && item.question.trim() !== item.requirement.trim() && (
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Pregunta:</span>
                  {item.question}
                </p>
              )}
            </div>

            <section>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-sm font-semibold text-slate-800">Documentos del punto ({validEvidences.length})</h2>
                {!readOnly && <button type="button" onClick={() => onOpenEvidenceManager(item)} className="text-xs text-blue-700 hover:underline">Agregar o gestionar evidencia</button>}
              </div>
              <DocumentList evidences={evidences} />
            </section>
            <RequirementDetails item={item} />
            {item.comment && <details className="text-sm text-slate-600"><summary className="cursor-pointer">Comentario</summary><p className="whitespace-pre-wrap mt-2">{item.comment}</p></details>}

            {/* 5. Verification Result (1-Click Status buttons) */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                Resultado de la Verificación:
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {statusActions.map(({ status, label, icon: Icon }) => {
                  const cfg = STATUS_CONFIG[status];
                  const isSelected = item.status === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onUpdateStatus(item.id, status)}
                      disabled={readOnly}
                      className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? `${cfg.pillClass} ring-2 ring-slate-900 shadow-xs`
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Inline Notes & Findings Editor */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>Hallazgo u Observación Rápida:</span>
                </h2>

                {onOpenActionItemModal && (
                  <button
                    type="button"
                    onClick={() => onOpenActionItemModal(item)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Crear tarea de corrección</span>
                  </button>
                )}
              </div>

              {isFindingEditing ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={findingText}
                    onChange={(e) => setFindingText(e.target.value)}
                    placeholder="Registrá el hallazgo o nota de auditoría..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFindingEditing(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveInlineFinding}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      Guardar nota
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => !readOnly && setIsFindingEditing(true)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer text-xs text-slate-600"
                >
                  {findingText ? (
                    <span className="text-rose-950 font-medium">⚠️ {findingText}</span>
                  ) : (
                    <span className="text-slate-400 italic">Hacé clic aquí para registrar un hallazgo o nota...</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
            <button
              type="button"
              onClick={() => goTo(-1)}
              disabled={activeIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-xs font-mono text-slate-500 font-semibold">
              Criterio {activeIndex + 1} / {items.length}
            </span>

            <button
              type="button"
              onClick={() => goTo(1)}
              disabled={activeIndex === items.length - 1}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
};
