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
    if (initialItemId && items.some((i) => i.id === initialItemId)) {
      setActiveId(initialItemId);
    } else if (!items.some((item) => item.id === activeId)) {
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
    ? items.filter((it) => it.code.toLowerCase().includes(searchFilter.toLowerCase()) || it.requirement.toLowerCase().includes(searchFilter.toLowerCase()))
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

            {/* 1. Descripción del Requerimiento — OFICIAL */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5">
                Descripción del Requerimiento (Oficial):
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* 2. Cómo Auditar — OFICIAL */}
            {item.howToAudit && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-950 mb-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Cómo Auditar · Instrucciones y Muestreo (Oficial):</span>
                </h2>
                <p className="text-xs sm:text-sm text-blue-950 leading-relaxed whitespace-pre-line">
                  {item.howToAudit}
                </p>
              </div>
            )}

            {/* 3. Orientación interna */}
            {(item.whatToShow || item.whatToVerify || item.howToCheck) && (
              <div className="border border-amber-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsHowToCheckOpen(!isHowToCheckOpen)}
                  className="w-full flex items-center justify-between p-3 bg-amber-50/80 hover:bg-amber-100/80 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span>Orientación Interna · Guía Rápida y Documentación Sugerida</span>
                  </span>
                  {isHowToCheckOpen ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
                </button>

                {isHowToCheckOpen && (
                  <div className="p-4 bg-white border-t border-amber-200 space-y-2.5">
                    {item.whatToVerify && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">Qué se verifica (orientación):</span>
                        <p className="text-xs text-amber-950 leading-relaxed">{item.whatToVerify}</p>
                      </div>
                    )}
                    {item.whatToShow && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">Documentación sugerida (orientación):</span>
                        <p className="text-xs text-amber-950 leading-relaxed">{item.whatToShow}</p>
                      </div>
                    )}
                    {item.howToCheck && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">Cómo comprobarlo (orientación):</span>
                        <p className="text-xs text-amber-950 leading-relaxed whitespace-pre-line">{item.howToCheck}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. Direct Evidences Links */}
            <div>
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  <span>Evidencias Disponibles ({validEvidences.length})</span>
                </h2>

                <button
                  type="button"
                  onClick={() => onOpenEvidenceManager(item)}
                  disabled={readOnly}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <FilePlus2 className="w-3.5 h-3.5" />
                  <span>Gestionar evidencias</span>
                </button>
              </div>

              {validEvidences.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  {validEvidences.map((evidence) => (
                    <EvidenceButton
                      key={evidence.id}
                      evidence={evidence}
                      onClick={() => {
                        if (evidence.type === 'photo' || evidence.type === 'pdf') {
                          onPreviewEvidence(evidence);
                        } else if (evidence.url) {
                          window.open(evidence.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 px-4 py-3.5 text-xs sm:text-sm text-amber-900 flex items-center justify-between">
                  <span>Aún no hay evidencias vinculadas para este criterio.</span>
                  <button
                    type="button"
                    onClick={() => onOpenEvidenceManager(item)}
                    className="font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    + Adjuntar archivo
                  </button>
                </div>
              )}
            </div>

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
                  onClick={() => setIsFindingEditing(true)}
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
