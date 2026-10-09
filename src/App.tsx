import React, { useState, useEffect, useMemo } from 'react';
import { 
  AuditItem, 
  ComplianceStatus, 
  EvidenceType, 
  EvidenceLink,
  OriginType,
  AuditActionItem 
} from './types/audit';
import { 
  getStoredAuditItems, 
  saveAuditItems, 
  calculateStats,
  getAuditRunState,
  saveAuditRunState,
  getStoredActionItems,
  saveStoredActionItems,
  exportAuditDataToJSON,
  exportAuditDataToCSV,
  type AuditRunState
} from './services/storageService';
import { pushAllToAppsScript } from './services/googleSyncService';
import { 
  getAuditDefinition, 
  getAuditRunLabel, 
  getAuditRunStorageKey, 
  type AuditRunContext 
} from './data/auditConfig';
import { Header, type IsoActiveTab } from './components/Header';
import { IsoSummaryView } from './components/iso/IsoSummaryView';
import { IsoChecklistView } from './components/iso/IsoChecklistView';
import { IsoPendingTasksView } from './components/iso/IsoPendingTasksView';
import { ActionItemModal } from './components/iso/ActionItemModal';
import { AuditMode } from './components/AuditMode';
import { EvidenceManagerModal } from './components/EvidenceManagerModal';
import { AuditReportModal } from './components/AuditReportModal';
import { QuickViewerModal } from './components/QuickViewerModal';
import { AuditItemCard, STATUS_CONFIG } from './components/AuditItemCard';
import { EvidenceButton } from './components/EvidenceTypeBadge';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  Edit,
  FileText,
  FileSpreadsheet,
  Globe,
  Workflow,
  HardDrive,
  FileCheck2
} from 'lucide-react';

interface AppProps {
  auditRun: AuditRunContext;
  onChangeAudit: () => void;
}

