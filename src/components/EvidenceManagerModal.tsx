import React, { useRef, useState } from 'react';
import { 
  AuditItem, 
  EvidenceLink, 
  EvidenceType, 
  ComplianceStatus,
  EvidenceStatus
} from '../types/audit';
import { uploadEvidenceToAppsScript } from '../services/googleSyncService';
import type { AuditKey, AuditRunContext } from '../data/auditConfig';
import { EVIDENCE_CONFIG } from './EvidenceTypeBadge';
import { OriginBadge } from './common/OriginBadge';
import { 
  X, 
  Plus, 
  Trash2, 
  ExternalLink, 
  FileCheck2, 
  Globe, 
  Save, 
  Pencil, 
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  ShieldCheck,
  FileText,
  Info
} from 'lucide-react';

interface EvidenceManagerModalProps {
  item: AuditItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (updatedItem: AuditItem) => void;
  auditKey?: AuditKey;
  auditRun?: AuditRunContext;
}

export const EvidenceManagerModal: React.FC<EvidenceManagerModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveItem,
  auditKey = 'iso9001',
  auditRun,
}) => {
  if (!isOpen || !item) return null;

  const [formData, setFormData] = useState<AuditItem>({ ...item });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Link form state
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkType, setLinkType] = useState<EvidenceType>('web');
  const [linkNotes, setLinkNotes] = useState('');
  const [linkVerified, setLinkVerified] = useState(false);

  // Edit evidence state
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null);
  const [editType, setEditType] = useState<EvidenceType>('photo');
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVerified, setEditVerified] = useState(false);
  const [editValidUntil, setEditValidUntil] = useState('');
  const [editVerifiedBy, setEditVerifiedBy] = useState('');

  // Direct Upload handler
  const handleInstantUpload = async (file: File | null) => {
    if (!file || isSaving) return;

    const type: EvidenceType = file.type.startsWith('image/') 
      ? 'photo' 
      : file.type === 'application/pdf' 
      ? 'pdf' 
      : file.type.includes('sheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')
      ? 'sheet'
      : 'other';

    const evidence: EvidenceLink = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: file.name,
      url: '',
      addedAt: new Date().toISOString().split('T')[0],
      verified: false,
      status: 'pending_review',
    };

    setErrorMsg('');
    setIsSaving(true);
    setSaveMessage('Subiendo archivo a Google Drive...');
    try {
      const key = (auditKey as AuditKey) || 'iso9001';
      const uploaded = await uploadEvidenceToAppsScript(item, evidence, file, key, auditRun);
      const updatedItem: AuditItem = {
        ...formData,
        evidences: [...(formData.evidences || []), { ...uploaded, verified: false, status: 'linked' }],
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setFormData(updatedItem);
      onSaveItem(updatedItem);
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudo subir el archivo.');
    } finally {
      setIsSaving(false);
      setSaveMessage('');
    }
  };

  // Add URL Link handler
  const handleAddLink = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const trimmedUrl = linkUrl.trim();
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        throw new Error('La URL debe comenzar con http:// o https://');
      }
      const url = new URL(trimmedUrl).toString();
      const evidence: EvidenceLink = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: linkType,
        title: linkTitle.trim() || new URL(url).hostname,
        url,
        description: linkNotes.trim(),
        addedAt: new Date().toISOString().split('T')[0],
        verified: linkVerified,
        status: linkVerified ? 'verified' : 'linked',
        verifiedAt: linkVerified ? new Date().toISOString().split('T')[0] : undefined,
      };

      const updatedItem: AuditItem = {
        ...formData,
        evidences: [...(formData.evidences || []), evidence],
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setFormData(updatedItem);
      onSaveItem(updatedItem);
      setLinkUrl('');
      setLinkTitle('');
      setLinkNotes('');
      setLinkVerified(false);
      setIsLinkFormOpen(false);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ingresá un enlace web válido que comience con https://');
    }
  };

  // Delete evidence with confirmation
  const handleDeleteEvidence = (evidenceId: string) => {
    if (!window.confirm('¿Quitar este vínculo de evidencia del requisito? El archivo en Drive permanecerá seguro.')) {
      return;
    }
    const updatedEvidences = (formData.evidences || []).filter((e) => e.id !== evidenceId);
    const updatedItem = {
      ...formData,
      evidences: updatedEvidences,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setFormData(updatedItem);
    onSaveItem(updatedItem);
  };

  // Toggle verification state directly
  const handleToggleVerifyEvidence = (evidenceId: string) => {
    const updatedEvidences = (formData.evidences || []).map((ev) => {
      if (ev.id === evidenceId) {
        const nextVerified = !ev.verified;
        return {
          ...ev,
          verified: nextVerified,
          status: (nextVerified ? 'verified' : 'linked') as EvidenceStatus,
          verifiedAt: nextVerified ? new Date().toISOString().split('T')[0] : undefined,
          verifiedBy: nextVerified ? (formData.responsible || 'Responsable Calidad') : undefined,
        };
      }
      return ev;
    });

    const updatedItem = {
      ...formData,
      evidences: updatedEvidences,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setFormData(updatedItem);
    onSaveItem(updatedItem);
  };

  // Start Edit
  const handleStartEdit = (evidence: EvidenceLink) => {
    setEditingEvidenceId(evidence.id);
    setEditType(evidence.type);
    setEditTitle(evidence.title);
    setEditUrl(evidence.url || '');
    setEditDescription(evidence.description || '');
    setEditVerified(Boolean(evidence.verified));
    setEditValidUntil(evidence.validUntil || '');
    setEditVerifiedBy(evidence.verifiedBy || '');
  };

  // Save Edit
  const handleSaveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingEvidenceId) return;

    const updatedEvidences = (formData.evidences || []).map((ev) => {
      if (ev.id === editingEvidenceId) {
        return {
          ...ev,
          type: editType,
          title: editTitle.trim() || ev.title,
          url: editUrl.trim() || ev.url,
          description: editDescription.trim(),
          verified: editVerified,
          status: (editVerified ? 'verified' : 'linked') as EvidenceStatus,
          validUntil: editValidUntil || undefined,
          verifiedBy: editVerifiedBy.trim() || undefined,
          verifiedAt: editVerified ? (ev.verifiedAt || new Date().toISOString().split('T')[0]) : undefined,
        };
      }
      return ev;
    });

    const updatedItem = {
      ...formData,
      evidences: updatedEvidences,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setFormData(updatedItem);
    onSaveItem(updatedItem);
    setEditingEvidenceId(null);
  };

  // Save full form
  const handleSaveModal = () => {
    const updated = {
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onSaveItem(updated);
    onClose();
  };

  const validEvidences = (formData.evidences || []).filter((e) => Boolean(e.url && e.url.trim().length > 0));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-600 rounded-md text-white shrink-0">
              {item.code}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                {item.requirement}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {item.chapter} › {item.section}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Normative Reference & Expected Documents */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200/60">
              {item.originType && <OriginBadge originType={item.originType} size="sm" fullLabel />}
              {item.isoClause && (
                <span className="font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {item.isoClause}
                </span>
              )}
            </div>

            {item.whatToVerify && (
              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Qué se verifica:</span>
                <p className="text-slate-600 leading-relaxed">{item.whatToVerify}</p>
              </div>
            )}

            {item.whatToShow && (
              <div className="pt-2 border-t border-slate-200/60 text-indigo-950">
                <span className="font-bold text-indigo-900 block mb-0.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" /> Documentación esperada:
                </span>
                <p className="text-indigo-900/90 leading-relaxed">{item.whatToShow}</p>
              </div>
            )}
          </div>

          {/* EVIDENCES SECTION */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  <span>Evidencias Documentales ({validEvidences.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Vinculá archivos o enlaces y confirmá su verificación explícita.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSaving ? saveMessage || 'Subiendo...' : 'Subir archivo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLinkFormOpen((open) => !open)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pegar enlace</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="sr-only"
                  onChange={(event) => {
                    void handleInstantUpload(event.target.files?.[0] || null);
                    event.target.value = '';
                  }}
                />
              </div>
            </div>

            {/* Form to add URL Link */}
            {isLinkFormOpen && (
              <form onSubmit={handleAddLink} className="mb-4 bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-1.5">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" /> Vincular Enlace Web o Drive
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLinkFormOpen(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">URL del documento / web:</label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/... o https://..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tipo:</label>
                    <select
                      value={linkType}
                      onChange={(e) => setLinkType(e.target.value as EvidenceType)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
                    >
                      <option value="web">🌐 Web / Portal</option>
                      <option value="drive">🗂️ Google Drive</option>
                      <option value="sheet">📊 Google Sheet</option>
                      <option value="pdf">📄 PDF / Documento</option>
                      <option value="photo">📸 Foto / Imagen</option>
                      <option value="sop">⚙️ Proceso / SOP</option>
                      <option value="other">📎 Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Título descriptivo:</label>
                    <input
                      type="text"
                      placeholder="Ej: Registro Fotográfico de Residuos, Protocolo..."
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nota u observación:</label>
                    <input
                      type="text"
                      placeholder="Ej: Muestra tomada en auditoría previa..."
                      value={linkNotes}
                      onChange={(e) => setLinkNotes(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={linkVerified}
                      onChange={(e) => setLinkVerified(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Marcar evidencia como verificada</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Guardar vínculo
                  </button>
                </div>
              </form>
            )}

            {/* List of evidences */}
            <div className="space-y-2">
              {(formData.evidences || []).length > 0 ? (
                formData.evidences.map((ev) => {
                  const typeCfg = EVIDENCE_CONFIG[ev.type] || EVIDENCE_CONFIG.other;
                  const Icon = typeCfg.icon;
                  const hasUrl = Boolean(ev.url && ev.url.trim().length > 0);

                  if (editingEvidenceId === ev.id) {
                    return (
                      <form key={ev.id} onSubmit={handleSaveEdit} className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                          <Pencil className="w-3.5 h-3.5" /> Editar Detalle de Evidencia
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tipo</label>
                            <select
                              value={editType}
                              onChange={(e) => setEditType(e.target.value as EvidenceType)}
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                            >
                              <option value="photo">Foto / Imagen</option>
                              <option value="pdf">PDF / Documento</option>
                              <option value="sheet">Google Sheet</option>
                              <option value="web">Web / Portal</option>
                              <option value="sop">Proceso / SOP</option>
                              <option value="drive">Google Drive</option>
                              <option value="other">Otro</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Título</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">URL / Enlace</label>
                          <input
                            type="url"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Descripción / Nota</label>
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Vigencia / Fecha de revisión (opcional)</label>
                            <input
                              type="date"
                              value={editValidUntil}
                              onChange={(e) => setEditValidUntil(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={editVerified}
                              onChange={(e) => setEditVerified(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Evidencia verificada y conforme</span>
                          </label>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingEvidenceId(null)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                            >
                              Guardar cambios
                            </button>
                          </div>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div
                      key={ev.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all gap-3"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`p-2 rounded-lg ${typeCfg.bgClass} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {ev.title}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${typeCfg.bgClass}`}>
                              {typeCfg.label}
                            </span>
                            {ev.verified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Verificada
                              </span>
                            ) : hasUrl ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                                <Clock className="w-3 h-3" /> Pendiente de revisión
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                <AlertCircle className="w-3 h-3" /> Falta vincular archivo
                              </span>
                            )}
                          </div>

                          {ev.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {ev.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                            {ev.addedAt && <span>Alta: {ev.addedAt}</span>}
                            {ev.validUntil && <span>Vigencia: {ev.validUntil}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {hasUrl && (
                          <button
                            type="button"
                            onClick={() => handleToggleVerifyEvidence(ev.id)}
                            title={ev.verified ? 'Marcar como no verificada' : 'Marcar como verificada'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 ${
                              ev.verified
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">{ev.verified ? 'Verificada' : 'Verificar'}</span>
                          </button>
                        )}

                        {hasUrl && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                            title="Abrir en pestaña nueva"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">Abrir</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleStartEdit(ev)}
                          title="Editar evidencia"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEvidence(ev.id)}
                          title="Quitar vínculo"
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
                  <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-600">
                    Aún no hay evidencias adjuntas para este criterio.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hacé clic en "+ Subir archivo" o "Pegar enlace" para respaldar este requisito.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AUDIT STATUS, RESPONSIBLE & FINDINGS */}
          <div className="border-t border-slate-200 pt-4 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Estado de Auditoría y Hallazgos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado de Conformidad:
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ComplianceStatus })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="cumplida">✓ Cumple (Conforme)</option>
                  <option value="en_progreso">⏳ En Progreso (Evidencia Parcial / En Proceso)</option>
                  <option value="no_cumplida">✗ No Cumple (No Conforme / Desvío)</option>
                  <option value="no_aplica">⊘ No Aplica</option>
                  <option value="pendiente">Pendiente de Verificación</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsable del Criterio:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Responsable de Calidad, Jefe de Taller..."
                  value={formData.responsible || ''}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hallazgo / Observación de Auditoría:
              </label>
              <textarea
                rows={2}
                placeholder="Describí observaciones, desvíos detectados o notas para la auditoría..."
                value={formData.finding || ''}
                onChange={(e) => setFormData({ ...formData, finding: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSaveModal}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
