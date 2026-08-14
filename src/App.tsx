import React, { useState, useEffect, useMemo } from 'react';
import { 
  AuditItem, 
  ComplianceStatus, 
  EvidenceType, 
  EvidenceLink 
} from './types/audit';
import { 
  getStoredAuditItems, 
  saveAuditItems, 
  calculateStats
} from './services/storageService';
import { pushAllToAppsScript } from './services/googleSyncService';
import { Header } from './components/Header';
import { AuditItemCard, STATUS_CONFIG } from './components/AuditItemCard';
import { EvidenceButton } from './components/EvidenceTypeBadge';
import { EvidenceManagerModal } from './components/EvidenceManagerModal';
import { AuditReportModal } from './components/AuditReportModal';
import { QuickViewerModal } from './components/QuickViewerModal';
import { AuditMode } from './components/AuditMode';
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
  ExternalLink,
  BookOpen,
  Building2,
  Wrench,
  ShoppingBag,
  Camera,
  FileText,
  FileSpreadsheet,
  Globe,
  Workflow,
  HardDrive,
  FileCheck2,
  HelpCircle
} from 'lucide-react';

const CHAPTER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '1. Gestión y control de documentos': BookOpen,
  '2. Área e instalaciones': Building2,
  '3. Posventa': Wrench,
  '4. Procesos de venta': ShoppingBag,
};

