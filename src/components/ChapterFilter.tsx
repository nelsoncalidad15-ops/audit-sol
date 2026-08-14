import React from 'react';
import { AuditItem } from '../types/audit';
import { BookOpen, Building2, Wrench, ShoppingBag, LayoutGrid } from 'lucide-react';

interface ChapterFilterProps {
  items: AuditItem[];
  selectedChapter: string;
  onSelectChapter: (chapter: string) => void;
}

const CHAPTER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '1. Gestión y control de documentos': BookOpen,
  '2. Área e instalaciones': Building2,
  '3. Posventa': Wrench,
  '4. Procesos de venta': ShoppingBag,
};

export const ChapterFilter: React.FC<ChapterFilterProps> = ({
  items,
  selectedChapter,
  onSelectChapter,
}) => {
  // Extract unique chapters with stats
  const chapters: string[] = Array.from(new Set(items.map((i) => i.chapter))).filter(
    (ch): ch is string => Boolean(ch)
  );

  const getChapterStats = (chapterName: string) => {
    const chapterItems = items.filter((i) => i.chapter === chapterName);
    const withEvidence = chapterItems.filter((i) => (i.evidences || []).length > 0).length;
    return {
      total: chapterItems.length,
      withEvidence,
      percent: chapterItems.length > 0 ? Math.round((withEvidence / chapterItems.length) * 100) : 0,
    };
  };

  const totalWithEvidence = items.filter((i) => (i.evidences || []).length > 0).length;

  return (
    <div className="bg-slate-50 border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
        {/* All Chapters button */}
        <button
          type="button"
          onClick={() => onSelectChapter('all')}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedChapter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Todos los Capítulos</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              selectedChapter === 'all' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {items.length} ({totalWithEvidence} con evid.)
          </span>
        </button>

        {/* Individual Chapter buttons */}
        {chapters.map((chap) => {
          const stats = getChapterStats(chap);
          const Icon = CHAPTER_ICONS[chap] || BookOpen;
          const isSelected = selectedChapter === chap;

          return (
            <button
              key={chap}
              type="button"
              onClick={() => onSelectChapter(chap)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-300' : 'text-slate-500'}`} />
              <span className="truncate max-w-[200px]">{chap}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {stats.withEvidence}/{stats.total} ({stats.percent}%)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
