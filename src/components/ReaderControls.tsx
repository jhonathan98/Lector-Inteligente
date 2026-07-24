import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Sliders,
  Type,
  Maximize2,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ReaderSettings, TypographyFont } from '../types';
import { TTSVoiceOption } from '../lib/tts';

interface ReaderControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  activeSentenceIndex: number;
  totalSentences: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrevSentence: () => void;
  onNextSentence: () => void;
  onSeekSentence: (index: number) => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  voices: TTSVoiceOption[];
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  isPlaying,
  isPaused,
  activeSentenceIndex,
  totalSentences,
  onPlay,
  onPause,
  onStop,
  onPrevSentence,
  onNextSentence,
  onSeekSentence,
  settings,
  onUpdateSettings,
  voices,
}) => {
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-4 duration-200">
      {/* Settings Popup Panel */}
      {showSettingsPanel && (
        <div className="mb-3 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Ajustes de Lectura y Voz
            </span>
            <button
              onClick={() => setShowSettingsPanel(false)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Font Size & Line Height */}
            <div className="space-y-2">
              <label className="font-semibold block text-slate-700 dark:text-slate-300">
                Tamaño de Letra ({settings.fontSizePx}px):
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    onUpdateSettings({ fontSizePx: Math.max(14, settings.fontSizePx - 2) })
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold"
                >
                  A-
                </button>
                <input
                  type="range"
                  min="14"
                  max="32"
                  step="2"
                  value={settings.fontSizePx}
                  onChange={(e) => onUpdateSettings({ fontSizePx: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <button
                  onClick={() =>
                    onUpdateSettings({ fontSizePx: Math.min(32, settings.fontSizePx + 2) })
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Typography Font */}
            <div className="space-y-2">
              <label className="font-semibold block text-slate-700 dark:text-slate-300">
                Tipografía de Lectura:
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) =>
                  onUpdateSettings({ fontFamily: e.target.value as TypographyFont })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="sans">Sans-serif (Limpia)</option>
                <option value="serif">Serif (Libro Tradicional)</option>
                <option value="mono">Monospace (Programación)</option>
                <option value="dyslexic">Adaptada Dislexia / Lectura Fácil</option>
              </select>
            </div>

            {/* TTS Voice Selection */}
            <div className="space-y-2 sm:col-span-2">
              <label className="font-semibold block text-slate-700 dark:text-slate-300">
                Voz de Lectura (Sintetizador de Voz):
              </label>
              <select
                value={settings.selectedVoiceURI}
                onChange={(e) => onUpdateSettings({ selectedVoiceURI: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Automática según idioma del texto</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Audio Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/95 text-white dark:bg-slate-800/95 backdrop-blur-md shadow-2xl border border-slate-700/80 flex flex-col gap-2">
        {/* Progress Bar Slider */}
        <div className="flex items-center gap-3 px-2">
          <span className="text-[11px] font-semibold text-slate-400 font-mono w-16">
            {totalSentences > 0 ? `${activeSentenceIndex + 1}/${totalSentences}` : '0/0'}
          </span>
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSentences - 1)}
            value={activeSentenceIndex}
            onChange={(e) => onSeekSentence(Number(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 rounded-lg bg-slate-700 cursor-pointer"
          />
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            {Math.round(((activeSentenceIndex + 1) / Math.max(1, totalSentences)) * 100)}%
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-2 px-2 pt-1">
          {/* Sentence Skip Back */}
          <button
            onClick={onPrevSentence}
            disabled={totalSentences === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-40"
            title="Oración anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Primary Play / Pause / Resume */}
          <button
            onClick={isPlaying && !isPaused ? onPause : onPlay}
            disabled={totalSentences === 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-40"
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isPaused ? 'Reanudar' : 'Leer en Voz Alta'}</span>
              </>
            )}
          </button>

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              onClick={onStop}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
              title="Detener lectura"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}

          {/* Sentence Skip Forward */}
          <button
            onClick={onNextSentence}
            disabled={totalSentences === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-40"
            title="Siguiente oración"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <span className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Reading Speed Selector */}
          <div className="flex items-center gap-1">
            <select
              value={settings.readingSpeed}
              onChange={(e) => onUpdateSettings({ readingSpeed: Number(e.target.value) })}
              className="px-2 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-amber-400 border border-slate-700 focus:outline-none"
              title="Velocidad de voz"
            >
              {speedOptions.map((spd) => (
                <option key={spd} value={spd}>
                  {spd}x
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Settings Modal */}
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className={`p-2 rounded-xl transition-colors ${
              showSettingsPanel
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Ajustes de texto y tipografía"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