export default function App() {
  // Main state
  const [items, setItems] = useState<AuditItem[]>(() => getStoredAuditItems());

  // View Mode: table (high-density) or cards
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'audit'>('table');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedEvidenceType, setSelectedEvidenceType] = useState<EvidenceType | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [evidenceCoverageFilter, setEvidenceCoverageFilter] = useState<'all' | 'with_evidence' | 'missing_evidence'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | 'pv' | 'v'>('all');
  const [sortBy, setSortBy] = useState<'row' | 'code' | 'evidences' | 'status'>('row');

  // Modals state
  const [selectedItemForModal, setSelectedItemForModal] = useState<AuditItem | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceLink | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync to local storage on change
  useEffect(() => {
    saveAuditItems(items);
  }, [items]);

  // Derived statistics
  const stats = useMemo(() => calculateStats(items), [items]);

  // Chapters list
  const chapters: string[] = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.chapter))).filter(
      (ch): ch is string => Boolean(ch)
    );
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return items
      .filter((item) => {
        // Search query
        if (q) {
          const inCode = item.code.toLowerCase().includes(q);
          const inReq = item.requirement.toLowerCase().includes(q);
          const inQuestion = item.question.toLowerCase().includes(q);
          const inDesc = item.description.toLowerCase().includes(q);
          const inAudit = item.howToAudit.toLowerCase().includes(q);
          const inFinding = (item.finding || '').toLowerCase().includes(q);
          const inComment = (item.comment || '').toLowerCase().includes(q);
          const inEvidences = (item.evidences || []).some(
            (e) => e.title.toLowerCase().includes(q) || e.url.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)
          );

          if (!inCode && !inReq && !inQuestion && !inDesc && !inAudit && !inFinding && !inComment && !inEvidences) {
            return false;
          }
        }

        // Chapter filter
        if (selectedChapter !== 'all' && item.chapter !== selectedChapter) {
          return false;
        }

        // Evidence Type filter
        if (selectedEvidenceType !== 'all') {
          const hasType = (item.evidences || []).some((e) => e.type === selectedEvidenceType);
          if (!hasType) return false;
        }

        // Status filter
        if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) {
          return false;
        }

        // Coverage filter
        if (evidenceCoverageFilter === 'with_evidence' && (!item.evidences || item.evidences.length === 0)) {
          return false;
        }
        if (evidenceCoverageFilter === 'missing_evidence' && item.evidences && item.evidences.length > 0) {
          return false;
        }

        // Area filter (PV / V)
        if (areaFilter === 'pv' && !item.pv) return false;
        if (areaFilter === 'v' && !item.v) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'code') return a.code.localeCompare(b.code, undefined, { numeric: true });
        if (sortBy === 'evidences') return (b.evidences?.length || 0) - (a.evidences?.length || 0);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return a.rowNumber - b.rowNumber;
      });
  }, [
    items,
    searchQuery,
    selectedChapter,
    selectedEvidenceType,
    selectedStatusFilter,
    evidenceCoverageFilter,
    areaFilter,
    sortBy,
  ]);

  // La vista de tarjetas es un recorrido visual completo y no hereda filtros de la matriz.
  const cardItems = useMemo(
    () => [...items].sort((a, b) => a.rowNumber - b.rowNumber),
    [items],
  );

  // Handlers
  const handleOpenEvidenceModal = (item: AuditItem) => {
    setSelectedItemForModal(item);
    setIsEvidenceModalOpen(true);
  };

  const handleQuickAddEvidence = (item: AuditItem) => {
    setSelectedItemForModal(item);
    setIsEvidenceModalOpen(true);
  };

  const handleSaveItem = (updatedItem: AuditItem) => {
    setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
    showToast(`Evidencias actualizadas para criterio ${updatedItem.code}`);
  };

  const handleUpdateStatus = (itemId: string, status: ComplianceStatus) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, status, lastUpdated: new Date().toISOString().split('T')[0] } : it))
    );
    showToast(`Estado actualizado`);
  };

  // Los cambios se guardan al instante y, tras una breve pausa, se respaldan de forma segura.
  useEffect(() => {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocal) return;

    const timer = window.setTimeout(async () => {
      const res = await pushAllToAppsScript(items);
      if (!res.success) showToast('No se pudo guardar el cambio de forma segura.', 'error');
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [items]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedChapter('all');
    setSelectedEvidenceType('all');
    setSelectedStatusFilter('all');
    setEvidenceCoverageFilter('all');
    setAreaFilter('all');
    setSortBy('row');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] text-[#1A1C1E] font-sans overflow-hidden">
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-10 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div
            className={`px-4 py-2.5 rounded shadow-lg text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-[#1A1C1E] text-white border border-gray-700'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* 1. High Density Top Header (#1A1C1E) */}
      <Header />

      {/* 2. Main High Density Body Container (Sidebar + High-Density Content Area) */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR: Categories, Evidence Types & Stats */}
        {viewMode === 'table' && (
        <aside className="w-64 sm:w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          {/* Quick Primary Actions */}
          <div className="p-3 border-b border-gray-200 space-y-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generar Dossier de Evidencias</span>
            </button>

          </div>

          {/* Chapters Navigation */}
          <div className="py-2">
            <div className="px-3 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Categorías de Auditoría
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {items.length} ítems
              </span>
            </div>

            <div className="px-2 space-y-0.5">
              {/* All Chapters */}
              <button
                type="button"
                onClick={() => setSelectedChapter('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  selectedChapter === 'all'
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 pl-2'
                    : 'text-gray-700 hover:bg-gray-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <LayoutGrid className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">Todos los Capítulos</span>
                </div>
                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                  {items.length}
                </span>
              </button>

              {/* Individual Chapters */}
              {chapters.map((chap) => {
                const chapItems = items.filter((i) => i.chapter === chap);
                const withEv = chapItems.filter((i) => (i.evidences || []).length > 0).length;
                const isSelected = selectedChapter === chap;
                const Icon = CHAPTER_ICONS[chap] || BookOpen;

                return (
                  <button
                    key={chap}
                    type="button"
                    onClick={() => setSelectedChapter(chap)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 pl-2'
                        : 'text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="truncate" title={chap}>{chap}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1 py-0.2 rounded shrink-0 ${
                      withEv === chapItems.length ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {withEv}/{chapItems.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Types Filter */}
          <div className="py-2 border-t border-gray-100">
            <div className="px-3 pb-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Tipos de Evidencia
              </span>
            </div>

            <div className="px-2 space-y-0.5">
              <button
                type="button"
                onClick={() => setSelectedEvidenceType('all')}
                className={`w-full text-left px-2.5 py-1 rounded text-xs flex items-center justify-between cursor-pointer ${
                  selectedEvidenceType === 'all'
                    ? 'bg-gray-100 text-gray-900 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>Todas ({stats.totalEvidencesCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEvidenceType('photo')}
                className={`w-full text-left px-2.5 py-1 rounded text-xs flex items-center justify-between cursor-pointer ${
                  selectedEvidenceType === 'photo'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Fotos e Imágenes</span>
                </div>
                <span className="font-mono text-[11px] text-gray-400">{stats.evidenceTypeCounts.photo || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEvidenceType('pdf')}
                className={`w-full text-left px-2.5 py-1 rounded text-xs flex items-center justify-between cursor-pointer ${
                  selectedEvidenceType === 'pdf'
                    ? 'bg-rose-50 text-rose-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>PDFs y Documentos</span>
                </div>
                <span className="font-mono text-[11px] text-gray-400">{stats.evidenceTypeCounts.pdf || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEvidenceType('sheet')}
                className={`w-full text-left px-2.5 py-1 rounded text-xs flex items-center justify-between cursor-pointer ${
                  selectedEvidenceType === 'sheet'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                  <span>Sheets y Matrices</span>
                </div>
                <span className="font-mono text-[11px] text-gray-400">{stats.evidenceTypeCounts.sheet || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEvidenceType('sop')}
                className={`w-full text-left px-2.5 py-1 rounded text-xs flex items-center justify-between cursor-pointer ${
                  selectedEvidenceType === 'sop'
                    ? 'bg-amber-50 text-amber-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-amber-600" />
                  <span>Procesos y SOPs</span>
                </div>
                <span className="font-mono text-[11px] text-gray-400">{stats.evidenceTypeCounts.sop || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEvidenceType('web')}
                className={`w-full text-left px-2.5 py-1 rounded text-xs flex items-center justify-between cursor-pointer ${
                  selectedEvidenceType === 'web'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Webs y Portales</span>
                </div>
                <span className="font-mono text-[11px] text-gray-400">{stats.evidenceTypeCounts.web || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEvidenceType('drive')}
                className={`w-full text-left px-2.5 py-1 rounded text-xs flex items-center justify-between cursor-pointer ${
                  selectedEvidenceType === 'drive'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Google Drive</span>
                </div>
                <span className="font-mono text-[11px] text-gray-400">{stats.evidenceTypeCounts.drive || 0}</span>
              </button>
            </div>
          </div>

          {/* Auditor Profile Box */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  AUD
                </div>
                <div className="text-xs font-bold text-gray-900 truncate">Equipo de Calidad</div>
              </div>
            </div>
          </div>
        </aside>
        )}

        {/* MAIN WORKSPACE SECTION */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* HIGH DENSITY CONTROL BAR (Filters, Search, View Mode) */}
          <div className="p-3 border-b border-gray-200 flex flex-wrap justify-between items-center bg-white z-10 gap-2 shrink-0">
            {/* Search Box */}
            <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar requisito, tema o evidencia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-6 py-1.5 rounded border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
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

            {/* Quick dropdown filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="px-2 py-1 rounded border border-gray-300 bg-white font-medium text-gray-700 cursor-pointer text-xs focus:border-blue-500 outline-none"
              >
                <option value="all">Estado: Todos ({items.length})</option>
                <option value="cumplida">✓ Cumple ({stats.compliantCount})</option>
                <option value="en_progreso">⏳ En Proceso ({stats.inProgressCount})</option>
                <option value="no_cumplida">✗ No Cumple ({stats.nonCompliantCount})</option>
                <option value="no_aplica">⊘ No Aplica ({stats.notApplicableCount})</option>
                <option value="pendiente">? Pendiente ({stats.pendingCount})</option>
              </select>

              {viewMode === 'table' && <>
              {/* Evidence Coverage */}
              <select
                value={evidenceCoverageFilter}
                onChange={(e) => setEvidenceCoverageFilter(e.target.value as any)}
                className="px-2 py-1 rounded border border-gray-300 bg-white font-medium text-gray-700 cursor-pointer text-xs focus:border-blue-500 outline-none"
              >
                <option value="all">Evidencias: Todas</option>
                <option value="with_evidence">✓ Con Evidencia ({stats.withEvidenceCount})</option>
                <option value="missing_evidence">⚠️ Sin Evidencia ({stats.totalItems - stats.withEvidenceCount})</option>
              </select>

              {/* Area Filter */}
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value as any)}
                className="px-2 py-1 rounded border border-gray-300 bg-white font-medium text-gray-700 cursor-pointer text-xs focus:border-blue-500 outline-none"
              >
                <option value="all">Área: PV y V</option>
                <option value="pv">Posventa (PV)</option>
                <option value="v">Ventas (V)</option>
              </select>

              {/* Sort Order */}
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs">
                <ArrowUpDown className="w-3 h-3 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-gray-700 font-medium text-xs focus:outline-none cursor-pointer"
                >
                  <option value="row">Orden Sheet</option>
                  <option value="code">Código</option>
                  <option value="evidences">Más Evidencias</option>
                  <option value="status">Estado</option>
                </select>
              </div>
              </>}

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('audit')}
                  title="Modo Auditoría: un criterio, sus evidencias y el resultado"
                  className={`p-1 px-2 text-xs font-medium flex items-center gap-1 cursor-pointer ${
                    viewMode === 'audit' ? 'bg-[#1A1C1E] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Auditar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Vista Tabla Alta Densidad"
                  className={`p-1 px-2 text-xs font-medium flex items-center gap-1 cursor-pointer ${
                    viewMode === 'table' ? 'bg-[#1A1C1E] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Matriz</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  title="Vista Tarjetas Compactas"
                  className={`p-1 px-2 text-xs font-medium flex items-center gap-1 cursor-pointer ${
                    viewMode === 'cards' ? 'bg-[#1A1C1E] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="p-1 px-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold cursor-pointer flex items-center gap-1"
                title="Quitar todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Quitar filtros</span>
              </button>
            </div>
          </div>

          {/* MAIN SCROLLABLE CONTENT (Table or Cards) */}
          <div className={`flex-1 ${viewMode === 'audit' ? 'flex overflow-hidden' : 'overflow-y-auto bg-gray-50/50'}`}>
            {viewMode === 'audit' ? (
              <AuditMode
                items={filteredItems}
                onUpdateStatus={handleUpdateStatus}
                onOpenEvidenceManager={handleOpenEvidenceModal}
                onPreviewEvidence={setPreviewEvidence}
              />
            ) : viewMode === 'cards' ? (
              <div className="p-4 space-y-8">
                {chapters.map((chapter) => {
                  const chapterItems = cardItems.filter((item) => item.chapter === chapter);
                  const ChapterIcon = CHAPTER_ICONS[chapter] || BookOpen;
                  return (
                    <section key={chapter}>
                      <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-700">
                          <ChapterIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">{chapter}</h2>
                          <p className="text-[11px] text-slate-500">{chapterItems.length} criterios</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {chapterItems.map((item) => (
                          <AuditItemCard
                            key={item.id}
                            item={item}
                            onOpenEvidenceModal={handleOpenEvidenceModal}
                            onQuickAddEvidence={handleQuickAddEvidence}
                            onUpdateStatus={handleUpdateStatus}
                            onQuickPreviewEvidence={(ev) => setPreviewEvidence(ev)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : filteredItems.length > 0 ? (
              viewMode === 'table' ? (
                /* HIGH DENSITY TABLE VIEW */
                <div className="w-full">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-16">ID</th>
                        <th className="py-2.5 px-3 min-w-[280px]">Requisito / Punto de Control</th>
                        <th className="py-2.5 px-3 w-32">Estado</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Evidencias Disponibles</th>
                        <th className="py-2.5 px-3 w-28 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs bg-white">
                      {filteredItems.map((item) => {
                        const evidences = item.evidences || [];
                        const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pendiente;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-blue-50/50 transition-colors group"
                          >
                            {/* Column 1: ID */}
                            <td className="py-2.5 px-3 align-top">
                              <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                                {item.code}
                              </span>
                              <div className="text-[10px] text-gray-400 font-mono mt-1">
                                #{item.rowNumber}
                              </div>
                            </td>

                            {/* Column 2: Requirement & Details */}
                            <td className="py-2.5 px-3 align-top">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                  {item.section}
                                </span>
                                {item.pv && (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    PV
                                  </span>
                                )}
                                {item.v && (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    V
                                  </span>
                                )}
                              </div>
                              <div className="font-semibold text-gray-900 text-xs leading-snug">
                                {item.requirement}
                              </div>
                              {item.question && item.question !== item.requirement && (
                                <div className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">
                                  {item.question}
                                </div>
                              )}
                              {item.howToAudit && (
                                <div className="text-[10px] text-blue-900 bg-blue-50/40 p-1 rounded mt-1.5 border border-blue-100/60 line-clamp-2">
                                  <span className="font-bold">Muestreo:</span> {item.howToAudit}
                                </div>
                              )}
                            </td>

                            {/* Column 3: Status */}
                            <td className="py-2.5 px-3 align-top">
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateStatus(item.id, e.target.value as ComplianceStatus)}
                                aria-label="Cambiar estado"
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none ${statusCfg.pillClass}`}
                              >
                                <option value="cumplida">✓ Cumple</option>
                                <option value="en_progreso">⏳ En Proceso</option>
                                <option value="no_cumplida">✗ No Cumple</option>
                                <option value="no_aplica">⊘ No Aplica</option>
                                <option value="pendiente">? Pendiente</option>
                              </select>
                            </td>

                            {/* Column 4: Evidence Icons */}
                            <td className="py-2.5 px-3 align-top">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {evidences.map((ev) => (
                                  <EvidenceButton
                                    key={ev.id}
                                    evidence={ev}
                                    denseSquare={true}
                                    onClick={() => {
                                      if (ev.type === 'photo' || ev.type === 'pdf') {
                                        setPreviewEvidence(ev);
                                      } else if (ev.url) {
                                        window.open(ev.url, '_blank', 'noopener,noreferrer');
                                      }
                                    }}
                                  />
                                ))}

                                {/* Quick Add Link Icon Button */}
                                <button
                                  type="button"
                                  onClick={() => handleQuickAddEvidence(item)}
                                  title="Subir evidencia"
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {evidences.length === 0 && (
                                <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                                  <Clock className="w-2.5 h-2.5" /> Sin evidencias
                                </span>
                              )}
                            </td>

                            {/* Column 5: Action */}
                            <td className="py-2.5 px-3 text-right align-top">
                              <button
                                type="button"
                                onClick={() => handleOpenEvidenceModal(item)}
                                className="text-blue-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-1 text-xs"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Detalles</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* HIGH DENSITY CARDS VIEW */
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredItems.map((item) => (
                    <AuditItemCard
                      key={item.id}
                      item={item}
                      onOpenEvidenceModal={handleOpenEvidenceModal}
                      onQuickAddEvidence={handleQuickAddEvidence}
                      onUpdateStatus={handleUpdateStatus}
                      onQuickPreviewEvidence={(ev) => setPreviewEvidence(ev)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="p-12 text-center max-w-md mx-auto">
                <Filter className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  No se encontraron criterios de auditoría
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  No hay elementos que coincidan con la búsqueda o filtros actuales.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Filtros</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. High Density Bottom Status Bar (Footer) */}
      <footer className="h-8 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-[10px] text-gray-500 shrink-0 select-none">
        <div className="flex items-center gap-3 truncate">
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistema Oficial de Auditoría de Calidad</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="hidden md:inline text-gray-500">
            Normativa VAG (Audi • VW • VW CV • ŠKODA • SEAT)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-800">
            {viewMode === 'cards' ? items.length : filteredItems.length} / {items.length} Criterios
          </span>
        </div>
      </footer>

      {/* Modals */}
      <EvidenceManagerModal
        item={selectedItemForModal}
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        onSaveItem={handleSaveItem}
      />

      <AuditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        items={items}
        stats={stats}
      />

      <QuickViewerModal
        evidence={previewEvidence}
        isOpen={!!previewEvidence}
        onClose={() => setPreviewEvidence(null)}
      />
    </div>
  );
}
