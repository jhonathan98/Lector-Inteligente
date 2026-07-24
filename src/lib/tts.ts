export interface TTSVoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
}

export function getAvailableVoices(): Promise<TTSVoiceOption[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return resolve([]);
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const options: TTSVoiceOption[] = voices.map((v) => ({
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        default: v.default,
      }));
      resolve(options);
    };

    const initialVoices = window.speechSynthesis.getVoices();
    if (initialVoices.length > 0) {
      updateVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        updateVoices();
      };
      // Fallback timeout in case onvoiceschanged doesn't fire
      setTimeout(() => {
        updateVoices();
      }, 500);
    }
  });
}

/**
 * Splits text into readable sentences with accurate character boundaries.
 */
export interface SentenceSpan {
  index: number;
  text: string;
  start: number;
  end: number;
}

export function splitIntoSentences(text: string): SentenceSpan[] {
  if (!text || text.trim().length === 0) return [];

  // Match sentence endings like ., !, ?, or newline
  const regex = /[^.!?\n]+[.!?\n]+/g;
  const spans: SentenceSpan[] = [];
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const rawSentence = match[0];
    const start = match.index;
    const end = start + rawSentence.length;
    spans.push({
      index: spans.length,
      text: rawSentence.trim(),
      start,
      end,
    });
    lastIndex = end;
  }

  // Trailing text without punctuation
  if (lastIndex < text.length) {
    const remainder = text.slice(lastIndex).trim();
    if (remainder.length > 0) {
      spans.push({
        index: spans.length,
        text: remainder,
        start: lastIndex,
        end: text.length,
      });
    }
  }

  return spans;
}

export class TTSPlayer {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private isPaused = false;
  private sentenceSpans: SentenceSpan[] = [];
  private currentSentenceIndex = 0;
  private speed = 1.0;
  private voiceURI = '';
  private targetLanguage = 'es-ES';

  public onSentenceChange?: (index: number, span: SentenceSpan) => void;
  public onStateChange?: (isPlaying: boolean, isPaused: boolean) => void;
  public onEnd?: () => void;
  public onError?: (err: any) => void;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setSentences(text: string, languageHint: string = 'es') {
    this.stop();
    this.sentenceSpans = splitIntoSentences(text);
    this.currentSentenceIndex = 0;
    this.targetLanguage = languageHint.startsWith('en') ? 'en-US' : 'es-ES';
  }

  public setSpeed(speed: number) {
    this.speed = speed;
    if (this.isPlaying && !this.isPaused) {
      // Re-speak current sentence with new rate
      const idx = this.currentSentenceIndex;
      this.stop();
      this.playSentence(idx);
    }
  }

  public setVoiceURI(uri: string) {
    this.voiceURI = uri;
  }

  public play() {
    if (!this.synth || this.sentenceSpans.length === 0) return;

    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.notifyState();
      return;
    }

    if (this.currentSentenceIndex >= this.sentenceSpans.length) {
      this.currentSentenceIndex = 0;
    }

    this.playSentence(this.currentSentenceIndex);
  }

  public pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
      this.isPaused = true;
      this.isPlaying = false;
      this.notifyState();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.notifyState();
  }

  public seekSentence(index: number) {
    if (index < 0 || index >= this.sentenceSpans.length) return;
    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentSentenceIndex = index;
    if (wasPlaying) {
      this.playSentence(index);
    } else {
      if (this.onSentenceChange) {
        this.onSentenceChange(index, this.sentenceSpans[index]);
      }
    }
  }

  public getCurrentIndex(): number {
    return this.currentSentenceIndex;
  }

  public getTotalSentences(): number {
    return this.sentenceSpans.length;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  private playSentence(index: number) {
    if (!this.synth || index < 0 || index >= this.sentenceSpans.length) {
      this.stop();
      if (this.onEnd) this.onEnd();
      return;
    }

    this.synth.cancel(); // cancel previous

    const span = this.sentenceSpans[index];
    this.currentSentenceIndex = index;

    if (this.onSentenceChange) {
      this.onSentenceChange(index, span);
    }

    const utterance = new SpeechSynthesisUtterance(span.text);
    utterance.rate = this.speed;

    // Pick voice
    const voices = this.synth.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (this.voiceURI) {
      selectedVoice = voices.find((v) => v.voiceURI === this.voiceURI);
    }

    if (!selectedVoice) {
      // Find matching language voice
      const langPrefix = this.targetLanguage.slice(0, 2);
      selectedVoice =
        voices.find((v) => v.lang.startsWith(langPrefix)) ||
        voices.find((v) => v.lang.startsWith('es')) ||
        voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = this.targetLanguage;
    }

    utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        if (this.currentSentenceIndex + 1 < this.sentenceSpans.length) {
          this.playSentence(this.currentSentenceIndex + 1);
        } else {
          this.isPlaying = false;
          this.isPaused = false;
          this.notifyState();
          if (this.onEnd) this.onEnd();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('TTS utterance error:', e);
      if (this.onError) this.onError(e);
      // Skip to next sentence on non-fatal error
      if (this.isPlaying && this.currentSentenceIndex + 1 < this.sentenceSpans.length) {
        setTimeout(() => this.playSentence(this.currentSentenceIndex + 1), 200);
      } else {
        this.stop();
      }
    };

    this.currentUtterance = utterance;
    this.isPlaying = true;
    this.isPaused = false;
    this.notifyState();

    this.synth.speak(utterance);
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange(this.isPlaying, this.isPaused);
    }
  }
}
