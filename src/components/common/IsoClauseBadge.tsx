import React from 'react';
import { BookOpen } from 'lucide-react';

interface IsoClauseBadgeProps {
  clause?: string;
  size?: 'sm' | 'md';
}

export const IsoClauseBadge: React.FC<IsoClauseBadgeProps> = ({
  clause,
  size = 'md',
}) => {
  if (!clause) return null;

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 border border-slate-200/80 rounded-md ${sizeClasses}`}
    >
      <BookOpen className={size === 'sm' ? 'w-3 h-3 text-slate-500' : 'w-3.5 h-3.5 text-slate-500'} />
      <span className="truncate max-w-[220px]">{clause}</span>
    </span>
  );
};
