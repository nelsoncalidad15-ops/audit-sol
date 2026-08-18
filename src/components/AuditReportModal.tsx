import React, { useState } from 'react';
import { AuditItem, AuditStats } from '../types/audit';
import { EVIDENCE_CONFIG } from './EvidenceTypeBadge';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  FileCheck2, 
  ShieldCheck, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: AuditItem[];
  stats: AuditStats;
  auditName: string;
  auditClosed: boolean;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  items,
  stats,
  auditName,
  auditClosed,
}) => {
  if (!isOpen) return null;

  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [filterWithEvidenceOnly, setFilterWithEvidenceOnly] = useState(false);

  const chapters: string[] = Array.from(new Set(items.map((i) => i.chapter))).filter(
    (ch): ch is string => Boolean(ch)
  );

  const filteredItems = items.filter((item) => {
    if (selectedChapter !== 'all' && item.chapter !== selectedChapter) return false;
    if (filterWithEvidenceOnly && (!item.evidences || item.evidences.length === 0)) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Header - Hidden on Print */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Dossier Ejecutivo de Evidencias y Auditoría
              </h2>
              <p className="text-xs text-slate-300">{auditName} · {auditClosed ? 'Auditoría cerrada' : 'Auditoría en curso'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter controls - Hidden on Print */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 border-b border-slate-200 gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Capítulo:</span>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium cursor-pointer"
            >
              <option value="all">Todos los capítulos ({items.length})</option>
              {chapters.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterWithEvidenceOnly}
              onChange={(e) => setFilterWithEvidenceOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Mostrar sólo criterios con evidencias ({stats.withEvidenceCount})</span>
          </label>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 print:p-0 print:space-y-4 text-slate-800">
          {/* Report Cover / Header block */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                  Informe de Conformidad y Dossier de Evidencias
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  {auditName} · {auditClosed ? 'Auditoría cerrada' : 'Auditoría en curso'}
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-slate-900">Fecha de Generación:</span>{' '}
                {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Executive KPIs */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-center">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Criterios</span>
                <span className="text-lg font-bold text-slate-900">{stats.totalItems}</span>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Con Evidencias</span>
                <span className="text-lg font-bold text-emerald-900">{stats.withEvidenceCount} ({stats.evidenceCoverageRate}%)</span>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Cumplidas</span>
                <span className="text-lg font-bold text-blue-900">{stats.compliantCount} ({stats.completionRate}%)</span>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-indigo-800 block">Total Enlaces</span>
                <span className="text-lg font-bold text-indigo-900">{stats.totalEvidencesCount}</span>
              </div>
            </div>
          </div>

          {/* List of Requirements & Evidences */}
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const evidences = item.evidences || [];

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 page-break-inside-avoid"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-900 text-white rounded">
                        {item.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.requirement}
                      </span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                      item.status === 'cumplida'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'en_progreso'
                        ? 'bg-blue-100 text-blue-800'
                        : item.status === 'no_cumplida'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.description || item.question}
                  </p>

                  {/* Evidence list with hyperlinks */}
                  {evidences.length > 0 ? (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Evidencias Verificables ({evidences.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {evidences.map((ev) => {
                          const typeCfg = EVIDENCE_CONFIG[ev.type] || EVIDENCE_CONFIG.other;
                          return (
                            <a
                              key={ev.id}
                              href={ev.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-[10px] font-bold px-1 rounded ${typeCfg.bgClass}`}>
                                  {ev.type.toUpperCase()}
                                </span>
                                <span className="font-medium text-slate-800 truncate">
                                  {ev.title}
                                </span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-indigo-600 shrink-0 ml-1" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-700 italic">
                      Sin evidencias adjuntas registradas.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Signatures block for audit */}
          <div className="pt-8 mt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 page-break-inside-avoid">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <p className="font-bold text-slate-800">Firma del Auditor / Verificador</p>
              <p className="text-[11px] text-slate-500">Responsable de Calidad y Procesos</p>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <p className="font-bold text-slate-800">Firma de Gerencia / Responsable</p>
              <p className="text-[11px] text-slate-500">Concesionario / Instalaciones</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            Mostrando {filteredItems.length} criterios
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
