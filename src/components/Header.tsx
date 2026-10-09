import React from 'react';
import { 
  ShieldCheck, 
  ArrowLeftRight, 
  LockKeyhole, 
  LockKeyholeOpen, 
  Cloud, 
  CheckCircle2, 
  FileText, 
  Download, 
  LayoutDashboard, 
  CheckSquare, 
  ClipboardCheck, 
  ListTodo,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

export type IsoActiveTab = 'summary' | 'checklist' | 'audit' | 'tasks';

interface HeaderProps {
  auditTitle: string;
  auditRunLabel: string;
  activeAuditKey: string;
  activeTab: IsoActiveTab;
  onSelectTab: (tab: IsoActiveTab) => void;
  pendingTasksCount: number;
  onChangeAudit: () => void;
  auditClosed: boolean;
  saveState: 'saved' | 'saving' | 'error';
  onToggleAuditClosed: () => void;
  onOpenReportModal: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  auditTitle,
  auditRunLabel,
  activeAuditKey,
  activeTab,
  onSelectTab,
  pendingTasksCount,
  onChangeAudit,
  auditClosed,
  saveState,
  onToggleAuditClosed,
  onOpenReportModal,
  onExportJSON,
  onExportCSV,
}) => {
  const isIso = activeAuditKey === 'iso9001';

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 shrink-0 z-30 select-none">
      {/* Primary Top Bar */}
      <div className="h-14 sm:h-15 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Branding & Audit Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-blue-600 p-2 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-900/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AUDIT SOL · {activeAuditKey === 'pcgc' ? 'F21 PCGC' : 'ISO 9001:2015'}
              </span>
              {auditClosed && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  CERRADA
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-white truncate">
              {auditTitle} <span className="font-semibold text-slate-400">· {auditRunLabel}</span>
            </p>
          </div>
        </div>

        {/* Center: Main Navigation Tabs for ISO 9001 (Desktop) */}
        {isIso && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onSelectTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Resumen</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Checklist ISO</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Modo Auditor</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Pendientes</span>
              {pendingTasksCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  {pendingTasksCount}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* Right Actions & Sync State */}
        <div className="flex items-center gap-2">
          {/* Sync indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            {saveState === 'saved' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </span>
            ) : saveState === 'saving' ? (
              <span className="flex items-center gap-1 text-blue-400 animate-pulse">
                <Cloud className="w-3.5 h-3.5" />
                <span>Guardando...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <Cloud className="w-3.5 h-3.5" />
                <span>Revisar guardado</span>
              </span>
            )}
          </div>

          {/* Dossier Report Button */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Generar informe / Dossier oficial de auditoría"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dossier</span>
          </button>

          {/* Export button */}
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              title="Exportar datos"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Exportar</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 w-36 z-50 animate-in fade-in duration-100">
              <button
                type="button"
                onClick={onExportCSV}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={onExportJSON}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          {/* Lock Audit button */}
          <button
            type="button"
            onClick={onToggleAuditClosed}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
              auditClosed
                ? 'border-amber-400/40 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={auditClosed ? 'Reabrir auditoría para edición' : 'Cerrar auditoría'}
          >
            {auditClosed ? <LockKeyholeOpen className="w-3.5 h-3.5 text-amber-400" /> : <LockKeyhole className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{auditClosed ? 'Reabrir' : 'Cerrar'}</span>
          </button>

          {/* Change Audit */}
          <button
            type="button"
            onClick={onChangeAudit}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            title="Cambiar sede, año o tipo de auditoría"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cambiar</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      {isIso && (
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 text-xs">
          <button
            type="button"
            onClick={() => onSelectTab('summary')}
            className={`flex items-center gap-1 py-1 px-2 rounded font-bold ${
              activeTab === 'summary' ? 'text-blue-400 bg-slate-900' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Resumen</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('checklist')}
            className={`flex items-center gap-1 py-1 px-2 rounded font-bold ${
              activeTab === 'checklist' ? 'text-blue-400 bg-slate-900' : 'text-slate-400'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('audit')}
            className={`flex items-center gap-1 py-1 px-2 rounded font-bold ${
              activeTab === 'audit' ? 'text-blue-400 bg-slate-900' : 'text-slate-400'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Auditar</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('tasks')}
            className={`flex items-center gap-1 py-1 px-2 rounded font-bold relative ${
              activeTab === 'tasks' ? 'text-blue-400 bg-slate-900' : 'text-slate-400'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Tareas</span>
            {pendingTasksCount > 0 && (
              <span className="ml-0.5 px-1 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950">
                {pendingTasksCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
