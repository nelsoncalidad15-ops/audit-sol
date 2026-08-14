import React, { useState } from 'react';
import { 
  AuditItem, 
  EvidenceLink, 
  EvidenceType, 
  ComplianceStatus 
} from '../types/audit';
import { EVIDENCE_CONFIG } from './EvidenceTypeBadge';
import { 
  X, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  FileCheck2, 
  Camera, 
  FileText, 
  FileSpreadsheet, 
  Globe, 
  Workflow, 
  HardDrive,
  Save,
  Link as LinkIcon,
  HelpCircle,
  QrCode
} from 'lucide-react';

interface EvidenceManagerModalProps {
  item: AuditItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (updatedItem: AuditItem) => void;
}

export const EvidenceManagerModal: React.FC<EvidenceManagerModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveItem,
}) => {
  if (!isOpen || !item) return null;

  const [formData, setFormData] = useState<AuditItem>({ ...item });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New evidence form state
  const [newType, setNewType] = useState<EvidenceType>('photo');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      setErrorMsg('Por favor ingresa una URL válida para la evidencia.');
      return;
    }

    const typeConfig = EVIDENCE_CONFIG[newType];
    const generatedTitle = newTitle.trim() || `${typeConfig.label} - ${item.code}`;

    const newEvidence: EvidenceLink = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: newType,
      title: generatedTitle,
      url: newUrl.trim(),
      description: newDescription.trim(),
      addedAt: new Date().toISOString().split('T')[0],
      verified: true,
    };

    setFormData((prev) => ({
      ...prev,
      evidences: [...(prev.evidences || []), newEvidence],
      // If adding first evidence and status was pending, suggest completed or in progress
      status: prev.status === 'pendiente' ? 'cumplida' : prev.status,
    }));

    // Reset add form
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setErrorMsg('');
    setShowAddForm(false);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    setFormData((prev) => ({
      ...prev,
      evidences: (prev.evidences || []).filter((e) => e.id !== evidenceId),
    }));
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = () => {
    onSaveItem({
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold font-mono bg-indigo-600 rounded text-white">
              {item.code}
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {item.requirement}
              </h2>
              <p className="text-xs text-slate-300 truncate max-w-md">
                {item.chapter} › {item.section}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Requirement summary & instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            {item.description && (
              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Descripción:</span>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{item.description}</p>
              </div>
            )}
            {item.howToAudit && (
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-blue-900 block mb-0.5">Cómo Auditar / Verificación:</span>
                <p className="text-blue-950 whitespace-pre-line leading-relaxed">{item.howToAudit}</p>
              </div>
            )}
          </div>

          {/* EVIDENCES LIST & MANAGEMENT */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                <span>Enlaces y Evidencias de este punto ({formData.evidences?.length || 0})</span>
              </h3>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Enlace de Evidencia</span>
                </button>
              )}
            </div>

            {/* Add New Evidence Form */}
            {showAddForm && (
              <form onSubmit={handleAddEvidence} className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
                  <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nuevo Enlace de Evidencia</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-700 bg-rose-100/80 px-2.5 py-1.5 rounded-md font-medium">
                    {errorMsg}
                  </p>
                )}

                {/* Evidence Type Selection Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tipo de Evidencia / Destino:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { type: 'photo', label: '📸 Foto / Imagen', icon: Camera },
                      { type: 'pdf', label: '📄 PDF / Documento', icon: FileText },
                      { type: 'sheet', label: '📊 Google Sheet', icon: FileSpreadsheet },
                      { type: 'web', label: '🌐 Web / Portal', icon: Globe },
                      { type: 'sop', label: '⚙️ Proceso / Diagrama', icon: Workflow },
                      { type: 'drive', label: '🗂️ Google Drive', icon: HardDrive },
                    ].map((t) => (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setNewType(t.type as EvidenceType)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border text-left transition-all cursor-pointer ${
                          newType === t.type
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Título o Nombre de la Evidencia:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Registro Fotográfico de Residuos, Protocolo CEM, Factura Muestra..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enlace / URL de la Evidencia <span className="text-rose-600">*</span>:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/..., https://docs.google.com/..., https://..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Puedes pegar enlaces directos de Google Drive, Google Sheets, Dropbox, imágenes online o portales web.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descripción / Nota explicativa (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Muestra tomada el 10/08 correspondiente a auditoría interna."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guardar Evidencia</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of existing evidences */}
            <div className="space-y-2.5">
              {(formData.evidences || []).length > 0 ? (
                formData.evidences.map((ev) => {
                  const typeCfg = EVIDENCE_CONFIG[ev.type] || EVIDENCE_CONFIG.other;
                  const Icon = typeCfg.icon;

                  return (
                    <div
                      key={ev.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${typeCfg.bgClass} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {ev.title}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeCfg.bgClass}`}>
                              {typeCfg.label}
                            </span>
                          </div>
                          {ev.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {ev.description}
                            </p>
                          )}
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-indigo-600 hover:underline truncate block mt-0.5 max-w-sm sm:max-w-md"
                          >
                            {ev.url}
                          </a>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                          title="Abrir evidencia en nueva pestaña"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(ev.url, ev.id)}
                          title="Copiar enlace"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          {copiedId === ev.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEvidence(ev.id)}
                          title="Eliminar evidencia"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-600">
                    Aún no hay evidencias adjuntas para este criterio.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Haz clic en "+ Agregar Enlace de Evidencia" para vincular una foto, PDF, Sheet o proceso.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AUDIT STATUS & FINDINGS */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Estado de Auditoría & Conformidad
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado de Cumplimiento:
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ComplianceStatus })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="cumplida">✓ Cumplida (Conforme)</option>
                  <option value="en_progreso">⏳ En Progreso (Evidencia Parcial)</option>
                  <option value="no_cumplida">✗ No Cumplida (No Conforme)</option>
                  <option value="no_aplica">⊘ No Aplica</option>
                  <option value="pendiente">? Pendiente de Revisión</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsable del Criterio:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Calidad, Gerencia Posventa, Jefe de Taller..."
                  value={formData.responsible || ''}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción del Hallazgo / Observación:
              </label>
              <textarea
                rows={2}
                placeholder="Indica hallazgos detectados, muestras verificadas o notas para la auditoría..."
                value={formData.finding || ''}
                onChange={(e) => setFormData({ ...formData, finding: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
