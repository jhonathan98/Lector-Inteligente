import React, { useState } from 'react';
import {
  Volume2,
  Globe,
  Sparkles,
  Play,
  Pause,
  Square,
  ChevronUp,
  ChevronDown,
  X,
  Sliders,
  Type,
  Check,
  Copy,
  Zap,
  MousePointer,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { ReaderSettings } from '../types';
import { TTSVoiceOption } from '../lib/tts';

interface FloatingExtensionWidgetProps {
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  voices: TTSVoiceOption[];
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  selectionMode: 'ask' | 'auto_speak' | 'auto_translate_speak';
  onChangeSelectionMode: (mode: 'ask' | 'auto_speak' | 'auto_translate_speak') => void;
  lastSpokenText?: string;
  lastTranslationText?: string;
}

export const FloatingExtensionWidget: React.FC<FloatingExtensionWidgetProps> = ({
  settings,
  onUpdateSettings,
  voices,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onStop,
  selectionMode,
  onChangeSelectionMode,
  lastSpokenText,
  lastTranslationText,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [testText, setTestText] = useState('');
  const [testTranslation, setTestTranslation] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quick test speak or translate function
  const handleTestSpeak = (translate: boolean) => {
    const textToUse = testText.trim() || 'Select any text on this page to listen or translate to Spanish instantly.';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      if (translate) {
        setIsTesting(true);
        // Simple client fallback translation for testing
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToUse, targetLang: 'Spanish' }),
        })
          .then((r) => r.json())
          .then((data) => {
            const tr = data.translatedText || textToUse;
            setTestTranslation(tr);
            const u = new SpeechSynthesisUtterance(tr);
            u.lang = 'es-ES';
            u.rate = settings.readingSpeed;
            window.speechSynthesis.speak(u);
          })
          .catch(() => {
            const u = new SpeechSynthesisUtterance(textToUse);
            u.lang = 'es-ES';
            window.speechSynthesis.speak(u);
          })
          .finally(() => setIsTesting(false));
      } else {
        const u = new SpeechSynthesisUtterance(textToUse);
        u.lang = 'en-US';
        u.rate = settings.readingSpeed;
        window.speechSynthesis.speak(u);
      }
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 border-2 border-indigo-400"
        title="Abrir Herramienta del Navegador (Lector / Traductor)"
      >
        <div className="relative">
          <Globe className="w-5 h-5 animate-pulse text-amber-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-600" />
        </div>
        <span className="text-xs font-bold tracking-wide">Extensión Navegador (Activa)</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-slate-900/95 text-white backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/80 p-4 transition-all animate-in slide-in-from-bottom-4">
      {/* Header Badge & Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                Herramienta del Navegador
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Selecciona texto para leer y traducir
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Minimizar a botón flotante"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Mode Selector Bar */}
      <div className="mt-3 space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Acción al Seleccionar Texto:</span>
          <span className="text-indigo-400 text-[10px] lowercase font-normal">
            (en cualquier parte)
          </span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium">
          <button
            onClick={() => onChangeSelectionMode('ask')}
            className={`py-1.5 px-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectionMode === 'ask'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Mostrar Botones</span>
          </button>

          <button
            onClick={() => onChangeSelectionMode('auto_speak')}
            className={`py-1.5 px-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectionMode === 'auto_speak'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Leer Directo</span>
          </button>

          <button
            onClick={() => onChangeSelectionMode('auto_translate_speak')}
            className={`py-1.5 px-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectionMode === 'auto_translate_speak'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <span>Traducir y Leer</span>
          </button>
        </div>
      </div>

      {/* Expanded Controls & Quick Tester */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
          {/* Active Audio State Player if currently speaking */}
          {isPlaying && (
            <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="font-semibold text-indigo-200">Leyendo voz sintética...</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onPause}
                  className="p-1 rounded bg-indigo-800 hover:bg-indigo-700 text-white"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onStop}
                  className="p-1 rounded bg-rose-800 hover:bg-rose-700 text-white"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Speed & Voice Selection */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                Velocidad ({settings.readingSpeed}x):
              </label>
              <div className="flex gap-1">
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onUpdateSettings({ readingSpeed: spd })}
                    className={`flex-1 py-1 rounded text-[11px] font-bold border transition-colors ${
                      settings.readingSpeed === spd
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                Voz Sintetizada:
              </label>
              <select
                value={settings.selectedVoiceURI}
                onChange={(e) => onUpdateSettings({ selectedVoiceURI: e.target.value })}
                className="w-full py-1 px-2 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Voz predeterminada (Auto)</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Input Tester Box */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Probar o Pegar Texto en Inglés:
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Pega o escribe un texto en inglés aquí para probar..."
              rows={2}
              className="w-full p-2 text-xs rounded-xl bg-slate-850 border border-slate-750 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestSpeak(false)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Leer Original
              </button>
              <button
                onClick={() => handleTestSpeak(true)}
                disabled={isTesting}
                className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md"
              >
                <Globe className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Traduciendo...' : 'Traducir al Español y Leer'}
              </button>
            </div>

            {testTranslation && (
              <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-xs text-indigo-200 mt-2 space-y-1">
                <div className="font-bold text-[10px] text-indigo-400 uppercase tracking-wider">
                  Traducción en Español:
                </div>
                <p className="leading-relaxed">{testTranslation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
