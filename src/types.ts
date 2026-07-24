export type HighlightColor = 'yellow' | 'green' | 'blue' | 'purple' | 'rose';

export interface VocabularyItem {
  word: string;
  translation: string;
  meaning?: string;
}

export interface HighlightNote {
  id: string;
  documentId: string;
  text: string;
  color: HighlightColor;
  noteText?: string;
  translationText?: string;
  aiExplanation?: string;
  keyTakeaways?: string[];
  simplifiedExplanation?: string;
  tags?: string[];
  createdAt: string;
  startOffset?: number;
  endOffset?: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  sourceType: 'sample' | 'url' | 'pasted' | 'file' | 'ocr';
  sourceUrl?: string;
  originalText: string;
  spanishTranslation?: string;
  language: string; // 'en', 'es', etc.
  author?: string;
  excerpt?: string;
  createdAt: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export type ThemeMode = 'light' | 'sepia' | 'dark' | 'oled';
export type TypographyFont = 'sans' | 'serif' | 'mono' | 'dyslexic';

export interface ReaderSettings {
  theme: ThemeMode;
  fontFamily: TypographyFont;
  fontSizePx: number;
  lineHeight: number;
  readingSpeed: number; // 0.5 to 2.0
  selectedVoiceURI: string;
  autoTranslateEnglish: boolean;
  highlightSentences: boolean;
  sideBySideTranslation: boolean;
}
