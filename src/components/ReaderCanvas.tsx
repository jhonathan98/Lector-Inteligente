import React, { useState, useRef, useEffect } from 'react';
import {
  Highlighter,
  FileText,
  Volume2,
  Globe,
  Sparkles,
  Plus,
  X,
  Languages,
  BookOpen,
  Copy,
  Check,
  Tag,
  Type as TypeIcon,
  RotateCcw,
} from 'lucide-react';
import {
  DocumentItem,
  HighlightColor,
  HighlightNote,
  ReaderSettings,
  VocabularyItem,
} from '../types';

interface ReaderCanvasProps {
  doc: DocumentItem;
  settings: ReaderSettings;
  activeSentenceIndex: number;
  isPlaying: boolean;
  onSentenceClick: (index: number) => void;
  highlights: HighlightNote[];
  onAddHighlight: (highlight: HighlightNote) => void;
  onDeleteHighlight: (id: string) => void;
  sideBySide: boolean;
}

const COLOR_CLASSES: Record<HighlightColor, { bg: string; border: string; label: string }> = {
  yellow: {
    bg: 'bg-yellow-200/80 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-100',
    border: 'border-yellow-400',
    label: 'Amarillo',
  },
  green: {
    bg: 'bg-emerald-200/80 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-100',
    border: 'border-emerald-400',
    label: 'Verde',
  },
  blue: {
    bg: 'bg-sky-200/80 dark:bg-sky-500/30 text-sky-900 dark:text-sky-100',
    border: 'border-sky-400',
    label: 'Azul',
  },
  purple: {
    bg: 'bg-purple-200/80 dark:bg-purple-500/30 text-purple-900 dark:text-purple-100',
    border: 'border-purple-400',
    label: 'Púrpura',
  },
  rose: {
    bg: 'bg-rose-200/80 dark:bg-rose-500/30 text-rose-900 dark:text-rose-100',
    border: 'border-rose-400',
    label: 'Rosa',
  },
};

