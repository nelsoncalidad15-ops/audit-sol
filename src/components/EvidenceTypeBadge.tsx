import React from 'react';
import { 
  Camera, 
  FileText, 
  FileSpreadsheet, 
  Globe, 
  Workflow, 
  HardDrive, 
  Link as LinkIcon,
  ExternalLink 
} from 'lucide-react';
import { EvidenceType, EvidenceLink } from '../types/audit';

export interface EvidenceTypeConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hoverClass: string;
  iconColor: string;
  badgeBg: string;
}

export const EVIDENCE_CONFIG: Record<EvidenceType, EvidenceTypeConfig> = {
  photo: {
    label: 'Foto / Imagen',
    icon: Camera,
    bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    hoverClass: 'hover:border-emerald-500 hover:bg-emerald-50/70',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-emerald-600',
  },
  pdf: {
    label: 'PDF / Documento',
    icon: FileText,
    bgClass: 'bg-rose-50 text-rose-800 border-rose-200',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-300',
    hoverClass: 'hover:border-rose-500 hover:bg-rose-50/70',
    iconColor: 'text-red-600',
    badgeBg: 'bg-rose-600',
  },
  sheet: {
    label: 'Google Sheet / Matriz',
    icon: FileSpreadsheet,
    bgClass: 'bg-teal-50 text-teal-800 border-teal-200',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-300',
    hoverClass: 'hover:border-green-500 hover:bg-green-50/70',
    iconColor: 'text-green-600',
    badgeBg: 'bg-teal-600',
  },
  web: {
    label: 'Web / Portal',
    icon: Globe,
    bgClass: 'bg-blue-50 text-blue-800 border-blue-200',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
    hoverClass: 'hover:border-blue-500 hover:bg-blue-50/70',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-600',
  },
  sop: {
    label: 'Proceso / Diagrama',
    icon: Workflow,
    bgClass: 'bg-amber-50 text-amber-900 border-amber-200',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300',
    hoverClass: 'hover:border-amber-500 hover:bg-amber-50/70',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-600',
  },
  drive: {
    label: 'Google Drive / Carpeta',
    icon: HardDrive,
    bgClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-300',
    hoverClass: 'hover:border-indigo-500 hover:bg-indigo-50/70',
    iconColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-600',
  },
  other: {
    label: 'Enlace / Otro',
    icon: LinkIcon,
    bgClass: 'bg-slate-50 text-slate-800 border-slate-200',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-300',
    hoverClass: 'hover:border-emerald-500 hover:bg-emerald-50/70',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-slate-600',
  },
};

interface EvidenceButtonProps {
  evidence: EvidenceLink;
  onClick?: (e: React.MouseEvent) => void;
  compact?: boolean;
  denseSquare?: boolean;
}

export const EvidenceButton: React.FC<EvidenceButtonProps> = ({ 
  evidence, 
  onClick, 
  compact = false,
  denseSquare = false 
}) => {
  const type = evidence.type || 'other';
  const config = EVIDENCE_CONFIG[type] || EVIDENCE_CONFIG.other;
  const Icon = config.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    } else if (evidence.url) {
      window.open(evidence.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (denseSquare) {
    return (
      <button
        type="button"
        id={`evidence-btn-${evidence.id}`}
        onClick={handleClick}
        title={`${config.label}: ${evidence.title} ${evidence.description ? `(${evidence.description})` : ''} - Clic para abrir`}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded border border-gray-200 flex items-center justify-center bg-white ${config.iconColor} hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer relative group`}
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      id={`evidence-btn-${evidence.id}`}
      onClick={handleClick}
      title={`${config.label}: ${evidence.title} - ${evidence.description || 'Clic para abrir evidencia'}`}
      className={`group inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-gray-800 transition-all duration-150 shadow-2xs cursor-pointer`}
    >
      <span className={config.iconColor}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
      </span>
      <span className={`truncate text-gray-700 font-medium ${compact ? 'max-w-[120px]' : 'max-w-[180px]'}`}>
        {evidence.title || config.label}
      </span>
      <ExternalLink className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 group-hover:text-blue-600 transition-colors shrink-0" />
    </button>
  );
};

