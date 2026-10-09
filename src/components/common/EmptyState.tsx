import React from 'react';
import { LucideIcon, Filter } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Filter,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-12 px-6 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 grid place-items-center mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
