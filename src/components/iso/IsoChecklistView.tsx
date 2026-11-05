import React, { useState, useMemo } from 'react';
import { 
  AuditItem, 
  ComplianceStatus, 
  EvidenceType, 
  EvidenceLink,
  OriginType 
} from '../../types/audit';
import { QuickItemActions, QuickItemActionsProps } from './QuickItemActions';
import { STATUS_CONFIG } from '../common/StatusBadge';
import { OriginBadge } from '../common/OriginBadge';
import { IsoClauseBadge } from '../common/IsoClauseBadge';
import { EmptyState } from '../common/EmptyState';
import { ISO_CLAUSES_LIST, ORIGIN_TYPES_CONFIG } from '../../data/isoNormativeMapping';
import { isMandatoryItem, isMarketExempt, getMarketExemption, MARKET_EXEMPTION_LABELS } from '../../data/auditRules';
import { getLastBrandAuditReference } from '../../data/lastBrandAuditReference';
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
  selectedCodeGroup: string;
  setSelectedCodeGroup: (group: string) => void;
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
  onUpload: QuickItemActionsProps['onUpload'];
  onSaveComment: QuickItemActionsProps['onSaveComment'];
  onRemoveEvidence: QuickItemActionsProps['onRemoveEvidence'];
  readOnly?: boolean;
}

export const IsoChecklistView: React.FC<IsoChecklistViewProps> = ({
  items,
  searchQuery,
  setSearchQuery,
  selectedClause,
  selectedCodeGroup,
  setSelectedCodeGroup,
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
  onUpload,
  onSaveComment,
  onRemoveEvidence,
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
          const inComment = (item.comment || '').toLowerCase().includes(q);
          const inExtra = [item.howToCheck, item.internalNotes].some(text => text?.toLowerCase().includes(q));
          const inFinding = (item.finding || '').toLowerCase().includes(q);
          const inResponsible = (item.responsible || '').toLowerCase().includes(q);
          const inEvidences = (item.evidences || []).some(
            (e) => e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)
          );

          if (!inComment && !inExtra && !inCode && !inReq && !inQuestion && !inDesc && !inVerify && !inShow && !inAudit && !inFinding && !inResponsible && !inEvidences) {
            return false;
          }
        }

        // Match the complete first code segment (1 includes 1.2.3, never 10.2.3).
        if (selectedCodeGroup !== 'all' && item.code.trim().split('.')[0] !== selectedCodeGroup) {
          return false;
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
    selectedCodeGroup,
    selectedOrigin,
    selectedStatus,
    selectedCoverage,
    selectedArea,
    sortBy,
  ]);

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedClause !== 'all' || 
    selectedCodeGroup !== 'all' ||
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
            <select
              aria-label="Filtrar por grupo de código"
              value={selectedCodeGroup}
              onChange={(e) => setSelectedCodeGroup(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer text-xs focus:border-blue-500 outline-none max-w-[230px]"
            >
              <option value="all">Código: Todos</option>
              <option value="1">1 · Gestión y control de documentos</option>
              <option value="2">2 · Área e instalaciones</option>
              <option value="3">3 · Posventa</option>
              <option value="4">4 · Procesos de venta</option>
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
              aria-expanded={isSecondaryFilterOpen}
              aria-label="Más filtros"
              onClick={() => setIsSecondaryFilterOpen(!isSecondaryFilterOpen)}
              className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSecondaryFilterOpen || selectedClause !== 'all' || selectedOrigin !== 'all' || selectedCoverage !== 'all' || selectedArea !== 'all' || sortBy !== 'row'
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
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs animate-in fade-in duration-150">
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
                      <th className="py-3 px-3.5 min-w-[320px]">Requisito</th>
                      <th className="py-3 px-3.5 w-32">Estado</th>
                      <th className="py-3 px-3.5 min-w-[260px]">Evidencias y comentarios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredItems.map((item) => {
                      const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pendiente;
                      const isMandatory = isMandatoryItem(item);
                      const isExempt = isMarketExempt(item);
                      const exemptionType = getMarketExemption(item);
                      const brandRef = getLastBrandAuditReference(item);

                      const rowBg = isMandatory
                        ? 'bg-amber-50/50 hover:bg-amber-100/60 border-l-4 border-l-amber-500'
                        : isExempt
                        ? 'bg-purple-50/45 hover:bg-purple-100/60 border-l-4 border-l-purple-500'
                        : 'hover:bg-blue-50/30';

                      return (
                        <tr
                          key={item.id}
                          className={`${rowBg} transition-colors group`}
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

                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              {isMandatory && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 border border-amber-600 shadow-2xs">
                                  ★ MH · Mandatorio
                                </span>
                              )}
                              {isExempt && exemptionType && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
                                  {MARKET_EXEMPTION_LABELS[exemptionType].short}
                                </span>
                              )}
                            </div>

                            <div className={`text-xs leading-snug ${isMandatory ? 'font-black text-slate-950 text-[13px]' : 'font-bold text-slate-900'}`}>
                              {item.requirement}
                            </div>

                            {brandRef && brandRef.note && (
                              <div className="mt-1.5 p-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-[10px] text-slate-700">
                                <span className="font-bold text-slate-900">Auditoría Salta (Ref):</span> {brandRef.note}
                              </div>
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

                          <td className="py-3 px-3.5 align-top">
                            <QuickItemActions item={item} readOnly={readOnly} onUpload={onUpload} onSaveComment={onSaveComment} onRemoveEvidence={onRemoveEvidence} onPreviewEvidence={onPreviewEvidence} onManage={onOpenEvidenceModal} />
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
              {filteredItems.map((item) => {
                const isMandatory = isMandatoryItem(item);
                const isExempt = isMarketExempt(item);
                const exemptionType = getMarketExemption(item);
                const brandRef = getLastBrandAuditReference(item);

                const cardBorder = isMandatory
                  ? 'border-2 border-amber-500 bg-amber-50/20 shadow-xs'
                  : isExempt
                  ? 'border-2 border-purple-400 bg-purple-50/30'
                  : 'border border-slate-200 bg-white';

                return (
                <article key={item.id} className={`rounded-xl ${cardBorder} p-4 space-y-3 min-w-0`}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isMandatory && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 border border-amber-600">
                        ★ MH · Mandatorio
                      </span>
                    )}
                    {isExempt && exemptionType && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
                        {MARKET_EXEMPTION_LABELS[exemptionType].short}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600">{item.code}</span>
                    <select aria-label={`Estado de ${item.code}`} value={item.status} disabled={readOnly} onChange={e => onUpdateStatus(item.id, e.target.value as ComplianceStatus)} className="border border-slate-200 rounded-lg p-2 text-xs">
                      <option value="pendiente">Pendiente</option><option value="cumplida">Cumple</option><option value="en_progreso">En proceso</option><option value="no_cumplida">No cumple</option><option value="no_aplica">No aplica</option>
                    </select>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{item.requirement}</h3>
                  {item.finding && <p className="text-xs text-rose-700 whitespace-pre-wrap">Hallazgo: {item.finding}</p>}
                  {brandRef && brandRef.note && (
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-700">
                      <span className="font-bold text-slate-900">Auditoría Salta:</span> {brandRef.note}
                    </div>
                  )}
                  <QuickItemActions item={item} readOnly={readOnly} onUpload={onUpload} onSaveComment={onSaveComment} onRemoveEvidence={onRemoveEvidence} onPreviewEvidence={onPreviewEvidence} onManage={onOpenEvidenceModal} />
                </article>
                );
              })}
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

