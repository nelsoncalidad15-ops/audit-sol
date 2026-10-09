import React from 'react';
import { CheckCircle2, Clock, XCircle, MinusCircle, CircleDashed } from 'lucide-react';
import type { ComplianceStatus } from '../../types/audit';

export const STATUS_CONFIG: Record<
  ComplianceStatus,
  { label: string; bg: string; text: string; border: string; pillClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  cumplida: {
    label: 'Cumple',
    bg: 'bg-emerald-50 text-emerald-800',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70',
    icon: CheckCircle2,
  },
  en_progreso: {
    label: 'En Proceso',
    bg: 'bg-amber-50 text-amber-800',
    text: 'text-amber-700',
    border: 'border-amber-200',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70',
    icon: Clock,
  },
  no_cumplida: {
    label: 'No Cumple',
    bg: 'bg-rose-50 text-rose-800',
    text: 'text-rose-700',
    border: 'border-rose-200',
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70',
    icon: XCircle,
  },
  no_aplica: {
    label: 'No Aplica',
    bg: 'bg-slate-100 text-slate-700',
    text: 'text-slate-600',
    border: 'border-slate-200',
    pillClass: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70',
    icon: MinusCircle,
  },
  pendiente: {
    label: 'Pendiente',
    bg: 'bg-orange-50 text-orange-800',
    text: 'text-orange-700',
    border: 'border-orange-200',
    pillClass: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100/70',
    icon: CircleDashed,
  },
};

interface StatusBadgeProps {
  status: ComplianceStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onClick?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  interactive = false,
  onClick,
}) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
  const Icon = cfg.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border transition-all ${cfg.pillClass} ${sizeClasses} ${
        interactive ? 'cursor-pointer select-none hover:shadow-xs' : ''
      }`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{cfg.label}</span>
    </span>
  );
};
