import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy initializer for Gemini
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY process environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Translate text to Spanish (or target language)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang = 'Spanish' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texto es requerido.' });
    }

    const ai = getGemini();
    const prompt = `Traduce el siguiente texto al ${targetLang}. Preserva la estructura original, párrafos e intención. 
Si el texto ya está en ${targetLang}, proporciona la versión pulida y corregida gramaticalmente.
Responde estrictamente en formato JSON con la siguiente estructura:
{
  "translatedText": "traducción completa",
  "detectedLanguage": "idioma detectado (ej. Inglés, Francés, Alemán)",
  "briefSummary": "resumen en 1 oración del fragmento",
  "keyVocabulary": [{"word": "palabra original", "translation": "traducción", "meaning": "significado breve"}]
}

Texto a traducir:
"${text.slice(0, 15000)}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
            briefSummary: { type: Type.STRING },
            keyVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                },
                required: ['word', 'translation'],
              },
            },
          },
          required: ['translatedText', 'detectedLanguage'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      translatedText: parsed.translatedText || '',
      detectedLanguage: parsed.detectedLanguage || 'Desconocido',
      briefSummary: parsed.briefSummary || '',
      keyVocabulary: parsed.keyVocabulary || [],
    });
  } catch (error: any) {
    console.error('Error en /api/translate:', error);
    return res.status(500).json({
      error: error.message || 'Error al traducir el texto.',
    });
  }
});

// 2. API: OCR / Extract text from image or document file
app.post('/api/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'La imagen en Base64 es requerida.' });
    }

    const ai = getGemini();
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType,
          },
        },
        {
          text: `Extrae todo el texto visible en esta imagen o captura de pantalla. 
Devuelve el texto perfectamente formateado en Markdown. 
Informa también un título descriptivo y si el texto requiere traducción al español.
Responde en JSON con la estructura:
{
  "extractedText": "texto extraído completo con saltos de línea",
  "title": "título o encabezado inferido del documento",
  "language": "idioma principal detectado",
  "isEnglish": true/false
}`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            title: { type: Type.STRING },
            language: { type: Type.STRING },
            isEnglish: { type: Type.BOOLEAN },
          },
          required: ['extractedText', 'title'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      extractedText: parsed.extractedText || '',
      title: parsed.title || 'Documento Escaneado',
      language: parsed.language || 'Español',
      isEnglish: !!parsed.isEnglish,
    });
  } catch (error: any) {
    console.error('Error en /api/ocr:', error);
    return res.status(500).json({
      error: error.message || 'Error al procesar la imagen u OCR.',
    });
  }
});

// 3. API: Fetch URL and extract clean text using Readability
app.post('/api/fetch-url', async (req, res) => {
  try {
    let { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL requerida.' });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Attempt direct fetch
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`No se pudo cargar la página (Status ${response.status})`);
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      // Fallback: extract body text manually if readability yields nothing
      const fallbackText = dom.window.document.body?.textContent || '';
      const title = dom.window.document.title || 'Página Web';
      return res.json({
        success: true,
        title,
        content: fallbackText.replace(/\s+/g, ' ').trim(),
        byline: '',
        siteName: new URL(url).hostname,
        url,
      });
    }

    return res.json({
      success: true,
      title: article.title || dom.window.document.title || 'Artículo Web',
      content: article.textContent.trim(),
      htmlContent: article.content,
      byline: article.byline || '',
      siteName: article.siteName || new URL(url).hostname,
      excerpt: article.excerpt || '',
      url,
    });
  } catch (error: any) {
    console.error('Error en /api/fetch-url:', error);
    return res.status(500).json({
      error:
        error.message ||
        'No se pudo extraer el texto de esa URL. Intenta copiar y pegar el texto directamente.',
    });
  }
});

// 4. API: Smart Note Generation / AI Assistant for Highlights
app.post('/api/ai-notes', async (req, res) => {
  try {
    const { highlightText, contextText = '' } = req.body;
    if (!highlightText) {
      return res.status(400).json({ error: 'Texto destacado requerido.' });
    }

    const ai = getGemini();
    const prompt = `Analiza este fragmento destacado por el usuario mientras leía un texto/documento:
Fragmento destacado: "${highlightText}"
${contextText ? `Contexto general: "${contextText.slice(0, 2000)}"` : ''}

Por favor genera:
1. Una nota explicativa clara en español.
2. 3 Puntos clave o conclusiones (Bullet points).
3. Una simplificación o "explicación como para 5 años".
4. Etiquetas/Tags sugeridas (3 a 5 palabras clave).
5. Si el fragmento está en inglés o contiene términos técnicos en inglés, incluye la traducción recomendada.

Responde en formato JSON con este esquema:
{
  "explanation": "explicación detallada en español",
  "keyTakeaways": ["punto 1", "punto 2", "punto 3"],
  "simplifiedExplanation": "explicación muy simple",
  "suggestedTags": ["etiqueta1", "etiqueta2"],
  "spanishTranslation": "traducción directa si aplica"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            simplifiedExplanation: { type: Type.STRING },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            spanishTranslation: { type: Type.STRING },
          },
          required: ['explanation', 'keyTakeaways', 'suggestedTags'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error en /api/ai-notes:', error);
    return res.status(500).json({
      error: error.message || 'Error al generar la nota con IA.',
    });
  }
});

async function startServer() {
  // Vite integration in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
