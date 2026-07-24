import { DocumentItem } from '../types';

export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'The Art and Science of Deep Reading in the Digital Age',
    sourceType: 'sample',
    language: 'en',
    author: 'Dr. Evelyn Vance',
    excerpt: 'An investigation into how screen technology alters human attention spans and cognitive retention during reading.',
    originalText: `Reading is not a natural human capability. Unlike spoken language, which develops naturally in children through social immersion, reading requires the brain to re-wire existing neural circuits to decode visual symbols into sound and meaning.

In our current digital landscape, the nature of reading is undergoing a fundamental transformation. Skimming, rapid scrolling, and constant context switching have become the dominant modes of consuming written content online. When we read on digital screens, our visual processing system prioritizes speed over depth, scanning for keywords rather than analyzing subtle argument structures.

Neuroscientists refer to this phenomenon as the "digital reading paradox." While access to information has expanded exponentially, our capacity for deep, sustained contemplation appears to be eroding. Deep reading involves critical analysis, inferential reasoning, empathetic immersion, and analogical thinking—processes that require quiet cognitive space.

To mitigate digital fatigue, researchers recommend structured screen reading techniques. Using audio-assisted text tracking, where a digital voice reads along while text is visually highlighted, engages both auditory and visual pathways simultaneously. This multi-sensory reading technique significantly improves comprehension and focus, particularly when encountering complex or foreign language material.

Furthermore, active annotation—highlighting key statements and recording reflective notes in real-time—transforms passive scrolling into an active cognitive dialogue. By translating thoughts into concise summaries and translating unfamiliar vocabulary on the fly, readers anchor abstract concepts in long-term memory.`,
    spanishTranslation: `La lectura no es una capacidad humana natural. A diferencia del lenguaje hablado, que se desarrolla naturalmente en los niños a través de la inmersión social, la lectura requiere que el cerebro reconfigure los circuitos neuronales existentes para decodificar símbolos visuales en sonido y significado.

En nuestro panorama digital actual, la naturaleza de la lectura está experimentando una transformación fundamental. La lectura rápida, el desplazamiento acelerado y el cambio constante de contexto se han convertido en los modos dominantes de consumir contenido escrito en línea. Cuando leemos en pantallas digitales, nuestro sistema de procesamiento visual prioriza la velocidad sobre la profundidad, buscando palabras clave en lugar de analizar estructuras argumentales sutiles.

Los neurocientíficos se refieren a este fenómeno como la "paradoja de la lectura digital". Aunque el acceso a la información se ha expandido exponencialmente, nuestra capacidad para una contemplación profunda y sostenida parece estar erosionándose. La lectura profunda implica análisis crítico, razonamiento inferencial, inmersión empática y pensamiento analógico: procesos que requieren un espacio cognitivo sereno.

Para mitigar la fatiga digital, los investigadores recomiendan técnicas estructuradas de lectura en pantalla. El uso del seguimiento de texto asistido por audio, donde una voz digital lee mientras el texto se resalta visualmente, activa simultáneamente las vías auditivas y visuales. Esta técnica de lectura multisensorial mejora significativamente la comprensión y el enfoque, particularmente al enfrentarse a material complejo o en idiomas extranjeros.

Además, la anotación activa (resaltar afirmaciones clave y registrar notas reflexivas en tiempo real) transforma el desplazamiento pasivo en un diálogo cognitivo activo. Al traducir pensamientos en resúmenes concisos y traducir vocabulario no familiar al instante, los lectores anclan conceptos abstractos en la memoria a largo plazo.`,
    createdAt: new Date().toISOString(),
    wordCount: 310,
    readingTimeMinutes: 2,
  },
  {
    id: 'doc-2',
    title: 'Inteligencia Artificial y el Futuro del Aprendizaje Autónomo',
    sourceType: 'sample',
    language: 'es',
    author: 'Carlos Mendoza',
    excerpt: 'Reflexión sobre cómo las herramientas de lectura asistida con IA están transformando la educación personalizada.',
    originalText: `La convergencia entre la inteligencia artificial y la pedagogía moderna está abriendo horizontes insospechados para el aprendizaje autodidacta. En las últimas décadas, el acceso a la información dejó de ser la barrera principal; hoy, el desafío radicará en la capacidad de procesar, sintetizar y retener críticamente vastas cantidades de datos.

Las herramientas de lectura inteligente actúan como copilotos cognitivos. Al permitir la síntesis de voz adaptable, la extracción automática de puntos clave y la traducción instantánea de términos técnicos, el estudiante no solo lee más rápido, sino con mayor profundidad conceptual.

Un pilar fundamental de este ecosistema es el resaltado estructurado con notas interactivas. Cuando un lector selecciona una frase desafiante o un concepto clave, la IA puede explicarlo inmediatamente con analogías sencillas, traduciéndolo si proviene de otro idioma o relacionándolo con anotaciones previas del mismo usuario.

Este enfoque promueve el aprendizaje activo, reduciendo la carga cognitiva y fomentando un estado de flujo donde la lectura se convierte en un diálogo dinámico entre el texto, la tecnología y el pensamiento crítico del usuario.`,
    createdAt: new Date().toISOString(),
    wordCount: 195,
    readingTimeMinutes: 1,
  }
];
