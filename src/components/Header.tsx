import React from 'react';
import {
  BookOpen,
  PlusCircle,
  Highlighter,
  Sparkles,
  Volume2,
  Globe,
  Sun,
  Moon,
  Coffee,
  Check,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { DocumentItem, ThemeMode } from '../types';

interface HeaderProps {
  documents: DocumentItem[];
  activeDoc: DocumentItem;
  onSelectDoc: (doc: DocumentItem) => void;
  onOpenImporter: () => void;
  onToggleSidebar: () => void;
  notesCount: number;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  onTranslateDoc: () => void;
  isTranslating: boolean;
  sideBySide: boolean;
  onToggleSideBySide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  documents,
  activeDoc,
  onSelectDoc,
  onOpenImporter,
  onToggleSidebar,
  notesCount,
  theme,
  onChangeTheme,
  onTranslateDoc,
  isTranslating,
  sideBySide,
  onToggleSideBySide,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
      case 'oled':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'sepia':
        return <Coffee className="w-4 h-4 text-amber-700" />;
      default:
        return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Active Document Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg tracking-tight shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline-block">LectorInteligente</span>
          </div>

          <span className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />

          {/* Document Selector Dropdown */}
          <div className="relative min-w-0">
            <button
              id="doc-selector-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-750 transition-all max-w-[200px] sm:max-w-xs truncate"
            >
              <span className="truncate">{activeDoc.title}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-mono uppercase shrink-0">
                {activeDoc.language || 'es'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 mt-1 w-80 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Documentos y Textos ({documents.length})
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => onSelectDoc(doc)}
                      className={`w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors ${
                        doc.id === activeDoc.id
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {doc.id === activeDoc.id ? (
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm truncate font-medium">{doc.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{doc.wordCount} palabras</span>
                          <span>•</span>
                          <span className="uppercase">{doc.language}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-1.5 border-t border-slate-100 dark:border-slate-700">
                  <button
                    id="new-doc-dropdown-btn"
                    onClick={onOpenImporter}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Cargar Nuevo Texto / Web
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Import Button */}
          <button
            id="open-importer-btn"
            onClick={onOpenImporter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all active:scale-95"
            title="Añadir texto, PDF, URL o Imagen"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">Cargar Texto/Web</span>
          </button>

          {/* Side-by-Side Dual Translation Toggle */}
          <button
            id="toggle-side-by-side-btn"
            onClick={onToggleSideBySide}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              sideBySide
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/60 dark:border-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Ver original y traducción lado a lado"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden lg:inline">Vista Doble</span>
          </button>

          {/* Quick Translate Button */}
          <button
            id="translate-doc-btn"
            onClick={onTranslateDoc}
            disabled={isTranslating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              activeDoc.spanishTranslation
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Traducir documento completo al español con IA"
          >
            <Globe className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isTranslating
                ? 'Traduciendo...'
                : activeDoc.spanishTranslation
                ? 'Ver Traducción'
                : 'Traducir al Español'}
            </span>
          </button>

          {/* Notes Drawer Button */}
          <button
            id="open-notes-sidebar-btn"
            onClick={onToggleSidebar}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Ver fragmentos y notas destacadas"
          >
            <Highlighter className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Notas</span>
            {notesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-500 text-white">
                {notesCount}
              </span>
            )}
          </button>

          {/* Theme Selector Toggle */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onChangeTheme('light')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'light' ? 'bg-white shadow-sm text-amber-500' : 'text-slate-400'
              }`}
              title="Tema Claro"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeTheme('sepia')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'sepia' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-slate-400'
              }`}
              title="Tema Sepia Rejilla Cálida"
            >
              <Coffee className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeTheme('dark')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'dark' || theme === 'oled'
                  ? 'bg-slate-700 text-indigo-400 shadow-sm'
                  : 'text-slate-400'
              }`}
              title="Tema Oscuro Noche"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
