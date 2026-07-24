import React, { useState } from 'react';
import {
  Globe,
  FileText,
  Upload,
  Camera,
  X,
  Sparkles,
  Link,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: DocumentItem) => void;
}

export const DocumentImporter: React.FC<DocumentImporterProps> = ({
  isOpen,
  onClose,
  onAddDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'file' | 'ocr'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // 1. Fetch Web Page Content from URL
  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo cargar la página web.');
      }

      const wordCount = data.content.trim().split(/\s+/).length;
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: data.title || 'Artículo Web',
        sourceType: 'url',
        sourceUrl: data.url,
        originalText: data.content,
        language: 'auto',
        excerpt: data.excerpt || data.content.slice(0, 160) + '...',
        createdAt: new Date().toISOString(),
        wordCount,
        readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
      };

      onAddDocument(newDoc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la URL.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Add Pasted Text
  const handleAddPastedText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    const title = pastedTitle.trim() || 'Texto Personalizado ' + new Date().toLocaleDateString();
    const wordCount = pastedText.trim().split(/\s+/).length;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title,
      sourceType: 'pasted',
      originalText: pastedText.trim(),
      language: 'auto',
      createdAt: new Date().toISOString(),
      wordCount,
      readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    };

    onAddDocument(newDoc);
    onClose();
  };

  // 3. Handle File Upload (txt, pdf)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');

    try {
      if (file.type.startsWith('image/')) {
        // Read as Base64 for OCR
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          processImageOcr(base64, file.type);
        };
        reader.readAsDataURL(file);
      } else {
        // Read text file
        const text = await file.text();
        const wordCount = text.trim().split(/\s+/).length;

        const newDoc: DocumentItem = {
          id: `doc-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          sourceType: 'file',
          originalText: text,
          language: 'auto',
          createdAt: new Date().toISOString(),
          wordCount,
          readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
        };

        onAddDocument(newDoc);
        onClose();
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Error al leer el archivo. Intenta otro formato.');
      setLoading(false);
    }
  };

  // 4. Process OCR with Gemini Multimodal
  const processImageOcr = async (base64: string, mimeType: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al realizar el OCR con IA.');
      }

      const wordCount = data.extractedText.trim().split(/\s+/).length;
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: data.title || 'Texto de Imagen Escaneada',
        sourceType: 'ocr',
        originalText: data.extractedText,
        language: data.isEnglish ? 'en' : 'es',
        createdAt: new Date().toISOString(),
        wordCount,
        readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
      };

      onAddDocument(newDoc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Cargar o Importar Texto
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lector de páginas web, archivos, texto pegado o capturas de pantalla
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
              activeTab === 'url'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Globe className="w-4 h-4" />
            Página Web (URL)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
              activeTab === 'paste'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            Pegar Texto
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
              activeTab === 'ocr'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Camera className="w-4 h-4" />
            Imagen / OCR
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
              activeTab === 'file'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Upload className="w-4 h-4" />
            Subir Archivo
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* TAB 1: URL Web Reader */}
          {activeTab === 'url' && (
            <form onSubmit={handleFetchUrl} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Enlace o Dirección Web de la página o artículo:
                </label>
                <div className="relative">
                  <Link className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/articulo-interesante"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  Extrae automáticamente el artículo limpio de Wikipedia, blogs, noticias o cualquier sitio web público.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Extrayendo artículo...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Cargar Página Web
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Paste Text */}
          {activeTab === 'paste' && (
            <form onSubmit={handleAddPastedText} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título del Documento (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Apuntes de Filosofía / Resumen de Conferencia"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pega aquí el contenido del texto:
                </label>
                <textarea
                  rows={8}
                  placeholder="Pega cualquier fragmento de texto, ensayo, correo o libro en español o inglés..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Guardar y Leer
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Image / OCR with Gemini */}
          {activeTab === 'ocr' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sube una foto o captura de pantalla de un libro, documento físico o sitio web. La IA de Gemini leerá y formateará el texto automáticamente.
              </p>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Camera className="w-10 h-10 mx-auto text-indigo-500 mb-3" />
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Selecciona o arrastra una imagen aquí
                </div>
                <div className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP, Capturas de pantalla</div>
              </div>

              {loading && (
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-sm flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Procesando reconocimiento óptico de caracteres (OCR) con IA...</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sube archivos de texto plano (.txt, .md).
              </p>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 mx-auto text-indigo-500 mb-3" />
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Haz clic para seleccionar tu archivo
                </div>
                <div className="text-xs text-slate-400 mt-1">Formatos soportados: .txt, .md</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
