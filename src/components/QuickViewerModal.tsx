import React from 'react';
import { EvidenceLink } from '../types/audit';
import { EVIDENCE_CONFIG } from './EvidenceTypeBadge';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface QuickViewerModalProps {
  evidence: EvidenceLink | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewerModal: React.FC<QuickViewerModalProps> = ({
  evidence,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !evidence) return null;

  const typeCfg = EVIDENCE_CONFIG[evidence.type] || EVIDENCE_CONFIG.other;
  const isImage = evidence.type === 'photo' || evidence.url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${typeCfg.bgClass}`}>
              {typeCfg.label}
            </span>
            <h3 className="text-sm font-bold text-white truncate max-w-md">
              {evidence.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              <span>Abrir en nueva pestaña</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 flex items-center justify-center min-h-[360px]">
          {isImage ? (
            <div className="max-h-[70vh] flex flex-col items-center justify-center">
              <img
                src={evidence.url}
                alt={evidence.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
              <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">{evidence.title}</h4>
              <p className="text-xs text-slate-500 mb-4">{evidence.description || 'Haz clic para ver el documento completo'}</p>
              <a
                href={evidence.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                <span>Acceder a la Evidencia</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-lg font-mono text-[11px]">{evidence.url}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
