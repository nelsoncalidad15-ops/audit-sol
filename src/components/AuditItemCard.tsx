import React, { useState } from 'react';
import { 
  AuditItem, 
  ComplianceStatus, 
  EvidenceLink 
} from '../types/audit';
import { EvidenceButton } from './EvidenceTypeBadge';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MinusCircle, 
  CircleDashed,
  FileCheck2,
  Edit
} from 'lucide-react';

interface AuditItemCardProps {
  item: AuditItem;
  onOpenEvidenceModal: (item: AuditItem) => void;
  onQuickAddEvidence: (item: AuditItem) => void;
  onUpdateStatus: (itemId: string, status: ComplianceStatus) => void;
  onQuickPreviewEvidence?: (evidence: EvidenceLink) => void;
  readOnly?: boolean;
}

export const STATUS_CONFIG: Record<
  ComplianceStatus,
  { label: string; bg: string; text: string; border: string; pillClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  cumplida: {
    label: 'Cumple',
    bg: 'bg-green-50 text-green-700',
    text: 'text-green-700',
    border: 'border-green-200',
    pillClass: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
  },
  en_progreso: {
    label: 'En Proceso',
    bg: 'bg-yellow-50 text-yellow-700',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    pillClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  no_cumplida: {
    label: 'No Cumple',
    bg: 'bg-red-50 text-red-700',
    text: 'text-red-700',
    border: 'border-red-200',
    pillClass: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
  no_aplica: {
    label: 'No Aplica',
    bg: 'bg-gray-100 text-gray-700',
    text: 'text-gray-600',
    border: 'border-gray-200',
    pillClass: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: MinusCircle,
  },
  pendiente: {
    label: 'Pendiente',
    bg: 'bg-orange-50 text-orange-700',
    text: 'text-orange-700',
    border: 'border-orange-200',
    pillClass: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: CircleDashed,
  },
};

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
  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pendiente;

  return (
    <div
      id={`audit-card-${item.id}`}
      className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md ${
        evidences.length > 0 ? 'border-slate-200/90 shadow-sm shadow-slate-200/50' : 'border-amber-200/90 bg-amber-50/10 shadow-sm shadow-amber-100/40'
      }`}
    >
      <div className="p-4.5 sm:p-5">
        {/* Top bar: Code, Section, PV/V tags, and Status dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 text-[11px] font-mono font-bold bg-slate-900 text-white rounded-lg">
              {item.code}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 truncate max-w-[180px]">
              {item.section}
            </span>
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

          {/* Compliance Status selector */}
          <div className="flex items-center gap-2">
            <select
              value={item.status}
              onChange={(e) => onUpdateStatus(item.id, e.target.value as ComplianceStatus)}
              disabled={readOnly}
              aria-label="Estado de conformidad"
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none ${statusCfg.pillClass}`}
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
              title="Gestionar evidencias y detalles"
              className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 cursor-pointer"
            >
              <Edit className="w-3 h-3" />
              <span className="sr-only">Detalles</span>
            </button>
          </div>
        </div>

        {/* Question & Requirement Title */}
        <div className="my-4">
          {item.question && item.question !== item.requirement && (
            <h4 className="text-xs font-normal text-slate-500 mb-1">
              {item.question}
            </h4>
          )}
          <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
            {item.requirement}
          </h3>
        </div>

        {/* EVIDENCES SECTION - High Density Buttons */}
        <div className="rounded-xl bg-slate-50/80 border border-slate-200/80 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">
                Evidencias · {evidences.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onQuickAddEvidence(item)}
              disabled={readOnly}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-blue-700 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Agregar</span>
            </button>
          </div>

          {evidences.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {evidences.map((ev) => (
                <div key={ev.id} className="relative group inline-flex items-center">
                  <EvidenceButton
                    evidence={ev}
                    onClick={() => {
                      if (onQuickPreviewEvidence && (ev.type === 'photo' || ev.type === 'pdf')) {
                        onQuickPreviewEvidence(ev);
                      } else if (ev.url) {
                        window.open(ev.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs">
              <span className="flex items-center gap-1.5 text-[11px] italic text-amber-800">
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Sin evidencias vinculadas aún</span>
              </span>
              <button
                type="button"
                onClick={() => onQuickAddEvidence(item)}
                disabled={readOnly}
                className="font-bold text-blue-600 hover:underline cursor-pointer text-[11px] shrink-0 ml-2"
              >
                + Subir evidencia
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Requirements and Audit Instructions */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-900 py-0.5 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1 text-[11px]">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              <span>{isExpanded ? 'Ocultar pautas de auditoría' : 'Ver pautas de inspección & muestreo'}</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              Fila #{item.rowNumber}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-gray-200 space-y-2 text-xs text-gray-700">
              {item.description && (
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <span className="font-bold text-gray-800 text-[11px] block mb-0.5 uppercase tracking-wide">
                    Descripción del Requerimiento:
                  </span>
                  <p className="text-gray-600 leading-relaxed text-xs whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              )}

              {item.howToAudit && (
                <div className="bg-blue-50/50 p-2 rounded border border-blue-200/80">
                  <span className="font-bold text-blue-900 text-[11px] block mb-0.5 uppercase tracking-wide">
                    Cómo Auditar / Muestreo:
                  </span>
                  <p className="text-blue-950 leading-relaxed text-xs whitespace-pre-line">
                    {item.howToAudit}
                  </p>
                </div>
              )}

              {item.finding && (
                <div className="bg-red-50/60 p-2 rounded border border-red-200/80">
                  <span className="font-bold text-red-900 text-[11px] block mb-0.5 uppercase tracking-wide">
                    Hallazgo Registrado:
                  </span>
                  <p className="text-red-950 leading-relaxed text-xs">
                    {item.finding}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
