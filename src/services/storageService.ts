import { AuditItem, AuditStats, EvidenceType } from '../types/audit';
import { getAuditDefinition, type AuditKey } from '../data/auditConfig';

const STORAGE_KEY_AUDIT_ITEMS = 'audit_evidence_portal_items_v1';
const STORAGE_KEY_AUDIT_RUN = 'audit_evidence_portal_run_v1';
const DEMO_EVIDENCE_IDS = new Set(['ev-1-1', 'ev-1-2', 'ev-2-1', 'ev-4-1', 'ev-8-1', 'ev-12-1']);

const withoutDemoEvidences = (items: AuditItem[]): AuditItem[] => items.map((item) => ({
  ...item,
  evidences: (item.evidences || []).filter((evidence) => !DEMO_EVIDENCE_IDS.has(evidence.id)),
}));

const getStorageKey = (auditKey: AuditKey, scope?: string) => {
  const auditScope = scope || auditKey;
  // PCGC v2 ignora la calificación histórica incluida en la matriz fuente.
  return `${STORAGE_KEY_AUDIT_ITEMS}_${auditScope}${auditKey === 'pcgc' ? '_v2' : ''}`;
};

export interface AuditRunState {
  closed: boolean;
  closedAt?: string;
}

export const getAuditRunState = (scope: string): AuditRunState => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_AUDIT_RUN}_${scope}`);
    if (stored) return { closed: Boolean(JSON.parse(stored).closed), closedAt: JSON.parse(stored).closedAt };
  } catch (err) {
    console.error('Error loading audit run state:', err);
  }
  return { closed: false };
};

export const saveAuditRunState = (scope: string, state: AuditRunState): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_AUDIT_RUN}_${scope}`, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving audit run state:', err);
  }
};

const getInitialItems = (auditKey: AuditKey): AuditItem[] => {
  const items = getAuditDefinition(auditKey).items;
  if (auditKey !== 'pcgc') return withoutDemoEvidences(items);

  return items.map((item) => ({
    ...item,
    // El cumplimiento de PCGC se decide dentro del portal, no se hereda del Sheet fuente.
    status: 'pendiente',
    finding: '',
    comment: '',
    evidences: [],
    lastUpdated: '',
  }));
};

export const getStoredAuditItems = (auditKey: AuditKey = 'iso9001', scope?: string): AuditItem[] => {
  try {
    const data = localStorage.getItem(getStorageKey(auditKey, scope));
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return withoutDemoEvidences(parsed);
      }
    }
  } catch (err) {
    console.error('Error loading audit items from localStorage:', err);
  }
  return getInitialItems(auditKey);
};

export const saveAuditItems = (items: AuditItem[], auditKey: AuditKey = 'iso9001', scope?: string): void => {
  try {
    localStorage.setItem(getStorageKey(auditKey, scope), JSON.stringify(items));
  } catch (err) {
    console.error('Error saving audit items to localStorage:', err);
  }
};

export const calculateStats = (items: AuditItem[]): AuditStats => {
  const stats: AuditStats = {
    totalItems: items.length,
    compliantCount: 0,
    inProgressCount: 0,
    nonCompliantCount: 0,
    pendingCount: 0,
    notApplicableCount: 0,
    withEvidenceCount: 0,
    totalEvidencesCount: 0,
    evidenceTypeCounts: {
      photo: 0,
      pdf: 0,
      sheet: 0,
      web: 0,
      sop: 0,
      drive: 0,
      other: 0,
    },
    pvCount: 0,
    vCount: 0,
    completionRate: 0,
    evidenceCoverageRate: 0,
  };

  items.forEach((item) => {
    if (item.status === 'cumplida') stats.compliantCount++;
    else if (item.status === 'en_progreso') stats.inProgressCount++;
    else if (item.status === 'no_cumplida') stats.nonCompliantCount++;
    else if (item.status === 'no_aplica') stats.notApplicableCount++;
    else stats.pendingCount++;

    if (item.pv) stats.pvCount++;
    if (item.v) stats.vCount++;

    const evidences = item.evidences || [];
    if (evidences.length > 0) {
      stats.withEvidenceCount++;
      stats.totalEvidencesCount += evidences.length;
      evidences.forEach((ev) => {
        const type: EvidenceType = ev.type || 'other';
        stats.evidenceTypeCounts[type] = (stats.evidenceTypeCounts[type] || 0) + 1;
      });
    }
  });

  const evaluableCount = stats.totalItems - stats.notApplicableCount;
  stats.completionRate = evaluableCount > 0 ? Math.round((stats.compliantCount / evaluableCount) * 100) : 0;
  stats.evidenceCoverageRate = stats.totalItems > 0 ? Math.round((stats.withEvidenceCount / stats.totalItems) * 100) : 0;

  return stats;
};

export const exportAuditDataToJSON = (items: AuditItem[]): void => {
  const exportPayload = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    totalItems: items.length,
    items,
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `auditoria_evidencias_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportAuditDataToCSV = (items: AuditItem[]): void => {
  const headers = [
    'Código',
    'Capítulo',
    'Sección',
    'Pregunta',
    'Requerimiento',
    'Descripción',
    'Cómo Auditar',
    'PV',
    'V',
    'Estado',
    'Cantidad Evidencias',
    'Enlaces de Evidencia',
    'Hallazgo',
    'Comentario',
    'Responsable',
  ];

  const escapeCSV = (str: string | undefined) => {
    if (!str) return '""';
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = items.map((item) => {
    const evidenceLinksStr = (item.evidences || [])
      .map((e) => `[${e.type.toUpperCase()}] ${e.title}: ${e.url}`)
      .join(' | ');

    return [
      escapeCSV(item.code),
      escapeCSV(item.chapter),
      escapeCSV(item.section),
      escapeCSV(item.question),
      escapeCSV(item.requirement),
      escapeCSV(item.description),
      escapeCSV(item.howToAudit),
      item.pv ? 'X' : '',
      item.v ? 'X' : '',
      escapeCSV(item.status),
      (item.evidences || []).length.toString(),
      escapeCSV(evidenceLinksStr),
      escapeCSV(item.finding),
      escapeCSV(item.comment),
      escapeCSV(item.responsible),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `matriz_auditoria_evidencias_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
