import React from 'react';
import { AuditItem } from '../../types/audit';

export function RequirementDetails({ item }: { item: AuditItem }) {
  const sections = [
    ['Tema', item.question],
    ['Descripción del requisito', item.description],
    ['Qué verificar', item.whatToVerify],
    ['Qué mostrar', item.whatToShow],
    ['Cómo auditar', item.howToAudit],
    ['Cómo comprobarlo', item.howToCheck],
    ['Notas internas', item.internalNotes],
  ];
  return <details className="mt-2 text-xs">
    <summary className="cursor-pointer py-2 font-semibold text-blue-700 rounded focus-visible:outline-blue-500">Qué pide este punto</summary>
    <div className="mt-1 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
      <p className="text-slate-500">{item.chapter} · {item.section}{item.isoClause ? ` · ${item.isoClause}` : ''}</p>
      {sections.filter(([, text]) => Boolean(text)).map(([label, text]) => <section key={label}>
        <h4 className="font-semibold text-slate-900 mb-1">{label}</h4>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{text}</p>
      </section>)}
    </div>
  </details>;
}
