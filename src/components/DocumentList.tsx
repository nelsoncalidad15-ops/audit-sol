import React from 'react';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { EvidenceLink } from '../types/audit';
export const documentKinds = { procedure: 'Procedimiento', record: 'Registro', other: 'Otra evidencia' };
export function safeDocumentUrl(value: string) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function downloadUrl(evidence: EvidenceLink) {
  const url = safeDocumentUrl(evidence.url);
  if (!url) return '';
  const parsed = new URL(url);
  if (parsed.hostname === 'drive.google.com') {
    const id = parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || parsed.searchParams.get('id');
    if (id) return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  }
  return '';
}
export function DocumentList({ evidences }: { evidences: EvidenceLink[] }) {
  const docs = evidences.filter(ev => safeDocumentUrl(ev.url));
  if (!docs.length) return <p className="text-xs text-slate-400 py-2">Sin documentos vinculados</p>;
  return <ul className="divide-y divide-slate-100">{docs.map(ev => <li key={ev.id} className="flex flex-wrap items-center gap-2 py-3">
    <FileText size={17} className="text-slate-400 shrink-0" />
    <div className="flex-1 min-w-0 basis-40">
      <a href={safeDocumentUrl(ev.url)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 hover:text-blue-700 break-words">{ev.title}</a>
      <p className="text-[11px] text-slate-500 mt-0.5">{documentKinds[ev.documentKind || (ev.type === 'sop' ? 'procedure' : 'other')]}{ev.revision ? ` · Rev. ${ev.revision}` : ''}</p>
    </div>
    <a href={safeDocumentUrl(ev.url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-700 p-1.5" aria-label={`Abrir ${ev.title}`}><ExternalLink size={13} /> Abrir</a>
    {downloadUrl(ev) && <a href={downloadUrl(ev)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-500 p-1.5" aria-label={`Descargar ${ev.title}`}><Download size={13} /> Descargar</a>}
  </li>)}</ul>;
}
