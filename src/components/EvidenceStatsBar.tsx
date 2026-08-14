import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Camera, 
  FileText, 
  FileSpreadsheet, 
  Globe, 
  Workflow, 
  HardDrive,
  Layers,
  Sparkles
} from 'lucide-react';
import { AuditStats, EvidenceType } from '../types/audit';

interface EvidenceStatsBarProps {
  stats: AuditStats;
  selectedEvidenceTypeFilter: EvidenceType | 'all';
  onSelectEvidenceTypeFilter: (type: EvidenceType | 'all') => void;
}

export const EvidenceStatsBar: React.FC<EvidenceStatsBarProps> = ({
  stats,
  selectedEvidenceTypeFilter,
  onSelectEvidenceTypeFilter,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Card 1: Total Criterios */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Criterios Totales</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stats.totalItems}</span>
              <span className="text-xs text-slate-500">en 4 capítulos</span>
            </div>
          </div>

          {/* Card 2: Evidencias Registradas */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Total Evidencias</span>
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-950">{stats.totalEvidencesCount}</span>
              <span className="text-xs font-medium text-indigo-600">
                ({stats.withEvidenceCount} de {stats.totalItems} criterios)
              </span>
            </div>
          </div>

          {/* Card 3: Cobertura de Evidencias */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Cobertura Evidencias</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-bold text-emerald-950">{stats.evidenceCoverageRate}%</span>
                <span className="text-xs text-emerald-700 font-medium">{stats.withEvidenceCount}/{stats.totalItems}</span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.evidenceCoverageRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 4: Cumplimiento de Auditoría */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Cumplimiento</span>
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-950">{stats.completionRate}%</span>
              <span className="text-xs text-blue-700 font-medium">
                {stats.compliantCount} cumplidas
              </span>
            </div>
          </div>

          {/* Card 5: Pendientes */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pendientes de Carga</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-950">
                {stats.totalItems - stats.withEvidenceCount}
              </span>
              <span className="text-xs text-amber-700 font-medium">sin enlaces aún</span>
            </div>
          </div>
        </div>

        {/* Evidence Category Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1.5">Filtrar por tipo de evidencia:</span>
          
          <button
            type="button"
            onClick={() => onSelectEvidenceTypeFilter('all')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedEvidenceTypeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({stats.totalEvidencesCount})
          </button>

          <button
            type="button"
            onClick={() => onSelectEvidenceTypeFilter('photo')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedEvidenceTypeFilter === 'photo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Fotos ({stats.evidenceTypeCounts.photo || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectEvidenceTypeFilter('pdf')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedEvidenceTypeFilter === 'pdf'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDFs / Docs ({stats.evidenceTypeCounts.pdf || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectEvidenceTypeFilter('sheet')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedEvidenceTypeFilter === 'sheet'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Sheets / Matrices ({stats.evidenceTypeCounts.sheet || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectEvidenceTypeFilter('sop')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedEvidenceTypeFilter === 'sop'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Procesos / SOP ({stats.evidenceTypeCounts.sop || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectEvidenceTypeFilter('web')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedEvidenceTypeFilter === 'web'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web / Portales ({stats.evidenceTypeCounts.web || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectEvidenceTypeFilter('drive')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedEvidenceTypeFilter === 'drive'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Drive ({stats.evidenceTypeCounts.drive || 0})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
