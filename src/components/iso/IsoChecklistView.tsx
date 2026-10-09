import React, { useState, useMemo } from 'react';
import { 
  AuditItem, 
  ComplianceStatus, 
  EvidenceType, 
  EvidenceLink,
  OriginType 
} from '../../types/audit';
import { AuditItemCard } from '../AuditItemCard';
import { EvidenceButton } from '../EvidenceTypeBadge';
import { StatusBadge, STATUS_CONFIG } from '../common/StatusBadge';
import { OriginBadge } from '../common/OriginBadge';
import { IsoClauseBadge } from '../common/IsoClauseBadge';
import { EmptyState } from '../common/EmptyState';
import { ISO_CLAUSES_LIST, ORIGIN_TYPES_CONFIG } from '../../data/isoNormativeMapping';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  LayoutGrid, 
  Table as TableIcon, 
  Plus, 
  Edit, 
  Clock, 
  ArrowUpDown, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  FileCheck2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface IsoChecklistViewProps {
  items: AuditItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedClause: string;
  setSelectedClause: (c: string) => void;
  selectedOrigin: OriginType | 'all';
  setSelectedOrigin: (o: OriginType | 'all') => void;
  selectedStatus: ComplianceStatus | 'all';
  setSelectedStatus: (s: ComplianceStatus | 'all') => void;
  selectedCoverage: 'all' | 'with_evidence' | 'missing_evidence';
  setSelectedCoverage: (c: 'all' | 'with_evidence' | 'missing_evidence') => void;
  selectedArea: 'all' | 'pv' | 'v';
  setSelectedArea: (a: 'all' | 'pv' | 'v') => void;
  sortBy: 'row' | 'code' | 'evidences' | 'status' | 'priority';
  setSortBy: (s: 'row' | 'code' | 'evidences' | 'status' | 'priority') => void;
  viewMode: 'table' | 'cards';
  setViewMode: (m: 'table' | 'cards') => void;
  onResetFilters: () => void;
  onOpenEvidenceModal: (item: AuditItem) => void;
  onQuickAddEvidence: (item: AuditItem) => void;
  onUpdateStatus: (itemId: string, status: ComplianceStatus) => void;
  onPreviewEvidence: (ev: EvidenceLink) => void;
  readOnly?: boolean;
}

