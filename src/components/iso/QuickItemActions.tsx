import React, { useRef, useState } from 'react';
import { Camera, Paperclip, MessageSquare, X } from 'lucide-react';
import { AuditItem, EvidenceLink } from '../../types/audit';

export interface QuickItemActionsProps {
  item: AuditItem;
  readOnly?: boolean;
  onUpload: (item: AuditItem, file: File) => Promise<void>;
  onSaveComment: (id: string, comment: string) => void;
  onRemoveEvidence: (id: string, evidenceId: string) => void;
  onPreviewEvidence: (evidence: EvidenceLink) => void;
  onManage: (item: AuditItem) => void;
}

export function QuickItemActions({ item, readOnly, onUpload, onSaveComment, onRemoveEvidence, onPreviewEvidence, onManage }: QuickItemActionsProps) {
  const photoInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const busy = useRef(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const buttonClass = 'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed';

  async function upload(files: File[]) {
    if (readOnly || busy.current || !files.length) return;
    busy.current = true;
    setError('');
    const failures: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Subiendo ${i + 1} de ${files.length}…`);
        try { await onUpload(item, files[i]); }
        catch (err) { failures.push(`${files[i].name}: ${err instanceof Error ? err.message : 'No se pudo subir'}`); }
      }
      setError(failures.join('\n'));
    } finally { busy.current = false; setProgress(''); }
  }

  return <div className="space-y-2">
    <div className="flex flex-wrap gap-1.5">
      <button type="button" className={buttonClass} disabled={readOnly || !!progress} onClick={() => photoInput.current?.click()}><Camera size={14} /> Foto</button>
      <button type="button" className={buttonClass} disabled={readOnly || !!progress} onClick={() => fileInput.current?.click()}><Paperclip size={14} /> Archivos</button>
      <button type="button" className={buttonClass} disabled={readOnly} onClick={() => { setComment(item.comment || ''); setEditing(true); }}><MessageSquare size={14} /> Comentario</button>
      <input ref={photoInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { void upload(Array.from(e.target.files || [])); e.target.value = ''; }} />
      <input ref={fileInput} type="file" multiple className="hidden" onChange={e => { void upload(Array.from(e.target.files || [])); e.target.value = ''; }} />
    </div>
    {progress && <p role="status" className="text-xs text-blue-700">{progress}</p>}
    {error && <p role="alert" className="text-xs text-rose-700 whitespace-pre-wrap">{error}</p>}
    {editing ? <form className="space-y-2" onSubmit={e => { e.preventDefault(); onSaveComment(item.id, comment); setEditing(false); }}>
      <textarea aria-label={`Comentario de ${item.code}`} autoFocus rows={3} value={comment} onChange={e => setComment(e.target.value)} disabled={readOnly} className="w-full rounded-lg border border-slate-300 p-2 text-xs" placeholder="Escribí tu observación…" />
      <div className="flex gap-2"><button type="submit" disabled={readOnly} className={buttonClass}>Guardar comentario</button><button type="button" className={buttonClass} onClick={() => setEditing(false)}>Cancelar</button></div>
    </form> : item.comment && <details className="text-xs text-slate-600"><summary className="cursor-pointer py-1">Ver comentario</summary><p className="whitespace-pre-wrap break-words py-2">{item.comment}</p></details>}
    {!!item.evidences?.length && <details className="text-xs text-slate-600">
      <summary className="cursor-pointer py-1">Evidencias ({item.evidences.length})</summary>
      <ul className="space-y-2 mt-2">{item.evidences.map(ev => <li key={ev.id} className="rounded-lg border border-slate-200 p-2">
        <div className="flex items-start gap-2">
          <button type="button" disabled={!ev.url} onClick={() => onPreviewEvidence(ev)} className="text-left text-blue-700 break-all flex-1 hover:underline disabled:text-slate-500">{ev.title}{!ev.url && ' · Sin archivo'}</button>
          <button type="button" disabled={readOnly} aria-label={`Quitar ${ev.title}`} onClick={() => setRemoving(ev.id)} className="p-1 text-slate-500 hover:text-rose-700 disabled:opacity-50"><X size={14} /></button>
        </div>
        {ev.description && <p className="whitespace-pre-wrap break-words mt-1">{ev.description}</p>}
        {removing === ev.id && <div className="mt-2 space-y-2"><p>¿Quitar del punto? El archivo se conserva en Drive.</p><button type="button" className={buttonClass} disabled={readOnly} onClick={() => { onRemoveEvidence(item.id, ev.id); setRemoving(null); }}>Quitar</button> <button type="button" className={buttonClass} onClick={() => setRemoving(null)}>Cancelar</button></div>}
      </li>)}</ul>
    </details>}
    <button type="button" disabled={readOnly || !!progress} onClick={() => onManage(item)} className="text-xs text-blue-700 hover:underline disabled:opacity-50">Enlaces y más opciones</button>
  </div>;
}
