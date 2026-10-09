import React, { useState, useMemo } from 'react';
import { AuditActionItem, AuditItem } from '../../types/audit';
import { EmptyState } from '../common/EmptyState';
import { 
  ListTodo, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  ArrowRight,
  RotateCcw,
  Check,
  AlertCircle
} from 'lucide-react';

interface IsoPendingTasksViewProps {
  tasks: AuditActionItem[];
  items: AuditItem[];
  onAddTask: () => void;
  onEditTask: (task: AuditActionItem) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onNavigateToRequirement: (requirementId: string) => void;
}

export const IsoPendingTasksView: React.FC<IsoPendingTasksViewProps> = ({
  tasks,
  items,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskStatus,
  onNavigateToRequirement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente' | 'en_progreso' | 'completada'>('all');
  const [responsibleFilter, setResponsibleFilter] = useState('all');

  const responsiblesList = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.responsible).filter(Boolean))).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tasks.filter((t) => {
      if (q) {
        const inTitle = t.title.toLowerCase().includes(q);
        const inReq = t.requirementTitle.toLowerCase().includes(q);
        const inCode = t.requirementCode.toLowerCase().includes(q);
        const inResp = t.responsible.toLowerCase().includes(q);
        const inComments = (t.comments || '').toLowerCase().includes(q);
        if (!inTitle && !inReq && !inCode && !inResp && !inComments) return false;
      }

      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (responsibleFilter !== 'all' && t.responsible !== responsibleFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, statusFilter, responsibleFilter]);

  const pendingCount = tasks.filter((t) => t.status !== 'completada').length;
  const completedCount = tasks.filter((t) => t.status === 'completada').length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 space-y-5">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Header Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <ListTodo className="w-3.5 h-3.5 text-amber-600" /> Plan de Acción Pre-Auditoría
              </span>
              <span className="text-xs text-slate-400">· {pendingCount} pendientes · {completedCount} completadas</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Pendientes y Seguimiento de Tareas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Identificá qué falta conseguir, revisar o corregir antes de la visita del auditor.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea Pendiente</span>
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tarea, criterio, responsable o notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer outline-none"
            >
              <option value="all">Estado: Todos ({tasks.length})</option>
              <option value="pendiente">⏳ Pendientes</option>
              <option value="en_progreso">🔄 En Progreso</option>
              <option value="completada">✓ Completadas</option>
            </select>

            {responsiblesList.length > 0 && (
              <select
                value={responsibleFilter}
                onChange={(e) => setResponsibleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer outline-none"
              >
                <option value="all">Responsable: Todos</option>
                {responsiblesList.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}

            {(searchQuery || statusFilter !== 'all' || responsibleFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setResponsibleFilter('all');
                }}
                className="p-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'completada';

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                    isDone ? 'border-slate-200 bg-slate-50/50 opacity-75' : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={() => onToggleTaskStatus(task.id)}
                      title={isDone ? 'Marcar como pendiente' : 'Marcar como resuelta'}
                      className={`w-6 h-6 rounded-lg border grid place-items-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white text-transparent hover:border-emerald-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          task.status === 'completada'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : task.status === 'en_progreso'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {task.status === 'completada' ? 'Completada' : task.status === 'en_progreso' ? 'En Progreso' : 'Pendiente'}
                        </span>
                      </div>

                      {/* Related requirement link */}
                      {task.requirementCode && (
                        <div 
                          onClick={() => onNavigateToRequirement(task.requirementId)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer mb-1"
                        >
                          <span className="font-mono bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            {task.requirementCode}
                          </span>
                          <span className="truncate max-w-sm">{task.requirementTitle}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}

                      {task.comments && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {task.comments}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.responsible}</span>
                        </span>

                        {task.dueDate && (
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Vence: {task.dueDate}</span>
                          </span>
                        )}

                        <span>Creada: {task.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Editar tarea"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={ListTodo}
            title="No hay tareas registradas"
            description="Creá una lista liviana de pendientes para identificar todo lo necesario antes de la auditoría."
            actionText="+ Crear primera tarea"
            onAction={onAddTask}
          />
        )}
      </div>
    </div>
  );
};
