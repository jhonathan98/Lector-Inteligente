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
  Lock,
  RotateCw,
  Bookmark,
  Share2,
  Puzzle,
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

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-900 text-white border-b border-slate-800 transition-colors shadow-md">
      {/* Top Window Dots & Tab Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {/* Mac-style Window Controls */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block opacity-80 hover:opacity-100" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block opacity-80 hover:opacity-100" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block opacity-80 hover:opacity-100" />
          </div>

          <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
            Navegador Web + Herramienta Lector/Traductor
          </span>
        </div>

        {/* Extension Active Badge */}
        <div className="flex items-center gap-2 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-700/60 text-indigo-300 font-medium text-[11px]">
          <Puzzle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Extensión Asistente: Selecciona cualquier texto para Escuchar o Traducir</span>
        </div>
      </div>

      {/* Main Address Bar & Action Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        {/* Navigation & Address Bar */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => window.location.reload()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Recargar página"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Browser Address Bar Input Simulator */}
          <div className="flex-1 max-w-xl flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono text-slate-400 text-[11px] shrink-0">https://</span>
            <span className="truncate font-medium text-slate-200">
              {activeDoc.sourceUrl || `read.app/${activeDoc.title.toLowerCase().replace(/\s+/g, '-')}`}
            </span>
            <span className="ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-300 shrink-0">
              {activeDoc.language || 'en'}
            </span>
          </div>

          {/* Document Selector Dropdown */}
          <div className="relative shrink-0">
            <button
              id="doc-selector-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-750 transition-all max-w-[180px] sm:max-w-xs truncate"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{activeDoc.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 mt-1 w-80 rounded-xl bg-slate-850 shadow-2xl border border-slate-700 py-1.5 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Páginas y Textos ({documents.length})
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => onSelectDoc(doc)}
                      className={`w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-slate-750 transition-colors ${
                        doc.id === activeDoc.id
                          ? 'bg-indigo-950/60 text-indigo-300 font-medium'
                          : 'text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {doc.id === activeDoc.id ? (
                          <Check className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs truncate font-semibold">{doc.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{doc.wordCount} palabras</span>
                          <span>•</span>
                          <span className="uppercase">{doc.language}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-1.5 border-t border-slate-800">
                  <button
                    id="new-doc-dropdown-btn"
                    onClick={onOpenImporter}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Cargar Nueva Página / Pegar Texto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Import Button */}
          <button
            id="open-importer-btn"
            onClick={onOpenImporter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            title="Añadir texto o sitio web para probar"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">Cargar Web/Texto</span>
          </button>

          {/* Dual View Toggle */}
          <button
            id="toggle-side-by-side-btn"
            onClick={onToggleSideBySide}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              sideBySide
                ? 'bg-indigo-900/80 border-indigo-600 text-indigo-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
            title="Ver original y traducción lado a lado"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Vista Lado a Lado</span>
          </button>

          {/* Quick Translate Button */}
          <button
            id="translate-doc-btn"
            onClick={onTranslateDoc}
            disabled={isTranslating}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeDoc.spanishTranslation
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
            title="Traducir documento completo al español con IA"
          >
            <Globe className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isTranslating
                ? 'Traduciendo...'
                : activeDoc.spanishTranslation
                ? 'Traducción Lista'
                : 'Traducir Página'}
            </span>
          </button>

          {/* Notes Drawer Button */}
          <button
            id="open-notes-sidebar-btn"
            onClick={onToggleSidebar}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-750 transition-colors"
            title="Ver notas y textos guardados"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guardados</span>
            {notesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-900">
                {notesCount}
              </span>
            )}
          </button>

          {/* Theme Selector Toggle */}
          <div className="flex items-center rounded-xl bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => onChangeTheme('light')}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'light' ? 'bg-slate-700 text-amber-400 shadow-sm' : 'text-slate-400'
              }`}
              title="Tema Claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTheme('sepia')}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'sepia' ? 'bg-amber-900/60 text-amber-300 shadow-sm' : 'text-slate-400'
              }`}
              title="Tema Sepia"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTheme('dark')}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark' || theme === 'oled'
                  ? 'bg-slate-700 text-indigo-400 shadow-sm'
                  : 'text-slate-400'
              }`}
              title="Tema Oscuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

