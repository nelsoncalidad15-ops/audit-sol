export type EvidenceType = 'photo' | 'pdf' | 'sheet' | 'web' | 'sop' | 'drive' | 'other';

export type ComplianceStatus = 'cumplida' | 'en_progreso' | 'no_cumplida' | 'no_aplica' | 'pendiente';

export interface EvidenceLink {
  id: string;
  type: EvidenceType;
  title: string;
  url: string;
  description?: string;
  addedAt?: string;
  addedBy?: string;
  verified?: boolean;
  fileSize?: string;
  thumbnailUrl?: string;
}

export interface AuditItem {
  id: string;
  rowNumber: number;
  chapter: string;
  section: string;
  code: string;
  question: string;
  requirement: string;
  description: string;
  howToAudit: string;
  pv: boolean;
  v: boolean;
  status: ComplianceStatus;
  finding?: string;
  comment?: string;
  responsible?: string;
  targetDate?: string;
  lastUpdated?: string;
  evidences: EvidenceLink[];
}

export interface AppsScriptConfig {
  scriptUrl: string;
  sheetId: string;
  gid: string;
  driveFolderId?: string;
  syncMode: 'direct' | 'appscript' | 'csv';
  autoSync: boolean;
  lastSyncTime?: string;
  lastSyncStatus?: 'idle' | 'success' | 'error' | 'syncing';
  lastError?: string;
}

export interface AuditStats {
  totalItems: number;
  compliantCount: number;
  inProgressCount: number;
  nonCompliantCount: number;
  pendingCount: number;
  notApplicableCount: number;
  withEvidenceCount: number;
  totalEvidencesCount: number;
  evidenceTypeCounts: Record<EvidenceType, number>;
  pvCount: number;
  vCount: number;
  completionRate: number;
  evidenceCoverageRate: number;
}