export default function App({ auditRun, onChangeAudit }: AppProps) {
  const activeAuditKey = auditRun.auditKey;
  const isIso = activeAuditKey === 'iso9001';
  const activeAudit = getAuditDefinition(activeAuditKey);
  const storageScope = getAuditRunStorageKey(auditRun);

  // Core audit items & run state
  const [items, setItems] = useState<AuditItem[]>(() => getStoredAuditItems(activeAuditKey, storageScope));
  const [auditState, setAuditState] = useState<AuditRunState>(() => getAuditRunState(storageScope));
  const [actionItems, setActionItems] = useState<AuditActionItem[]>(() => getStoredActionItems(storageScope));
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');

  // ISO Navigation tabs
  const [activeIsoTab, setActiveIsoTab] = useState<IsoActiveTab>('summary');

  // PCGC View Mode: table or cards or audit
  const [pcgcViewMode, setPcgcViewMode] = useState<'table' | 'cards' | 'audit'>('table');
  const [isoViewMode, setIsoViewMode] = useState<'table' | 'cards'>('table');

  // ISO Checklist Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClause, setSelectedClause] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState<OriginType | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [evidenceCoverageFilter, setEvidenceCoverageFilter] = useState<'all' | 'with_evidence' | 'missing_evidence'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | 'pv' | 'v'>('all');
  const [responsibleAreaFilter, setResponsibleAreaFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'row' | 'code' | 'evidences' | 'status' | 'priority'>('row');

  // Target item when navigating from Summary to Audit Mode
  const [auditModeTargetId, setAuditModeTargetId] = useState<string | null>(null);

  // Modals state
  const [selectedItemForModal, setSelectedItemForModal] = useState<AuditItem | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceLink | null>(null);

  // Action item modal
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedReqForAction, setSelectedReqForAction] = useState<AuditItem | null>(null);
  const [editingActionItem, setEditingActionItem] = useState<AuditActionItem | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync to local storage
  useEffect(() => {
    saveAuditItems(items, activeAuditKey, storageScope);
  }, [items, activeAuditKey, storageScope]);

  useEffect(() => {
    saveAuditRunState(storageScope, auditState);
  }, [auditState, storageScope]);

  useEffect(() => {
    saveStoredActionItems(storageScope, actionItems);
  }, [actionItems, storageScope]);

  // Derived statistics
  const stats = useMemo(() => calculateStats(items), [items]);

  // PCGC responsible areas
  const responsibleAreas = useMemo(() => {
    if (activeAuditKey !== 'pcgc') return [];
    return Array.from(new Set<string>(items.map((item) => item.question.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [activeAuditKey, items]);

  // Handlers for Items
  const handleOpenEvidenceModal = (item: AuditItem) => {
    if (auditState.closed) return showToast('Esta auditoría está cerrada. Reabrila para hacer cambios.', 'info');
    setSelectedItemForModal(item);
    setIsEvidenceModalOpen(true);
  };

  const handleQuickAddEvidence = (item: AuditItem) => {
    if (auditState.closed) return showToast('Esta auditoría está cerrada. Reabrila para hacer cambios.', 'info');
    setSelectedItemForModal(item);
    setIsEvidenceModalOpen(true);
  };

  const handleSaveItem = (updatedItem: AuditItem) => {
    if (auditState.closed) return showToast('Esta auditoría está cerrada. Reabrila para hacer cambios.', 'info');
    setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
    showToast(`Evidencias y datos actualizados para ${updatedItem.code}`);
  };

  const handleUpdateStatus = (itemId: string, status: ComplianceStatus) => {
    if (auditState.closed) return showToast('Esta auditoría está cerrada. Reabrila para hacer cambios.', 'info');
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, status, lastUpdated: new Date().toISOString().split('T')[0] } : it))
    );
    showToast(`Estado actualizado`);
  };

  const handleSaveFinding = (itemId: string, finding: string) => {
    if (auditState.closed) return showToast('Esta auditoría está cerrada.', 'info');
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, finding, lastUpdated: new Date().toISOString().split('T')[0] } : it))
    );
    showToast('Hallazgo guardado');
  };

  const handleToggleAuditClosed = () => {
    if (!auditState.closed) {
      const confirmClose = window.confirm('¿Cerrar esta auditoría? Se bloquearán las ediciones para preservar el estado final.');
      if (!confirmClose) return;
      setAuditState({ closed: true, closedAt: new Date().toISOString() });
      showToast('Auditoría cerrada.', 'info');
      return;
    }
    setAuditState({ closed: false });
    showToast('Auditoría reabierta para editar.');
  };

  // Handlers for Action Items / Tasks
  const handleOpenNewActionModal = (requirement?: AuditItem | null) => {
    if (auditState.closed) return showToast('Esta auditoría está cerrada.', 'info');
    setSelectedReqForAction(requirement || null);
    setEditingActionItem(null);
    setIsActionModalOpen(true);
  };

  const handleEditActionItem = (task: AuditActionItem) => {
    if (auditState.closed) return showToast('Esta auditoría está cerrada.', 'info');
    setEditingActionItem(task);
    setIsActionModalOpen(true);
  };

  const handleSaveActionTask = (task: AuditActionItem) => {
    setActionItems((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      return [task, ...prev];
    });
    showToast('Tarea guardada exitosamente.');
  };

  const handleDeleteActionTask = (taskId: string) => {
    if (!window.confirm('¿Eliminar esta tarea pendiente?')) return;
    setActionItems((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Tarea eliminada.');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setActionItems((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'completada' ? 'pendiente' : 'completada', updatedAt: new Date().toISOString().split('T')[0] }
          : t
      )
    );
  };

  // Remote Sync debounce
  useEffect(() => {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocal) {
      setSaveState('saved');
      return;
    }

    const timer = window.setTimeout(async () => {
      setSaveState('saving');
      const res = await pushAllToAppsScript(items, activeAuditKey, auditRun, auditState);
      if (!res.success) {
        setSaveState('error');
        showToast('No se pudo respaldar en Apps Script. Verificá la conexión.', 'error');
      } else {
        setSaveState('saved');
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [items, activeAuditKey, auditRun, auditState]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClause('all');
    setSelectedOrigin('all');
    setSelectedStatusFilter('all');
    setEvidenceCoverageFilter('all');
    setAreaFilter('all');
    setResponsibleAreaFilter('all');
    setSortBy('row');
  };

  const handleNavigateToChecklistWithFilter = (filters?: { chapter?: string; status?: ComplianceStatus; coverage?: string; priorityOnly?: boolean }) => {
    if (filters?.chapter) setSelectedClause(filters.chapter);
    if (filters?.status) setSelectedStatusFilter(filters.status);
    if (filters?.coverage) setEvidenceCoverageFilter(filters.coverage as any);
    if (filters?.priorityOnly) setSortBy('priority');
    setActiveIsoTab('checklist');
  };

  const handleNavigateToAuditMode = (itemId?: string) => {
    if (itemId) setAuditModeTargetId(itemId);
    setActiveIsoTab('audit');
  };

  const pendingTasksCount = actionItems.filter((t) => t.status !== 'completada').length;

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-10 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border ${
              toast.type === 'success'
                ? 'bg-slate-950 text-white border-slate-700'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-blue-600 text-white border-blue-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* 1. Sleek Top Header with Tabs */}
      <Header
        auditTitle={activeAudit.shortName}
        auditRunLabel={getAuditRunLabel(auditRun)}
        activeAuditKey={activeAuditKey}
        activeTab={activeIsoTab}
        onSelectTab={(tab) => {
          setActiveIsoTab(tab);
          if (tab === 'audit') setAuditModeTargetId(null);
        }}
        pendingTasksCount={pendingTasksCount}
        onChangeAudit={onChangeAudit}
        auditClosed={auditState.closed}
        saveState={saveState}
        onToggleAuditClosed={handleToggleAuditClosed}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onExportJSON={() => exportAuditDataToJSON(items, actionItems)}
        onExportCSV={() => exportAuditDataToCSV(items)}
      />

      {/* 2. Main High-Density Workspace Body */}
      {isIso ? (
        /* ================= ISO 9001 REDESIGNED WORKSPACE ================= */
        <main className="flex-1 flex overflow-hidden">
          {activeIsoTab === 'summary' && (
            <IsoSummaryView
              items={items}
              stats={stats}
              actionItems={actionItems}
              onNavigateToChecklist={handleNavigateToChecklistWithFilter}
              onNavigateToAuditMode={handleNavigateToAuditMode}
              onOpenEvidenceModal={handleOpenEvidenceModal}
              onOpenActionItemModal={(req) => handleOpenNewActionModal(req)}
            />
          )}

          {activeIsoTab === 'checklist' && (
            <IsoChecklistView
              items={items}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedClause={selectedClause}
              setSelectedClause={setSelectedClause}
              selectedOrigin={selectedOrigin}
              setSelectedOrigin={setSelectedOrigin}
              selectedStatus={selectedStatusFilter}
              setSelectedStatus={setSelectedStatusFilter}
              selectedCoverage={evidenceCoverageFilter}
              setSelectedCoverage={setEvidenceCoverageFilter}
              selectedArea={areaFilter}
              setSelectedArea={setAreaFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={isoViewMode}
              setViewMode={setIsoViewMode}
              onResetFilters={handleResetFilters}
              onOpenEvidenceModal={handleOpenEvidenceModal}
              onQuickAddEvidence={handleQuickAddEvidence}
              onUpdateStatus={handleUpdateStatus}
              onPreviewEvidence={(ev) => setPreviewEvidence(ev)}
              readOnly={auditState.closed}
            />
          )}

          {activeIsoTab === 'audit' && (
            <AuditMode
              items={items}
              initialItemId={auditModeTargetId}
              onUpdateStatus={handleUpdateStatus}
              onOpenEvidenceManager={handleOpenEvidenceModal}
              onPreviewEvidence={(ev) => setPreviewEvidence(ev)}
              onSaveFinding={handleSaveFinding}
              onOpenActionItemModal={(req) => handleOpenNewActionModal(req)}
              readOnly={auditState.closed}
            />
          )}

          {activeIsoTab === 'tasks' && (
            <IsoPendingTasksView
              tasks={actionItems}
              items={items}
              onAddTask={() => handleOpenNewActionModal(null)}
              onEditTask={handleEditActionItem}
              onDeleteTask={handleDeleteActionTask}
              onToggleTaskStatus={handleToggleTaskStatus}
              onNavigateToRequirement={(reqId) => {
                const req = items.find((i) => i.id === reqId);
                if (req) {
                  setSelectedItemForModal(req);
                  setIsEvidenceModalOpen(true);
                }
              }}
            />
          )}
        </main>
      ) : (
        /* ================= PCGC AUDIT WORKSPACE (PRESERVED) ================= */
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* PCGC Control Toolbar */}
            <div className="p-3 border-b border-gray-200 flex flex-wrap justify-between items-center bg-white z-10 gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar requisito o tema PCGC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-6 py-1.5 rounded border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 font-sans"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                  className="px-2 py-1 rounded border border-gray-300 bg-white font-medium text-gray-700 cursor-pointer text-xs outline-none"
                >
                  <option value="all">Estado: Todos ({items.length})</option>
                  <option value="cumplida">✓ Cumple ({stats.compliantCount})</option>
                  <option value="en_progreso">⏳ En Proceso ({stats.inProgressCount})</option>
                  <option value="no_cumplida">✗ No Cumple ({stats.nonCompliantCount})</option>
                  <option value="no_aplica">⊘ No Aplica ({stats.notApplicableCount})</option>
                  <option value="pendiente">Pendiente ({stats.pendingCount})</option>
                </select>

                <select
                  value={responsibleAreaFilter}
                  onChange={(e) => setResponsibleAreaFilter(e.target.value)}
                  className="px-2 py-1 rounded border border-violet-200 bg-violet-50/40 font-medium text-violet-950 cursor-pointer text-xs focus:border-violet-500 outline-none"
                >
                  <option value="all">Responsable: Todos</option>
                  {responsibleAreas.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>

                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPcgcViewMode('table')}
                    className={`p-1 px-2 text-xs font-medium cursor-pointer ${pcgcViewMode === 'table' ? 'bg-[#1A1C1E] text-white' : 'bg-white text-gray-600'}`}
                  >
                    Matriz
                  </button>
                  <button
                    type="button"
                    onClick={() => setPcgcViewMode('cards')}
                    className={`p-1 px-2 text-xs font-medium cursor-pointer ${pcgcViewMode === 'cards' ? 'bg-[#1A1C1E] text-white' : 'bg-white text-gray-600'}`}
                  >
                    Tarjetas
                  </button>
                  <button
                    type="button"
                    onClick={() => setPcgcViewMode('audit')}
                    className={`p-1 px-2 text-xs font-medium cursor-pointer ${pcgcViewMode === 'audit' ? 'bg-[#1A1C1E] text-white' : 'bg-white text-gray-600'}`}
                  >
                    Auditar
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-1 px-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>

            {/* PCGC Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {pcgcViewMode === 'audit' ? (
                <AuditMode
                  items={items}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenEvidenceManager={handleOpenEvidenceModal}
                  onPreviewEvidence={(ev) => setPreviewEvidence(ev)}
                  readOnly={auditState.closed}
                />
              ) : pcgcViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <AuditItemCard
                      key={item.id}
                      item={item}
                      onOpenEvidenceModal={handleOpenEvidenceModal}
                      onQuickAddEvidence={handleQuickAddEvidence}
                      onUpdateStatus={handleUpdateStatus}
                      onQuickPreviewEvidence={(ev) => setPreviewEvidence(ev)}
                      readOnly={auditState.closed}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-16">ID</th>
                        <th className="py-2.5 px-3 min-w-[280px]">Requisito / Punto de Control</th>
                        <th className="py-2.5 px-3 w-32">Estado</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Evidencias</th>
                        <th className="py-2.5 px-3 w-28 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs bg-white">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-violet-50/40 transition-colors">
                          <td className="py-2.5 px-3 align-top font-mono font-bold text-gray-900">
                            {item.code}
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <div className="font-semibold text-gray-900">{item.requirement}</div>
                            {item.question && <div className="text-gray-500 text-[11px]">{item.question}</div>}
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateStatus(item.id, e.target.value as ComplianceStatus)}
                              disabled={auditState.closed}
                              className="text-[10px] font-bold uppercase px-2 py-1 rounded border"
                            >
                              <option value="cumplida">✓ Cumple</option>
                              <option value="en_progreso">⏳ En Proceso</option>
                              <option value="no_cumplida">✗ No Cumple</option>
                              <option value="no_aplica">⊘ No Aplica</option>
                              <option value="pendiente">Pendiente</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(item.evidences || []).map((ev) => (
                                <EvidenceButton key={ev.id} evidence={ev} denseSquare onClick={() => setPreviewEvidence(ev)} />
                              ))}
                              <button
                                type="button"
                                onClick={() => handleQuickAddEvidence(item)}
                                className="w-7 h-7 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-violet-600"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right align-top">
                            <button
                              type="button"
                              onClick={() => handleOpenEvidenceModal(item)}
                              className="text-violet-600 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Detalles</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Modals */}
      <EvidenceManagerModal
        item={selectedItemForModal}
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        onSaveItem={handleSaveItem}
        auditKey={activeAuditKey}
        auditRun={auditRun}
      />

      <ActionItemModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onSaveTask={handleSaveActionTask}
        items={items}
        defaultRequirement={selectedReqForAction}
        editingTask={editingActionItem}
      />

      <AuditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        items={items}
        stats={stats}
        auditName={`${activeAudit.shortName} · ${getAuditRunLabel(auditRun)}`}
        auditClosed={auditState.closed}
      />

      <QuickViewerModal
        evidence={previewEvidence}
        isOpen={!!previewEvidence}
        onClose={() => setPreviewEvidence(null)}
      />
    </div>
  );
}
