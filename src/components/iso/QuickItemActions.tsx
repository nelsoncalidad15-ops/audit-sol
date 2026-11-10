import React from 'react';
import { Plus } from 'lucide-react';
import { AuditItem, EvidenceLink } from '../../types/audit';
import { DocumentList } from '../DocumentList';
export interface QuickItemActionsProps {
  item: AuditItem;
  readOnly?: boolean;
  onUpload: (item: AuditItem, file: File) => Promise<void>;
  onSaveComment: (id: string, comment: string) => void;
  onRemoveEvidence: (id: string, evidenceId: string) => void;
  onPreviewEvidence: (evidence: EvidenceLink) => void;
  onManage: (item: AuditItem) => void;
}

export function QuickItemActions({ item, readOnly, onManage }: QuickItemActionsProps) {
  return <div>
    <DocumentList evidences={item.evidences || []} />
    {!readOnly && <button type="button" onClick={() => onManage(item)} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 py-2 hover:underline"><Plus size={14} /> {item.evidences.some(e => e.url) ? 'Agregar o gestionar evidencia' : 'Agregar evidencia'}</button>}
    {item.comment && <details className="text-xs text-slate-500 mt-1"><summary className="cursor-pointer py-1">Comentario</summary><p className="whitespace-pre-wrap py-2">{item.comment}</p></details>}
  </div>;
}
