import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DocumentImporter } from './components/DocumentImporter';
import { ReaderCanvas } from './components/ReaderCanvas';
import { ReaderControls } from './components/ReaderControls';
import { HighlightsSidebar } from './components/HighlightsSidebar';
import { FloatingExtensionWidget } from './components/FloatingExtensionWidget';
import {
  DocumentItem,
  HighlightNote,
  ReaderSettings,
  ThemeMode,
} from './types';
import {
  loadDocuments,
  saveDocuments,
  loadHighlights,
  saveHighlights,
  loadSettings,
  saveSettings,
  getActiveDocId,
  setActiveDocId,
} from './lib/storage';
import { TTSPlayer, getAvailableVoices, TTSVoiceOption } from './lib/tts';
import { Sparkles, Globe, Volume2, Highlighter, BookOpen, Layers, Puzzle } from 'lucide-react';

export default function App() {
  // Application State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);
  const [highlights, setHighlights] = useState<HighlightNote[]>([]);
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings());
  const [sideBySide, setSideBySide] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'ask' | 'auto_speak' | 'auto_translate_speak'>('ask');

  // UI Drawer / Modal States
  const [importerOpen, setImporterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTranslatingDoc, setIsTranslatingDoc] = useState(false);

  // Audio Player State
  const ttsPlayerRef = useRef<TTSPlayer>(new TTSPlayer());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [totalSentences, setTotalSentences] = useState(0);
  const [voices, setVoices] = useState<TTSVoiceOption[]>([]);

  // Initialize Data
  useEffect(() => {
    const loadedDocs = loadDocuments();
    setDocuments(loadedDocs);

    const activeId = getActiveDocId();
    const doc = loadedDocs.find((d) => d.id === activeId) || loadedDocs[0];
    setActiveDoc(doc);

    setHighlights(loadHighlights());

    // Load voices
    getAvailableVoices().then((vList) => {
      setVoices(vList);
    });
  }, []);

  // Update Theme Class on Body
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia', 'oled');
    if (settings.theme === 'dark' || settings.theme === 'oled') {
      root.classList.add('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Sync TTS Engine with Current Document
  useEffect(() => {
    if (!activeDoc) return;

    const player = ttsPlayerRef.current;
    player.stop();

    player.onSentenceChange = (idx) => {
      setActiveSentenceIndex(idx);
    };

    player.onStateChange = (playing, paused) => {
      setIsPlaying(playing);
      setIsPaused(paused);
    };

    player.onEnd = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    player.setSentences(activeDoc.originalText, activeDoc.language);
    player.setSpeed(settings.readingSpeed);
    if (settings.selectedVoiceURI) {
      player.setVoiceURI(settings.selectedVoiceURI);
    }

    setTotalSentences(player.getTotalSentences());
    setActiveSentenceIndex(0);
  }, [activeDoc]);

  // Update Settings in Player
  const handleUpdateSettings = (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);

    const player = ttsPlayerRef.current;
    if (newSettings.readingSpeed !== undefined) {
      player.setSpeed(newSettings.readingSpeed);
    }
    if (newSettings.selectedVoiceURI !== undefined) {
      player.setVoiceURI(newSettings.selectedVoiceURI);
    }
  };

  // Switch Active Document
  const handleSelectDoc = (doc: DocumentItem) => {
    setActiveDoc(doc);
    setActiveDocId(doc.id);
  };

  // Add New Document
  const handleAddDocument = (newDoc: DocumentItem) => {
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);
    setActiveDoc(newDoc);
    setActiveDocId(newDoc.id);
  };

  // Add Highlight
  const handleAddHighlight = (newHl: HighlightNote) => {
    const updated = [newHl, ...highlights];
    setHighlights(updated);
    saveHighlights(updated);
  };

  // Delete Highlight
  const handleDeleteHighlight = (id: string) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    saveHighlights(updated);
  };

  // Full Document Translation Action
  const handleTranslateFullDoc = async () => {
    if (!activeDoc) return;

    if (activeDoc.spanishTranslation) {
      // Toggle side-by-side view
      setSideBySide(!sideBySide);
      return;
    }

    setIsTranslatingDoc(true);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeDoc.originalText,
          targetLang: 'Spanish',
        }),
      });
      const data = await res.json();

      if (data.success && data.translatedText) {
        const updatedDoc: DocumentItem = {
          ...activeDoc,
          spanishTranslation: data.translatedText,
        };

        const updatedDocs = documents.map((d) => (d.id === activeDoc.id ? updatedDoc : d));
        setDocuments(updatedDocs);
        saveDocuments(updatedDocs);
        setActiveDoc(updatedDoc);
        setSideBySide(true);
      }
    } catch (e) {
      console.error('Error translating full document:', e);
    } finally {
      setIsTranslatingDoc(false);
    }
  };

  if (!activeDoc) return null;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        settings.theme === 'sepia'
          ? 'bg-[#f4ecd8] text-[#2d251e]'
          : settings.theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : settings.theme === 'oled'
          ? 'bg-black text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Header Bar */}
      <Header
        documents={documents}
        activeDoc={activeDoc}
        onSelectDoc={handleSelectDoc}
        onOpenImporter={() => setImporterOpen(true)}
        onToggleSidebar={() => setSidebarOpen(true)}
        notesCount={highlights.length}
        theme={settings.theme}
        onChangeTheme={(theme: ThemeMode) => handleUpdateSettings({ theme })}
        onTranslateDoc={handleTranslateFullDoc}
        isTranslating={isTranslatingDoc}
        sideBySide={sideBySide}
        onToggleSideBySide={() => setSideBySide(!sideBySide)}
      />

      {/* Main Reader Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-36">
        {/* Onboarding Guide Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Puzzle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Herramienta Asistente de Lectura y Traducción en Vivo</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Instalada y Activa
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                👉 <strong>Selecciona cualquier texto</strong> en la página para <strong>escucharlo</strong> o <strong>traducirlo al español en voz alta</strong> al instante.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
            <button
              onClick={() => setImporterOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md flex items-center gap-1.5 font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              Pegar Nuevo Texto / URL
            </button>
          </div>
        </div>

        {/* Reader Document Surface */}
        <ReaderCanvas
          doc={activeDoc}
          settings={settings}
          activeSentenceIndex={activeSentenceIndex}
          isPlaying={isPlaying}
          onSentenceClick={(idx) => ttsPlayerRef.current.seekSentence(idx)}
          highlights={highlights}
          onAddHighlight={handleAddHighlight}
          onDeleteHighlight={handleDeleteHighlight}
          sideBySide={sideBySide}
          selectionMode={selectionMode}
        />
      </main>

      {/* Floating Extension Widget Tool */}
      <FloatingExtensionWidget
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        voices={voices}
        isPlaying={isPlaying}
        isPaused={isPaused}
        onPlay={() => ttsPlayerRef.current.play()}
        onPause={() => ttsPlayerRef.current.pause()}
        onStop={() => ttsPlayerRef.current.stop()}
        selectionMode={selectionMode}
        onChangeSelectionMode={setSelectionMode}
      />

      {/* Audio Controls Bar */}
      <ReaderControls
        isPlaying={isPlaying}
        isPaused={isPaused}
        activeSentenceIndex={activeSentenceIndex}
        totalSentences={totalSentences}
        onPlay={() => ttsPlayerRef.current.play()}
        onPause={() => ttsPlayerRef.current.pause()}
        onStop={() => ttsPlayerRef.current.stop()}
        onPrevSentence={() => ttsPlayerRef.current.seekSentence(activeSentenceIndex - 1)}
        onNextSentence={() => ttsPlayerRef.current.seekSentence(activeSentenceIndex + 1)}
        onSeekSentence={(idx) => ttsPlayerRef.current.seekSentence(idx)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        voices={voices}
      />

      {/* Document Importer Modal */}
      <DocumentImporter
        isOpen={importerOpen}
        onClose={() => setImporterOpen(false)}
        onAddDocument={handleAddDocument}
      />

      {/* Saved Highlights & Notes Drawer */}
      <HighlightsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        highlights={highlights}
        documents={documents}
        activeDocId={activeDoc.id}
        onDeleteHighlight={handleDeleteHighlight}
      />
    </div>
  );
}
