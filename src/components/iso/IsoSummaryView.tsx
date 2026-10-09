import React from 'react';
import { 
  AuditItem, 
  AuditStats, 
  AuditActionItem, 
  ComplianceStatus, 
  EvidenceLink 
} from '../../types/audit';
import { StatusBadge } from '../common/StatusBadge';
import { OriginBadge } from '../common/OriginBadge';
import { IsoClauseBadge } from '../common/IsoClauseBadge';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileCheck2, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  TrendingUp,
  FileText,
  Plus,
  ListTodo,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ISO_CLAUSES_LIST } from '../../data/isoNormativeMapping';

interface IsoSummaryViewProps {
  items: AuditItem[];
  stats: AuditStats;
  actionItems: AuditActionItem[];
  onNavigateToChecklist: (filter?: { chapter?: string; status?: ComplianceStatus; coverage?: string; priorityOnly?: boolean }) => void;
  onNavigateToAuditMode: (itemId?: string) => void;
  onOpenEvidenceModal: (item: AuditItem) => void;
  onOpenActionItemModal?: (requirement?: AuditItem) => void;
}

export const IsoSummaryView: React.FC<IsoSummaryViewProps> = ({
  items,
  stats,
  actionItems,
  onNavigateToChecklist,
  onNavigateToAuditMode,
  onOpenEvidenceModal,
  onOpenActionItemModal,
}) => {
  // Identify priority items that need immediate attention
  const priorityItems = items.filter((item) => {
    if (item.status === 'no_aplica') return false;
    const hasNoEvidence = !item.evidences || item.evidences.filter((e) => Boolean(e.url)).length === 0;
    const hasFinding = Boolean(item.finding && item.finding.trim().length > 0);
    return item.status === 'no_cumplida' || item.status === 'en_progreso' || (item.status === 'pendiente' && hasNoEvidence) || hasFinding;
  });

  // Calculate clause stats
  const clauseStats = ISO_CLAUSES_LIST.map((clause) => {
    const clauseItems = items.filter((i) => i.isoClause === clause);
    const compliant = clauseItems.filter((i) => i.status === 'cumplida').length;
    const withEv = clauseItems.filter((i) => (i.evidences || []).some((e) => Boolean(e.url))).length;
    const rate = clauseItems.length > 0 ? Math.round((compliant / clauseItems.length) * 100) : 0;
    return {
      clause,
      total: clauseItems.length,
      compliant,
      withEv,
      rate,
    };
  }).filter((c) => c.total > 0);

  const pendingActionItems = actionItems.filter((t) => t.status !== 'completada');

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Módulo de Preparación ISO 9001
              </span>
              <span className="text-xs text-slate-400">· Evaluación y Certificación de Calidad</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Resumen Operativo de Auditoría
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Estado de preparación documental, prioridades de revisión y cobertura de evidencias antes de la auditoría.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToAuditMode()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>Iniciar Modo Auditor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateToChecklist()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Ver Checklist Completo</span>
            </button>
          </div>
        </div>

        {/* 4 Essential Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Preparados y Verificados */}
          <div 
            onClick={() => onNavigateToChecklist({ status: 'cumplida' })}
            className="bg-white rounded-2xl border border-slate-200/90 p-4.5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Requisitos Conformes</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{stats.compliantCount}</span>
                <span className="text-xs font-semibold text-slate-500">de {stats.totalEvaluable} aplicables</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                {stats.declarativeComplianceRate}% de cumplimiento declarado
              </p>
            </div>
          </div>

          {/* KPI 2: Requisitos Pendientes */}
          <div 
            onClick={() => onNavigateToChecklist({ status: 'pendiente' })}
            className="bg-white rounded-2xl border border-slate-200/90 p-4.5 flex flex-col justify-between hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Requisitos Pendientes</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{stats.pendingCount + stats.inProgressCount}</span>
                <span className="text-xs font-semibold text-slate-500">por auditar / en curso</span>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                {stats.inProgressCount} en proceso · {stats.pendingCount} pendientes
              </p>
            </div>
          </div>

          {/* KPI 3: Requisitos con Incumplimientos o Hallazgos */}
          <div 
            onClick={() => onNavigateToChecklist({ status: 'no_cumplida' })}
            className="bg-white rounded-2xl border border-slate-200/90 p-4.5 flex flex-col justify-between hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Incumplimientos / Desvíos</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 grid place-items-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-600">{stats.nonCompliantCount}</span>
                <span className="text-xs font-semibold text-slate-500">no conformidades</span>
              </div>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                {stats.nonCompliantCount === 0 ? 'Sin no conformidades críticas' : 'Requieren plan de acción urgente'}
              </p>
            </div>
          </div>

          {/* KPI 4: Evidencias Pendientes de Validación */}
          <div 
            onClick={() => onNavigateToChecklist({ coverage: 'with_evidence' })}
            className="bg-white rounded-2xl border border-slate-200/90 p-4.5 flex flex-col justify-between hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Evidencias Registradas</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{stats.totalEvidencesCount}</span>
                <span className="text-xs font-semibold text-slate-500">en {stats.withEvidenceCount} criterios</span>
              </div>
              <p className="text-[11px] text-blue-700 font-semibold mt-1">
                {stats.verifiedEvidencesCount} verificadas · {stats.pendingValidationEvidencesCount} por revisar
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Clause progress */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Desglose por Capítulos Normativos ISO 9001
                </h2>
                <p className="text-[11px] text-slate-500">
                  Progreso de cumplimiento y cobertura documental según la estructura de la norma.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToChecklist()}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Ver matriz
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {clauseStats.map((item) => (
                <div 
                  key={item.clause}
                  onClick={() => onNavigateToChecklist({ chapter: item.clause })}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {item.clause}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {item.compliant} / {item.total} ({item.rate}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.rate === 100 ? 'bg-emerald-500' : item.rate >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0 sm:pl-4">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px]">
                      {item.withEv} con evidencia
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Reliable indicator formula breakdown & Action Tasks */}
          <div className="space-y-4">
            {/* Reliable Metrics Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Indicadores Confiables
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Cumplimiento Declarado:</span>
                    <span className="font-bold text-slate-900">{stats.declarativeComplianceRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${stats.declarativeComplianceRate}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Requisitos conformes sobre aplicables.</p>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Preparación Documental:</span>
                    <span className="font-bold text-emerald-700">{stats.documentaryPreparationRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${stats.documentaryPreparationRate}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Requisitos con evidencias verificadas.</p>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Cobertura de Evidencias:</span>
                    <span className="font-bold text-indigo-700">{stats.evidenceCoverageRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${stats.evidenceCoverageRate}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Criterios con archivos o enlaces vinculados.</p>
                </div>
              </div>
            </div>

            {/* Quick Action Tasks Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-amber-600" /> Tareas Pendientes ({pendingActionItems.length})
                </h3>
                {onOpenActionItemModal && (
                  <button
                    type="button"
                    onClick={() => onOpenActionItemModal()}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    + Nueva tarea
                  </button>
                )}
              </div>

              {pendingActionItems.length > 0 ? (
                <div className="space-y-2">
                  {pendingActionItems.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                      <div className="font-semibold text-slate-800 leading-tight">{task.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{task.responsible || 'Sin asignar'}</span>
                        {task.dueDate && <span className="font-mono">Vence: {task.dueDate}</span>}
                      </div>
                    </div>
                  ))}
                  {pendingActionItems.length > 3 && (
                    <p className="text-[10px] text-slate-400 text-center pt-1">
                      + {pendingActionItems.length - 3} tareas más en la pestaña Pendientes
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No hay tareas pendientes registradas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION: PRIORIDADES DE REVISIÓN */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Prioridades de Revisión
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {priorityItems.length} criterios requieren atención
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Criterios no cumplidos, pendientes sin evidencias o con observaciones que deben subsanarse antes de la auditoría.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToChecklist({ priorityOnly: true })}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Ver todos los pendientes en Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {priorityItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {priorityItems.slice(0, 8).map((item) => {
                const evidences = item.evidences || [];
                const validEvidences = evidences.filter((e) => Boolean(e.url));

                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.2 rounded">
                          {item.code}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                        {item.originType && <OriginBadge originType={item.originType} size="sm" />}
                        <span className="text-xs text-slate-400">#{item.rowNumber}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.requirement}
                      </h4>

                      {item.whatToVerify && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {item.whatToVerify}
                        </p>
                      )}

                      {item.finding && (
                        <p className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 mt-1 inline-block">
                          ⚠️ {item.finding}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg border ${
                        validEvidences.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {validEvidences.length > 0 ? `${validEvidences.length} evidencias` : 'Sin evidencia'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onOpenEvidenceModal(item)}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Gestionar evidencias"
                      >
                        Gestionar
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigateToAuditMode(item.id)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Auditar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800">¡Excelente! No hay prioridades pendientes críticas.</p>
              <p className="text-slate-400 mt-0.5">Todos los requisitos aplicables cuentan con evidencias y están conformes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