export const IsoChecklistView: React.FC<IsoChecklistViewProps> = ({
  items,
  searchQuery,
  setSearchQuery,
  selectedClause,
  setSelectedClause,
  selectedOrigin,
  setSelectedOrigin,
  selectedStatus,
  setSelectedStatus,
  selectedCoverage,
  setSelectedCoverage,
  selectedArea,
  setSelectedArea,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onResetFilters,
  onOpenEvidenceModal,
  onQuickAddEvidence,
  onUpdateStatus,
  onPreviewEvidence,
  readOnly = false,
}) => {
  const [isSecondaryFilterOpen, setIsSecondaryFilterOpen] = useState(false);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return items
      .filter((item) => {
        // Search
        if (q) {
          const inCode = item.code.toLowerCase().includes(q);
          const inReq = item.requirement.toLowerCase().includes(q);
          const inQuestion = item.question?.toLowerCase().includes(q);
          const inDesc = item.description?.toLowerCase().includes(q);
          const inVerify = item.whatToVerify?.toLowerCase().includes(q);
          const inShow = item.whatToShow?.toLowerCase().includes(q);
          const inAudit = item.howToAudit?.toLowerCase().includes(q);
          const inFinding = (item.finding || '').toLowerCase().includes(q);
          const inResponsible = (item.responsible || '').toLowerCase().includes(q);
          const inEvidences = (item.evidences || []).some(
            (e) => e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)
          );

          if (!inCode && !inReq && !inQuestion && !inDesc && !inVerify && !inShow && !inAudit && !inFinding && !inResponsible && !inEvidences) {
            return false;
          }
        }

        // Clause filter
        if (selectedClause !== 'all') {
          if (item.isoClause !== selectedClause && item.chapter !== selectedClause) {
            return false;
          }
        }

        // Origin filter
        if (selectedOrigin !== 'all' && item.originType !== selectedOrigin) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all' && item.status !== selectedStatus) {
          return false;
        }

        // Coverage filter
        const validEvs = (item.evidences || []).filter((e) => Boolean(e.url));
        if (selectedCoverage === 'with_evidence' && validEvs.length === 0) {
          return false;
        }
        if (selectedCoverage === 'missing_evidence' && validEvs.length > 0) {
          return false;
        }

        // Area filter
        if (selectedArea === 'pv' && !item.pv) return false;
        if (selectedArea === 'v' && !item.v) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'code') return a.code.localeCompare(b.code, undefined, { numeric: true });
        if (sortBy === 'evidences') return (b.evidences?.length || 0) - (a.evidences?.length || 0);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'priority') {
          const score = (it: AuditItem) => (it.status === 'no_cumplida' ? 3 : it.status === 'en_progreso' ? 2 : it.status === 'pendiente' ? 1 : 0);
          return score(b) - score(a);
        }
        return a.rowNumber - b.rowNumber;
      });
  }, [
    items,
    searchQuery,
    selectedClause,
    selectedOrigin,
    selectedStatus,
    selectedCoverage,
    selectedArea,
    sortBy,
  ]);

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedClause !== 'all' || 
    selectedOrigin !== 'all' || 
    selectedStatus !== 'all' || 
    selectedCoverage !== 'all' || 
    selectedArea !== 'all' ||
    sortBy !== 'row';

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* TOOLBAR CONTROLS */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white z-10 shrink-0 space-y-3">
        {/* Main Search and Primary Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, requisito, documentación, responsable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Clause filter */}
            <select
              value={selectedClause}
              onChange={(e) => setSelectedClause(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer text-xs focus:border-blue-500 outline-none max-w-[190px]"
            >
              <option value="all">Cláusula: Todas ({items.length})</option>
              {ISO_CLAUSES_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer text-xs focus:border-blue-500 outline-none"
            >
              <option value="all">Estado: Todos</option>
              <option value="cumplida">✓ Cumple</option>
              <option value="en_progreso">⏳ En Proceso</option>
              <option value="no_cumplida">✗ No Cumple</option>
              <option value="no_aplica">⊘ No Aplica</option>
              <option value="pendiente">Pendiente</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden p-0.5 bg-slate-100/70">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Vista Matriz / Tabla"
                className={`p-1 px-2.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Matriz</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Vista Tarjetas"
                className={`p-1 px-2.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>

            {/* More filters button */}
            <button
              type="button"
              onClick={() => setIsSecondaryFilterOpen(!isSecondaryFilterOpen)}
              className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSecondaryFilterOpen || selectedOrigin !== 'all' || selectedCoverage !== 'all' || selectedArea !== 'all' || sortBy !== 'row'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Más filtros</span>
            </button>

            {/* Reset filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Collapsible Filters */}
        {isSecondaryFilterOpen && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-in fade-in duration-150">
            {/* Origin Type Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Origen:</label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 text-xs focus:border-blue-500 outline-none"
              >
                <option value="all">Todos los orígenes</option>
                <option value="iso9001">Requisito ISO 9001</option>
                <option value="brand">Estándar de Marca / VAG</option>
                <option value="internal">Control Interno</option>
                <option value="pending">Por clasificar</option>
              </select>
            </div>

            {/* Coverage Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Evidencias:</label>
              <select
                value={selectedCoverage}
                onChange={(e) => setSelectedCoverage(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 text-xs focus:border-blue-500 outline-none"
              >
                <option value="all">Todas las evidencias</option>
                <option value="with_evidence">✓ Con Evidencia</option>
                <option value="missing_evidence">⚠️ Sin Evidencia</option>
              </select>
            </div>

            {/* Area Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Área Concesionario:</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 text-xs focus:border-blue-500 outline-none"
              >
                <option value="all">Todas (PV y Ventas)</option>
                <option value="pv">Posventa (PV)</option>
                <option value="v">Ventas (V)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 text-xs focus:border-blue-500 outline-none"
              >
                <option value="row">Nº Fila Original</option>
                <option value="code">Código de Criterio</option>
                <option value="priority">Prioridad / Urgencia</option>
                <option value="evidences">Más Evidencias</option>
                <option value="status">Estado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT: TABLE OR CARDS */}
      <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-5">
        {filteredItems.length > 0 ? (
          viewMode === 'table' ? (
            /* HIGH DENSITY MATRIX VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5 w-20">Código</th>
                      <th className="py-3 px-3.5 min-w-[320px]">Requisito y Qué se verifica</th>
                      <th className="py-3 px-3.5 w-32">Estado</th>
                      <th className="py-3 px-3.5 min-w-[220px]">Evidencias</th>
                      <th className="py-3 px-3.5 w-28 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredItems.map((item) => {
                      const evidences = item.evidences || [];
                      const validEvs = evidences.filter((e) => Boolean(e.url));
                      const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pendiente;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          {/* Col 1: Code & Row */}
                          <td className="py-3 px-3.5 align-top">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] block text-center">
                              {item.code}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block text-center mt-1">
                              #{item.rowNumber}
                            </span>
                          </td>

                          {/* Col 2: Requirement details */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {item.originType && <OriginBadge originType={item.originType} size="sm" />}
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
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

                            <div className="font-bold text-slate-900 text-xs leading-snug">
                              {item.requirement}
                            </div>

                            {item.whatToVerify && (
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                <span className="font-semibold text-slate-700">Verificar: </span>
                                {item.whatToVerify}
                              </p>
                            )}

                            {item.whatToShow && (
                              <p className="text-[10px] text-indigo-900 bg-indigo-50/60 px-2 py-1 rounded border border-indigo-100 mt-1.5 line-clamp-2">
                                <strong className="font-semibold">Mostrar:</strong> {item.whatToShow}
                              </p>
                            )}

                            {item.finding && (
                              <p className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 mt-1.5">
                                ⚠️ Hallazgo: {item.finding}
                              </p>
                            )}
                          </td>

                          {/* Col 3: Status dropdown */}
                          <td className="py-3 px-3.5 align-top">
                            <select
                              value={item.status}
                              onChange={(e) => onUpdateStatus(item.id, e.target.value as ComplianceStatus)}
                              disabled={readOnly}
                              aria-label="Cambiar estado"
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border cursor-pointer focus:outline-none ${statusCfg.pillClass}`}
                            >
                              <option value="cumplida">✓ Cumple</option>
                              <option value="en_progreso">⏳ En Proceso</option>
                              <option value="no_cumplida">✗ No Cumple</option>
                              <option value="no_aplica">⊘ No Aplica</option>
                              <option value="pendiente">Pendiente</option>
                            </select>
                          </td>

                          {/* Col 4: Evidences */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {validEvs.map((ev) => (
                                <EvidenceButton
                                  key={ev.id}
                                  evidence={ev}
                                  denseSquare={true}
                                  onClick={() => {
                                    if (ev.type === 'photo' || ev.type === 'pdf') {
                                      onPreviewEvidence(ev);
                                    } else if (ev.url) {
                                      window.open(ev.url, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                />
                              ))}

                              <button
                                type="button"
                                onClick={() => onQuickAddEvidence(item)}
                                title="Subir evidencia"
                                className="w-7 h-7 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {validEvs.length === 0 && (
                              <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                                <Clock className="w-2.5 h-2.5" /> Sin evidencias
                              </span>
                            )}
                          </td>

                          {/* Col 5: Actions */}
                          <td className="py-3 px-3.5 text-right align-top">
                            <button
                              type="button"
                              onClick={() => onOpenEvidenceModal(item)}
                              className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer inline-flex items-center gap-1 text-xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Detalle</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARDS GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <AuditItemCard
                  key={item.id}
                  item={item}
                  onOpenEvidenceModal={onOpenEvidenceModal}
                  onQuickAddEvidence={onQuickAddEvidence}
                  onUpdateStatus={onUpdateStatus}
                  onQuickPreviewEvidence={onPreviewEvidence}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            title="No se encontraron criterios"
            description="No hay requisitos de auditoría que coincidan con la búsqueda o filtros aplicados."
            actionText="Restablecer Filtros"
            onAction={onResetFilters}
          />
        )}
      </div>

      {/* FOOTER STATS SUMMARY */}
      <footer className="h-9 bg-white border-t border-slate-200 flex items-center justify-between px-4 text-[11px] text-slate-500 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Mostrando {filteredItems.length} de {items.length} criterios</span>
          {hasActiveFilters && <span className="text-blue-600 font-medium">· Filtros activos</span>}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400">Sistema ISO 9001 · Audit SOL</span>
        </div>
      </footer>
    </div>
  );
};
