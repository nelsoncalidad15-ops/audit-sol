import React, { useState } from 'react';
import { AuditItem, AuditActionItem } from '../../types/audit';
import { X, Save, Plus, ListTodo, Calendar, User, FileText } from 'lucide-react';

interface ActionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: AuditActionItem) => void;
  items: AuditItem[];
  defaultRequirement?: AuditItem | null;
  editingTask?: AuditActionItem | null;
}

export const ActionItemModal: React.FC<ActionItemModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  items,
  defaultRequirement = null,
  editingTask = null,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(editingTask?.title || '');
  const [selectedReqId, setSelectedReqId] = useState(
    editingTask?.requirementId || defaultRequirement?.id || items[0]?.id || ''
  );
  const [responsible, setResponsible] = useState(editingTask?.responsible || defaultRequirement?.responsible || '');
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || '');
  const [status, setStatus] = useState<'pendiente' | 'en_progreso' | 'completada'>(
    editingTask?.status || 'pendiente'
  );
  const [comments, setComments] = useState(editingTask?.comments || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Ingresá el título o descripción de la tarea pendiente.');
      return;
    }

    const selectedReq = items.find((i) => i.id === selectedReqId);

    const task: AuditActionItem = {
      id: editingTask?.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      requirementId: selectedReq?.id || '',
      requirementCode: selectedReq?.code || '',
      requirementTitle: selectedReq?.requirement || 'General',
      responsible: responsible.trim() || 'Responsable de Calidad',
      dueDate: dueDate || undefined,
      status,
      comments: comments.trim(),
      createdAt: editingTask?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveTask(task);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {editingTask ? 'Editar Tarea Pendiente' : 'Nueva Tarea / Pendiente Pre-Auditoría'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <p className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMsg}
            </p>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ¿Qué falta conseguir, revisar o corregir? *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej: Conseguir certificado de calibración del torquímetro 1/2..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Associated Requirement */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requisito de Auditoría Relacionado:
            </label>
            <select
              value={selectedReqId}
              onChange={(e) => {
                setSelectedReqId(e.target.value);
                const req = items.find((i) => i.id === e.target.value);
                if (req?.responsible && !responsible) {
                  setResponsible(req.responsible);
                }
              }}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.code}] {i.requirement}
                </option>
              ))}
            </select>
          </div>

          {/* Responsible & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsable:
              </label>
              <input
                type="text"
                placeholder="Ej: Calidad, Jefe Taller, Asesor..."
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Límite Prevista:
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado de la Tarea:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none font-semibold text-slate-800"
            >
              <option value="pendiente">⏳ Pendiente</option>
              <option value="en_progreso">🔄 En Progreso</option>
              <option value="completada">✓ Completada / Resuelta</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comentarios o Notas de Seguimiento:
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre avance, contactos o cómo resolver..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Tarea</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
