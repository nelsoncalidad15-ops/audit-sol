export type EvidenceType = 'photo' | 'pdf' | 'sheet' | 'web' | 'sop' | 'drive' | 'other';

export type ComplianceStatus = 'cumplida' | 'en_progreso' | 'no_cumplida' | 'no_aplica' | 'pendiente';

export type OriginType = 'iso9001' | 'brand' | 'internal' | 'pending';

export type EvidenceStatus = 'suggested' | 'linked' | 'pending_review' | 'verified' | 'needs_update';

export interface EvidenceLink {
  id: string;
  type: EvidenceType;
  title: string;
  url: string;
  description?: string;
  addedAt?: string;
  addedBy?: string;
  verified?: boolean;
  status?: EvidenceStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  validUntil?: string; // Fecha de vigencia o próxima revisión
  notes?: string;
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

  // Campos complementarios para organización normativa ISO 9001 (compatibles y opcionales)
  originType?: OriginType;
  isoClause?: string; // Ej: "4. Contexto de la organización", "5. Liderazgo", etc.
  whatToVerify?: string; // Explicación breve de lo que se verifica
  whatToShow?: string; // Documentación esperada a presentar
  howToCheck?: string; // Orientación práctica de auditoría
  internalNotes?: string; // Información y notas internas del concesionario
}

export interface AuditActionItem {
  id: string;
  title: string;
  requirementId: string;
  requirementCode: string;
  requirementTitle: string;
  responsible: string;
  dueDate?: string;
  status: 'pendiente' | 'en_progreso' | 'completada';
  comments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditStats {
  totalItems: number;
  compliantCount: number;
  inProgressCount: number;
  nonCompliantCount: number;
  pendingCount: number;
  notApplicableCount: number;
  totalEvaluable: number;
  withEvidenceCount: number;
  verifiedEvidencesCount: number;
  pendingValidationEvidencesCount: number;
  missingEvidenceCount: number;
  totalEvidencesCount: number;
  evidenceTypeCounts: Record<EvidenceType, number>;
  pvCount: number;
  vCount: number;
  // Indicadores transparentes y confiables
  completionRate: number; // Cumplimiento declarado (%)
  declarativeComplianceRate: number; // % cumplidas sobre aplicables
  documentaryPreparationRate: number; // % aplicables con evidencia verificada
  evidenceCoverageRate: number; // % aplicables con evidencia vinculada
  prioritiesCount: number; // Requisitos que requieren atención
}
