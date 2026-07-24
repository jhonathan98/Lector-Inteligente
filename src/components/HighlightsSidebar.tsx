import React, { useState } from 'react';
import {
  Highlighter,
  X,
  Search,
  Download,
  Copy,
  Check,
  Trash2,
  Tag,
  Sparkles,
  BookOpen,
  Globe,
  FileText,
  Share2,
} from 'lucide-react';
import { HighlightColor, HighlightNote, DocumentItem } from '../types';

interface HighlightsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: HighlightNote[];
  documents: DocumentItem[];
  activeDocId: string;
  onDeleteHighlight: (id: string) => void;
}

const COLOR_MAP: Record<HighlightColor, { bg: string; text: string; name: string }> = {
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-950/60', text: 'text-yellow-800 dark:text-yellow-200', name: 'Amarillo' },
  green: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-200', name: 'Verde' },
  blue: { bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-800 dark:text-sky-200', name: 'Azul' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-200', name: 'Púrpura' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-200', name: 'Rosa' },
};

export const HighlightsSidebar: React.FC<HighlightsSidebarProps> = ({
  isOpen,
  onClose,
  highlights,
  documents,
  activeDocId,
  onDeleteHighlight,
}) => {
  const [filterDoc, setFilterDoc] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredHighlights = highlights.filter((h) => {
    if (filterDoc === 'active' && h.documentId !== activeDocId) return false;
    if (filterDoc !== 'active' && filterDoc !== 'all' && h.documentId !== filterDoc) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = h.text.toLowerCase().includes(q);
      const matchNote = h.noteText?.toLowerCase().includes(q);
      const matchAi = h.aiExplanation?.toLowerCase().includes(q);
      const matchTag = h.tags?.some((t) => t.toLowerCase().includes(q));
      return matchText || matchNote || matchAi || matchTag;
    }

    return true;
  });

  // Export as Markdown
  const handleExportMarkdown = () => {
    let md = `# Fragmentos Destacados y Notas de Lectura\n\n`;
    md += `*Fecha de exportación: ${new Date().toLocaleDateString()}*\n\n`;

    filteredHighlights.forEach((h, idx) => {
      const doc = documents.find((d) => d.id === h.documentId);
      md += `### ${idx + 1}. "${h.text}"\n`;
      if (doc) md += `**Fuente:** ${doc.title}\n`;
      if (h.noteText) md += `**Nota personal:** ${h.noteText}\n`;
      if (h.translationText) md += `**Traducción:** ${h.translationText}\n`;
      if (h.aiExplanation) md += `**Explicación IA:** ${h.aiExplanation}\n`;
      if (h.keyTakeaways && h.keyTakeaways.length > 0) {
        md += `**Puntos Clave:**\n`;
        h.keyTakeaways.forEach((k) => (md += `- ${k}\n`));
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas_destacadas_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy all notes to clipboard
  const handleCopyAll = () => {
    const text = filteredHighlights
      .map((h, i) => {
        let snippet = `${i + 1}. "${h.text}"`;
        if (h.noteText) snippet += `\nNota: ${h.noteText}`;
        if (h.aiExplanation) snippet += `\nIA: ${h.aiExplanation}`;
        return snippet;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 flex items-center justify-center font-bold">
                <Highlighter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Fragmentos y Notas
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filteredHighlights.length} fragmentos guardados
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
            <div className="flex items-center gap-2">
              <select
                value={filterDoc}
                onChange={(e) => setFilterDoc(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Documento Actual</option>
                <option value="all">Todos los Documentos ({highlights.length})</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en destacadas y notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Highlights List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredHighlights.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <Highlighter className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No hay fragmentos destacados guardados.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Selecciona cualquier texto en la pantalla con el cursor para destacarlo, traducirlo o añadir notas con IA.
                </p>
              </div>
            ) : (
              filteredHighlights.map((hl) => {
                const colorConfig = COLOR_MAP[hl.color] || COLOR_MAP.yellow;
                return (
                  <div
                    key={hl.id}
                    className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 ${colorConfig.bg} space-y-3 transition-all hover:shadow-md`}
                  >
                    {/* Snippet text */}
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${colorConfig.text} italic`}>
                        "{hl.text}"
                      </p>
                      <button
                        onClick={() => onDeleteHighlight(hl.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors shrink-0"
                        title="Eliminar destacado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Personal Note */}
                    {hl.noteText && (
                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                          Nota Personal:
                        </span>
                        {hl.noteText}
                      </div>
                    )}

                    {/* Translation */}
                    {hl.translationText && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Traducción al Español:
                        </span>
                        {hl.translationText}
                      </div>
                    )}

                    {/* AI Explanation */}
                    {hl.aiExplanation && (
                      <div className="p-2.5 rounded-xl bg-purple-50/90 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                        <span className="font-bold text-purple-600 dark:text-purple-400 block flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Explicación IA:
                        </span>
                        <p>{hl.aiExplanation}</p>
                        {hl.keyTakeaways && hl.keyTakeaways.length > 0 && (
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-purple-800 dark:text-purple-300 pt-1">
                            {hl.keyTakeaways.map((take, idx) => (
                              <li key={idx}>{take}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {hl.tags && hl.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {hl.tags.map((tg, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer Actions */}
          {filteredHighlights.length > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-2">
              <button
                onClick={handleCopyAll}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Notas'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Exportar .MD</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