export const ReaderCanvas: React.FC<ReaderCanvasProps> = ({
  doc,
  settings,
  activeSentenceIndex,
  isPlaying,
  onSentenceClick,
  highlights,
  onAddHighlight,
  onDeleteHighlight,
  sideBySide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  // Translation & AI Note State for Selection
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<{
    translatedText: string;
    detectedLanguage: string;
    briefSummary: string;
    keyVocabulary: VocabularyItem[];
  } | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiNoteData, setAiNoteData] = useState<{
    explanation: string;
    keyTakeaways: string[];
    simplifiedExplanation?: string;
    suggestedTags: string[];
    spanishTranslation?: string;
  } | null>(null);

  const [customNote, setCustomNote] = useState('');
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow');
  const [copied, setCopied] = useState(false);

  // Split document text into paragraphs and sentences
  const paragraphs = React.useMemo(() => {
    const rawParagraphs = doc.originalText.split(/\n+/).filter((p) => p.trim().length > 0);
    let globalSentenceCounter = 0;

    return rawParagraphs.map((pText) => {
      // Split into sentences
      const sentenceRegex = /[^.!?\n]+[.!?\n]+/g;
      const sentenceMatches: { text: string; globalIdx: number }[] = [];
      let match;
      let lastIdx = 0;

      while ((match = sentenceRegex.exec(pText)) !== null) {
        sentenceMatches.push({
          text: match[0],
          globalIdx: globalSentenceCounter++,
        });
        lastIdx = sentenceRegex.lastIndex;
      }

      if (lastIdx < pText.length) {
        const rem = pText.slice(lastIdx).trim();
        if (rem) {
          sentenceMatches.push({
            text: rem,
            globalIdx: globalSentenceCounter++,
          });
        }
      }

      if (sentenceMatches.length === 0 && pText.trim()) {
        sentenceMatches.push({
          text: pText,
          globalIdx: globalSentenceCounter++,
        });
      }

      return sentenceMatches;
    });
  }, [doc.originalText]);

  // Handle Text Selection Popup
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!translationResult && !aiNoteData) {
          setPopoverPos(null);
          setSelectedText('');
        }
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 2) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          setSelectedText(text);
          setPopoverPos({
            top: rect.top - containerRect.top - 55,
            left: Math.max(10, Math.min(containerRect.width - 250, rect.left - containerRect.left)),
          });
        }
      }
    };

    window.document.addEventListener('selectionchange', handleSelectionChange);
    return () => window.document.removeEventListener('selectionchange', handleSelectionChange);
  }, [translationResult, aiNoteData]);

  // Translate Selected Snippet
  const handleTranslateSelection = async () => {
    if (!selectedText) return;
    setIsTranslating(true);
    setTranslationResult(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, targetLang: 'Spanish' }),
      });
      const data = await res.json();
      if (data.success) {
        setTranslationResult({
          translatedText: data.translatedText,
          detectedLanguage: data.detectedLanguage,
          briefSummary: data.briefSummary,
          keyVocabulary: data.keyVocabulary || [],
        });
      }
    } catch (e) {
      console.error('Error translating selection:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Generate AI Note & Key Takeaways for Selected Snippet
  const handleGenerateAiNote = async () => {
    if (!selectedText) return;
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          highlightText: selectedText,
          contextText: doc.originalText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiNoteData({
          explanation: data.explanation,
          keyTakeaways: data.keyTakeaways || [],
          simplifiedExplanation: data.simplifiedExplanation,
          suggestedTags: data.suggestedTags || [],
          spanishTranslation: data.spanishTranslation,
        });
      }
    } catch (e) {
      console.error('Error generating AI note:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick Speak Selected Snippet
  const handleSpeakSelection = () => {
    if (!selectedText) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(selectedText);
      u.lang = doc.language === 'en' ? 'en-US' : 'es-ES';
      window.speechSynthesis.speak(u);
    }
  };

  // Save Highlight & Note
  const handleSaveHighlight = (color: HighlightColor) => {
    if (!selectedText) return;

    const newHighlight: HighlightNote = {
      id: `hl-${Date.now()}`,
      documentId: doc.id,
      text: selectedText,
      color,
      noteText: customNote || undefined,
      translationText: translationResult?.translatedText || aiNoteData?.spanishTranslation || undefined,
      aiExplanation: aiNoteData?.explanation || undefined,
      keyTakeaways: aiNoteData?.keyTakeaways || undefined,
      tags: aiNoteData?.suggestedTags || ['Lector'],
      createdAt: new Date().toISOString(),
    };

    onAddHighlight(newHighlight);

    // Reset popover
    setSelectedText('');
    setPopoverPos(null);
    setTranslationResult(null);
    setAiNoteData(null);
    setCustomNote('');
  };

  // Apply typography classes
  const getFontClass = () => {
    switch (settings.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'dyslexic':
        return 'font-sans tracking-wide leading-relaxed';
      default:
        return 'font-sans';
    }
  };

  const getThemeContainerStyle = () => {
    switch (settings.theme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#2d251e] border-[#e6d8bc]';
      case 'dark':
        return 'bg-slate-900 text-slate-100 border-slate-800';
      case 'oled':
        return 'bg-black text-slate-200 border-neutral-900';
      default:
        return 'bg-white text-slate-900 border-slate-200';
    }
  };

  return (
    <div className={`relative min-h-[600px] p-6 sm:p-10 rounded-2xl border transition-colors ${getThemeContainerStyle()}`}>
      <div ref={containerRef} className="relative max-w-4xl mx-auto">
        {/* Document Metadata Header */}
        <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {doc.sourceType === 'url' ? 'Página Web' : doc.sourceType === 'ocr' ? 'OCR Imagen' : 'Documento'}
            </span>
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-3">
              <span>{doc.wordCount} palabras</span>
              <span>•</span>
              <span>~{doc.readingTimeMinutes} min de lectura</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {doc.title}
          </h1>

          {doc.sourceUrl && (
            <a
              href={doc.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-500 hover:underline inline-flex items-center gap-1 mt-2"
            >
              Ver fuente web original ↗
            </a>
          )}
        </div>

        {/* Dual Mode vs Single Mode Layout */}
        <div className={sideBySide ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''}>
          {/* Column 1: Original Interactive Screen Text */}
          <div className="space-y-6" style={{ fontSize: `${settings.fontSizePx}px`, lineHeight: settings.lineHeight }}>
            {sideBySide && (
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Texto Original ({doc.language.toUpperCase()})
              </div>
            )}

            {paragraphs.map((sentenceList, pIdx) => (
              <p key={`p-${pIdx}`} className={`${getFontClass()} space-x-1`}>
                {sentenceList.map((sentence) => {
                  const isActive = isPlaying && sentence.globalIdx === activeSentenceIndex;
                  const matchingHighlight = highlights.find((h) => h.documentId === doc.id && h.text.includes(sentence.text.trim()));

                  let sentenceStyle = 'cursor-pointer transition-colors rounded px-0.5 py-0.5 inline ';
                  if (isActive) {
                    sentenceStyle += 'bg-indigo-500 text-white font-medium ring-2 ring-indigo-400 shadow-sm ';
                  } else if (matchingHighlight) {
                    sentenceStyle += COLOR_CLASSES[matchingHighlight.color].bg + ' ';
                  } else {
                    sentenceStyle += 'hover:bg-indigo-100/60 dark:hover:bg-slate-800/80 ';
                  }

                  return (
                    <span
                      key={`s-${sentence.globalIdx}`}
                      onClick={() => onSentenceClick(sentence.globalIdx)}
                      className={sentenceStyle}
                      title="Haz clic para escuchar desde esta oración"
                    >
                      {sentence.text}{' '}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>

          {/* Column 2: Side-by-Side Spanish Translation */}
          {sideBySide && (
            <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-8 pt-6 lg:pt-0" style={{ fontSize: `${settings.fontSizePx}px`, lineHeight: settings.lineHeight }}>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-500" />
                Traducción al Español (IA)
              </div>

              {doc.spanishTranslation ? (
                <div className={`${getFontClass()} whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300`}>
                  {doc.spanishTranslation}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-slate-850 border border-indigo-100 dark:border-slate-800 text-center space-y-3">
                  <Globe className="w-8 h-8 mx-auto text-indigo-500" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Aún no se ha generado la traducción completa al español para este texto.
                  </p>
                  <button
                    onClick={() => {
                      const btn = window.document.getElementById('translate-doc-btn');
                      btn?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
                  >
                    Traducir Todo el Documento Ahora
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FLOATING SELECTION CONTEXTUAL TOOLBAR */}
        {popoverPos && selectedText && (
          <div
            style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
            className="absolute z-40 bg-slate-900/95 text-white dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-slate-700/80 w-80 sm:w-96 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header / Text Snippet Title */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80">
              <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
                "{selectedText}"
              </span>
              <button
                onClick={() => {
                  setPopoverPos(null);
                  setSelectedText('');
                  setTranslationResult(null);
                  setAiNoteData(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center justify-between gap-1 mb-3">
              <button
                onClick={handleTranslateSelection}
                disabled={isTranslating}
                className="flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-xs font-medium transition-colors"
                title="Traducir fragmento al español"
              >
                <Globe className={`w-4 h-4 mb-1 ${isTranslating ? 'animate-spin' : ''}`} />
                <span>Traducir</span>
              </button>

              <button
                onClick={handleGenerateAiNote}
                disabled={isAiLoading}
                className="flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-xs font-medium transition-colors"
                title="Explicar y generar nota inteligente con IA"
              >
                <Sparkles className={`w-4 h-4 mb-1 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>Nota IA</span>
              </button>

              <button
                onClick={handleSpeakSelection}
                className="flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-colors"
                title="Escuchar fragmento"
              >
                <Volume2 className="w-4 h-4 mb-1 text-amber-400" />
                <span>Escuchar</span>
              </button>
            </div>

            {/* Translation Result Card */}
            {translationResult && (
              <div className="mb-3 p-3 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-xs text-indigo-100 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-indigo-300">
                  <span>Traducción ({translationResult.detectedLanguage}):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(translationResult.translatedText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-indigo-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="leading-relaxed font-medium">{translationResult.translatedText}</p>
                {translationResult.keyVocabulary.length > 0 && (
                  <div className="pt-1 border-t border-indigo-800/50 text-[11px] text-indigo-200">
                    <span className="font-semibold text-amber-300">Vocabulario clave:</span>{' '}
                    {translationResult.keyVocabulary.map((v) => `${v.word} (${v.translation})`).join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* AI Note Explanation Card */}
            {aiNoteData && (
              <div className="mb-3 p-3 rounded-xl bg-purple-950/80 border border-purple-800/80 text-xs text-purple-100 space-y-2 animate-in fade-in">
                <div className="font-bold text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Explicación IA:
                </div>
                <p className="leading-relaxed">{aiNoteData.explanation}</p>
                {aiNoteData.keyTakeaways.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-purple-200 text-[11px]">
                    {aiNoteData.keyTakeaways.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Custom Note Input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Añadir una nota o comentario personal..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Highlight Color Pickers & Save */}
            <div className="flex items-center justify-between border-t border-slate-700/80 pt-2">
              <div className="flex items-center gap-1.5">
                {(['yellow', 'green', 'blue', 'purple', 'rose'] as HighlightColor[]).map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      setActiveColor(col);
                      handleSaveHighlight(col);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      col === 'yellow'
                        ? 'bg-yellow-400 border-yellow-200'
                        : col === 'green'
                        ? 'bg-emerald-400 border-emerald-200'
                        : col === 'blue'
                        ? 'bg-sky-400 border-sky-200'
                        : col === 'purple'
                        ? 'bg-purple-400 border-purple-200'
                        : 'bg-rose-400 border-rose-200'
                    }`}
                    title={`Guardar y destacar en ${COLOR_CLASSES[col].label}`}
                  />
                ))}
              </div>

              <button
                onClick={() => handleSaveHighlight(activeColor)}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Highlighter className="w-3.5 h-3.5" />
                Guardar Destacado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
