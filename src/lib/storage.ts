import { DocumentItem, HighlightNote, ReaderSettings } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';

const STORAGE_KEYS = {
  DOCUMENTS: 'screen_reader_documents_v1',
  HIGHLIGHTS: 'screen_reader_highlights_v1',
  SETTINGS: 'screen_reader_settings_v1',
  ACTIVE_DOC_ID: 'screen_reader_active_doc_id_v1',
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light',
  fontFamily: 'sans',
  fontSizePx: 18,
  lineHeight: 1.6,
  readingSpeed: 1.0,
  selectedVoiceURI: '',
  autoTranslateEnglish: true,
  highlightSentences: true,
  sideBySideTranslation: false,
};

export function loadSettings(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ReaderSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function loadDocuments(): DocumentItem[] {
  if (typeof window === 'undefined') return SAMPLE_DOCUMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (raw) {
      const parsed: DocumentItem[] = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading documents:', e);
  }
  // Initialize with sample docs if empty
  saveDocuments(SAMPLE_DOCUMENTS);
  return SAMPLE_DOCUMENTS;
}

export function saveDocuments(docs: DocumentItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving documents:', e);
  }
}

export function loadHighlights(): HighlightNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading highlights:', e);
  }
  return [];
}

export function saveHighlights(highlights: HighlightNote[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
  } catch (e) {
    console.error('Error saving highlights:', e);
  }
}

export function getActiveDocId(): string {
  if (typeof window === 'undefined') return SAMPLE_DOCUMENTS[0].id;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID);
    if (raw) return raw;
  } catch (e) {
    console.error('Error loading active doc id:', e);
  }
  return SAMPLE_DOCUMENTS[0].id;
}

export function setActiveDocId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, id);
  } catch (e) {
    console.error('Error setting active doc id:', e);
  }
}
