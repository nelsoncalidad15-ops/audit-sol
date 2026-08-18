import { DEFAULT_AUDIT_ITEMS } from './defaultAuditData';
import { PCGC_AUDIT_ITEMS } from './pcgcAuditData';
import type { AuditItem } from '../types/audit';

export type AuditKey = 'iso9001' | 'pcgc';
export type BranchKey = 'salta' | 'jujuy';
export type PcgcCycle = 'pcgc-1' | 'pcgc-2' | 'pcgc-3' | 'pcgc-4';

export interface AuditRunContext {
  auditKey: AuditKey;
  branch: BranchKey;
  year: number;
  cycle?: PcgcCycle;
}

export const BRANCH_LABELS: Record<BranchKey, string> = { salta: 'Salta', jujuy: 'Jujuy' };
export const PCGC_CYCLE_LABELS: Record<PcgcCycle, string> = {
  'pcgc-1': 'PCGC 1',
  'pcgc-2': 'PCGC 2',
  'pcgc-3': 'PCGC 3',
  'pcgc-4': 'PCGC 4',
};

export const getAuditRunLabel = (run: AuditRunContext) => {
  const cycle = run.cycle ? ` · ${PCGC_CYCLE_LABELS[run.cycle]}` : '';
  return `${BRANCH_LABELS[run.branch]} · ${run.year}${cycle}`;
};

export const getAuditRunStorageKey = (run: AuditRunContext) =>
  [run.auditKey, run.year, run.branch, run.cycle || 'anual'].join('_');

export interface AuditDefinition {
  key: AuditKey;
  shortName: string;
  title: string;
  driveFolder: string;
  items: AuditItem[];
}

export const AUDITS: Record<AuditKey, AuditDefinition> = {
  iso9001: {
    key: 'iso9001',
    shortName: 'ISO 9001',
    title: 'Auditoría ISO 9001',
    driveFolder: 'ISO 9001 Evidencias',
    items: DEFAULT_AUDIT_ITEMS,
  },
  pcgc: {
    key: 'pcgc',
    shortName: 'F21 · PCGC',
    title: 'Auditoría F21 · PCGC',
    driveFolder: 'F21 PCGC Evidencias',
    items: PCGC_AUDIT_ITEMS,
  },
};

export const getAuditDefinition = (key: AuditKey) => AUDITS[key];
