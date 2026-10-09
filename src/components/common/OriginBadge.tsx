import React from 'react';
import type { OriginType } from '../../types/audit';
import { ORIGIN_TYPES_CONFIG } from '../../data/isoNormativeMapping';
import { ShieldCheck, Award, Building2, HelpCircle } from 'lucide-react';

interface OriginBadgeProps {
  originType?: OriginType;
  size?: 'sm' | 'md';
  fullLabel?: boolean;
}

export const OriginBadge: React.FC<OriginBadgeProps> = ({
  originType = 'pending',
  size = 'md',
  fullLabel = false,
}) => {
  const cfg = ORIGIN_TYPES_CONFIG[originType] || ORIGIN_TYPES_CONFIG.pending;

  const Icon = originType === 'iso9001' ? ShieldCheck : originType === 'brand' ? Award : originType === 'internal' ? Building2 : HelpCircle;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      title={cfg.description}
      className={`inline-flex items-center gap-1 font-semibold rounded-md border ${cfg.bg} ${cfg.border} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{fullLabel ? cfg.label : cfg.shortLabel}</span>
    </span>
  );
};
