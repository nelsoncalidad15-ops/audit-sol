import { AuditItem, AuditStats, EvidenceType, AuditActionItem } from '../types/audit';
import { getAuditDefinition, type AuditKey } from '../data/auditConfig';
import { enrichAuditItem } from '../data/isoNormativeMapping';

const STORAGE_KEY_AUDIT_ITEMS = 'audit_evidence_portal_items_v1';
const STORAGE_KEY_AUDIT_RUN = 'audit_evidence_portal_run_v1';
const STORAGE_KEY_ACTION_ITEMS = 'audit_evidence_portal_actions_v1';
const DEMO_EVIDENCE_IDS = new Set(['ev-1-1', 'ev-1-2', 'ev-2-1', 'ev-4-1', 'ev-8-1', 'ev-12-1']);

const sanitizeEvidences = (items: AuditItem[]): AuditItem[] => items.map((item) => ({
  ...item,
  evidences: (item.evidences || [])
    .filter((evidence) => !DEMO_EVIDENCE_IDS.has(evidence.id))
    .map((evidence) => {
      // Si no tiene URL utilizable, no debe figurar como verificada falsamente
      const hasUrl = Boolean(evidence.url && evidence.url.trim().length > 0);
      return {
        ...evidence,
        verified: hasUrl ? (evidence.verified ?? false) : false,
        status: evidence.status || (hasUrl ? (evidence.verified ? 'verified' : 'linked') : 'suggested'),
      };
    }),
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
  if (auditKey !== 'pcgc') {
    return sanitizeEvidences(items).map(enrichAuditItem);
  }

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
        const sanitized = sanitizeEvidences(parsed);
        return auditKey === 'iso9001' ? sanitized.map(enrichAuditItem) : sanitized;
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
    totalEvaluable: 0,
    withEvidenceCount: 0,
    verifiedEvidencesCount: 0,
    pendingValidationEvidencesCount: 0,
    missingEvidenceCount: 0,
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
    declarativeComplianceRate: 0,
    documentaryPreparationRate: 0,
    evidenceCoverageRate: 0,
    prioritiesCount: 0,
  };

  let itemsWithVerifiedEvidence = 0;

  items.forEach((item) => {
    if (item.status === 'cumplida') stats.compliantCount++;
    else if (item.status === 'en_progreso') stats.inProgressCount++;
    else if (item.status === 'no_cumplida') stats.nonCompliantCount++;
    else if (item.status === 'no_aplica') stats.notApplicableCount++;
    else stats.pendingCount++;

    if (item.pv) stats.pvCount++;
    if (item.v) stats.vCount++;

    const evidences = item.evidences || [];
    const validEvidences = evidences.filter((ev) => Boolean(ev.url && ev.url.trim().length > 0));

    if (validEvidences.length > 0) {
      stats.withEvidenceCount++;
      stats.totalEvidencesCount += validEvidences.length;

      let hasVerified = false;
      validEvidences.forEach((ev) => {
        const type: EvidenceType = ev.type || 'other';
        stats.evidenceTypeCounts[type] = (stats.evidenceTypeCounts[type] || 0) + 1;
        if (ev.verified) {
          stats.verifiedEvidencesCount++;
          hasVerified = true;
        } else {
          stats.pendingValidationEvidencesCount++;
        }
      });

      if (hasVerified) {
        itemsWithVerifiedEvidence++;
      }
    }

    // Identificar prioridades de revisión: No cumplidas, pendientes sin evidencia o con hallazgo registrado
    const isPriority = 
      item.status === 'no_cumplida' ||
      (item.status === 'en_progreso') ||
      (item.status === 'pendiente' && validEvidences.length === 0) ||
      Boolean(item.finding && item.finding.trim().length > 0);

    if (isPriority && item.status !== 'no_aplica') {
      stats.prioritiesCount++;
    }
  });

  const evaluableCount = stats.totalItems - stats.notApplicableCount;
  stats.totalEvaluable = Math.max(0, evaluableCount);
  stats.missingEvidenceCount = Math.max(0, stats.totalEvaluable - stats.withEvidenceCount);

  stats.declarativeComplianceRate = evaluableCount > 0 ? Math.round((stats.compliantCount / evaluableCount) * 100) : 0;
  stats.completionRate = stats.declarativeComplianceRate;
  stats.documentaryPreparationRate = evaluableCount > 0 ? Math.round((itemsWithVerifiedEvidence / evaluableCount) * 100) : 0;
  stats.evidenceCoverageRate = evaluableCount > 0 ? Math.round((stats.withEvidenceCount / evaluableCount) * 100) : 0;

  return stats;
};

// ==========================================
// Gestor de Tareas Pendientes y Seguimiento
// ==========================================

export const getStoredActionItems = (scope: string): AuditActionItem[] => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_ACTION_ITEMS}_${scope}`);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading action items from localStorage:', err);
  }
  return [];
};

export const saveStoredActionItems = (scope: string, items: AuditActionItem[]): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_ACTION_ITEMS}_${scope}`, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving action items to localStorage:', err);
  }
};

export const exportAuditDataToJSON = (items: AuditItem[], actionItems: AuditActionItem[] = []): void => {
  const exportPayload = {
    exportDate: new Date().toISOString(),
    version: '2.0-iso-redesign',
    totalItems: items.length,
    items,
    actionItems,
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
    'Cláusula ISO',
    'Origen',
    'Capítulo',
    'Sección',
    'Requerimiento',
    'Qué se verifica',
    'Qué mostrar',
    'Cómo comprobarlo',
    'PV',
    'V',
    'Estado',
    'Total Evidencias',
    'Evidencias Verificadas',
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
      .map((e) => `[${e.type.toUpperCase()}${e.verified ? ' (VERIFICADA)' : ''}] ${e.title}: ${e.url}`)
      .join(' | ');

    const verifiedCount = (item.evidences || []).filter((e) => e.verified).length;

    return [
      escapeCSV(item.code),
      escapeCSV(item.isoClause || ''),
      escapeCSV(item.originType || ''),
      escapeCSV(item.chapter),
      escapeCSV(item.section),
      escapeCSV(item.requirement),
      escapeCSV(item.whatToVerify || item.description),
      escapeCSV(item.whatToShow || ''),
      escapeCSV(item.howToCheck || item.howToAudit),
      item.pv ? 'X' : '',
      item.v ? 'X' : '',
      escapeCSV(item.status),
      (item.evidences || []).length.toString(),
      verifiedCount.toString(),
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
  link.download = `matriz_auditoria_iso_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
