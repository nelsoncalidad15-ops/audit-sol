import React, { useState } from 'react';
import { 
  AuditItem, 
  ComplianceStatus, 
  EvidenceLink 
} from '../types/audit';
import { EvidenceButton } from './EvidenceTypeBadge';
import { StatusBadge, STATUS_CONFIG } from './common/StatusBadge';
import { OriginBadge } from './common/OriginBadge';
import { IsoClauseBadge } from './common/IsoClauseBadge';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  FileCheck2, 
  Edit,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  HelpCircle,
  FolderOpen
} from 'lucide-react';

export { STATUS_CONFIG };

interface AuditItemCardProps {
  item: AuditItem;
  onOpenEvidenceModal: (item: AuditItem) => void;
  onQuickAddEvidence: (item: AuditItem) => void;
  onUpdateStatus: (itemId: string, status: ComplianceStatus) => void;
  onQuickPreviewEvidence?: (evidence: EvidenceLink) => void;
  readOnly?: boolean;
}

export const AuditItemCard: React.FC<AuditItemCardProps> = ({
  item,
  onOpenEvidenceModal,
  onQuickAddEvidence,
  onUpdateStatus,
  onQuickPreviewEvidence,
  readOnly = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const evidences = item.evidences || [];
  const validEvidences = evidences.filter((e) => Boolean(e.url && e.url.trim().length > 0));
  const verifiedCount = validEvidences.filter((e) => e.verified).length;

  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pendiente;

  // Text formatting: avoid redundancy if requirement and question are identical
  const showQuestion = item.question && item.question.trim() !== item.requirement.trim();
  const expectedDocs = item.whatToShow;

  return (
    <article
      id={`audit-card-${item.id}`}
      className={`group flex flex-col justify-between rounded-xl border bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-sm ${
        item.status === 'no_cumplida'
          ? 'border-rose-200 bg-rose-50/10'
          : item.status === 'cumplida'
          ? 'border-slate-200/90'
          : validEvidences.length === 0
          ? 'border-amber-200/80 bg-amber-50/5'
          : 'border-slate-200/80'
      }`}
    >
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col">
        {/* Header: Code, Clause/Origin, PV/V, Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">
              {item.code}
            </span>
            {item.originType && (
              <OriginBadge originType={item.originType} size="sm" />
            )}
            {item.pv && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200" title="Aplica a Posventa (PV)">
                PV
              </span>
            )}
            {item.v && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Aplica a Ventas (V)">
                V
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={item.status}
              onChange={(e) => onUpdateStatus(item.id, e.target.value as ComplianceStatus)}
              disabled={readOnly}
              aria-label="Estado del requisito"
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors ${statusCfg.pillClass}`}
            >
              <option value="cumplida">✓ Cumple</option>
              <option value="en_progreso">⏳ En Proceso</option>
              <option value="no_cumplida">✗ No Cumple</option>
              <option value="no_aplica">⊘ No Aplica</option>
              <option value="pendiente">Pendiente</option>
            </select>

            <button
              type="button"
              onClick={() => onOpenEvidenceModal(item)}
              disabled={readOnly}
              title="Gestionar evidencias y observaciones"
              className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="sr-only">Detalles</span>
            </button>
          </div>
        </div>

        {/* Title & Quick guidance */}
        <div className="my-3 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1 truncate">
            <span>{item.chapter}</span>
            <span>›</span>
            <span className="truncate">{item.section}</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {item.requirement}
          </h3>

          {showQuestion && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
              <span className="text-slate-400">Pregunta:</span> {item.question}
            </p>
          )}

          {expectedDocs && !isExpanded && (
            <div className="mt-2.5 text-[11px] text-indigo-900 bg-indigo-50/70 px-2.5 py-1.5 rounded-lg border border-indigo-100 flex items-start gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                <strong className="font-semibold text-indigo-950">Orientación operativa:</strong> {expectedDocs}
              </span>
            </div>
          )}
        </div>

        {/* Evidences quick section */}
        <div className="rounded-lg bg-slate-50 border border-slate-200/70 p-2.5 mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-xs font-bold text-slate-700">
                Evidencias ({validEvidences.length})
              </span>
              {verifiedCount > 0 && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                  {verifiedCount} verif.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onQuickAddEvidence(item)}
              disabled={readOnly}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Adjuntar</span>
            </button>
          </div>

          {validEvidences.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {validEvidences.map((ev) => (
                <EvidenceButton
                  key={ev.id}
                  evidence={ev}
                  onClick={() => {
                    if (onQuickPreviewEvidence && (ev.type === 'photo' || ev.type === 'pdf')) {
                      onQuickPreviewEvidence(ev);
                    } else if (ev.url) {
                      window.open(ev.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between py-1 text-[11px] text-amber-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Sin evidencias vinculadas aún</span>
              </span>
              <button
                type="button"
                onClick={() => onQuickAddEvidence(item)}
                disabled={readOnly}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                + Subir
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Detail Section (Full Official Content) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isExpanded ? 'Ocultar contenido oficial' : 'Ver checklist oficial & pautas completas'}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              #{item.rowNumber}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 text-xs animate-in fade-in duration-150">
              {/* Pregunta Oficial */}
              {item.question && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 text-[10px] uppercase tracking-wider block mb-0.5">
                    Pregunta Oficial:
                  </span>
                  <p className="text-slate-700 font-medium">
                    {item.question}
                  </p>
                </div>
              )}

              {/* Descripción del Requerimiento (Texto Oficial Completo) */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900 text-[10px] uppercase tracking-wider block mb-1 text-blue-900">
                  Descripción del Requerimiento (Oficial):
                </span>
                <p className="text-slate-800 leading-relaxed text-xs whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Cómo Auditar (Instrucciones Oficiales de Auditoría) */}
              {item.howToAudit && (
                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200/80">
                  <span className="font-bold text-blue-950 text-[10px] uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cómo Auditar (Instrucciones y Muestreo Oficiales):</span>
                  </span>
                  <p className="text-blue-950 leading-relaxed text-xs whitespace-pre-line">
                    {item.howToAudit}
                  </p>
                </div>
              )}

              {/* Ayuda Interna: Qué Mostrar */}
              {expectedDocs && (
                <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/70">
                  <span className="font-bold text-amber-950 text-[10px] uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-amber-700" />
                    <span>Orientación Interna · Documentación Sugerida:</span>
                  </span>
                  <p className="text-amber-900 leading-relaxed text-xs">
                    {expectedDocs}
                  </p>
                </div>
              )}

              {(item.whatToVerify || item.howToCheck) && (
                <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/70 space-y-2">
                  {item.whatToVerify && (
                    <div>
                      <span className="font-bold text-amber-950 text-[10px] uppercase tracking-wider block mb-0.5">Qué se verifica · orientación interna:</span>
                      <p className="text-amber-900 leading-relaxed whitespace-pre-line">{item.whatToVerify}</p>
                    </div>
                  )}
                  {item.howToCheck && (
                    <div>
                      <span className="font-bold text-amber-950 text-[10px] uppercase tracking-wider block mb-0.5">Cómo comprobarlo · orientación interna:</span>
                      <p className="text-amber-900 leading-relaxed whitespace-pre-line">{item.howToCheck}</p>
                    </div>
                  )}
                </div>
              )}

              {item.responsible && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-200">
                  <User className="w-3 h-3 text-slate-400" />
                  <span><strong>Responsable:</strong> {item.responsible}</span>
                </div>
              )}

              {item.finding && (
                <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <span className="font-bold text-rose-950 text-[10px] uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" /> Hallazgo / Observación:
                  </span>
                  <p className="text-rose-900 leading-relaxed text-xs">
                    {item.finding}
                  </p>
                </div>
              )}

              {item.internalNotes && (
                <div className="text-[11px] text-slate-500 italic px-1">
                  Nota interna: {item.internalNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
