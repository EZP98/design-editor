/**
 * AI Element Tools
 *
 * Functions for AI-powered element editing:
 * - Text rewriting
 * - Image generation
 * - Style suggestions
 */

import { useCanvasStore } from './canvasStore';

// API endpoint for AI operations
const AI_API = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`
  : 'https://tyskftlhwdstsjvddfld.supabase.co/functions/v1/ai-chat';

const IMAGE_API = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-image`
  : 'https://tyskftlhwdstsjvddfld.supabase.co/functions/v1/ai-image';

// ============================================
// TEXT AI TOOLS
// ============================================

export type TextRewriteMode =
  | 'shorter'      // Make text shorter
  | 'longer'       // Expand text
  | 'professional' // More professional tone
  | 'casual'       // More casual tone
  | 'translate_en' // Translate to English
  | 'translate_it' // Translate to Italian
  | 'fix_grammar'  // Fix grammar and typos
  | 'custom';      // Custom instruction

const REWRITE_PROMPTS: Record<Exclude<TextRewriteMode, 'custom'>, string> = {
  shorter: 'Riscrivi questo testo in modo più breve e conciso, mantenendo il significato:',
  longer: 'Espandi questo testo aggiungendo più dettagli e informazioni:',
  professional: 'Riscrivi questo testo con un tono più professionale e formale:',
  casual: 'Riscrivi questo testo con un tono più amichevole e informale:',
  translate_en: 'Traduci questo testo in inglese:',
  translate_it: 'Traduci questo testo in italiano:',
  fix_grammar: 'Correggi errori grammaticali e di battitura in questo testo:',
};

export interface TextRewriteResult {
  success: boolean;
  newText?: string;
  error?: string;
}

/**
 * Rewrite text content using AI
 */
export async function aiRewriteText(
  elementId: string,
  mode: TextRewriteMode,
  customInstruction?: string
): Promise<TextRewriteResult> {
  const element = useCanvasStore.getState().elements[elementId];
  if (!element || !element.content) {
    return { success: false, error: 'Element not found or has no content' };
  }

  const instruction = mode === 'custom'
    ? customInstruction || 'Riscrivi questo testo:'
    : REWRITE_PROMPTS[mode];

  const prompt = `${instruction}

"${element.content}"

IMPORTANTE: Rispondi SOLO con il nuovo testo, senza virgolette, senza spiegazioni, senza prefissi.`;

  try {
    const response = await fetch(AI_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        mode: 'general',
        model: 'claude-sonnet-4-5-20250514',
        systemPrompt: 'Sei un copywriter esperto. Rispondi SOLO con il testo richiesto, nient\'altro.',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'API error' };
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      return { success: false, error: 'No response body' };
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              fullText += data.text;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }

    // Clean up the response
    const newText = fullText.trim()
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^(Ecco|Qui|Il testo)[^:]*:\s*/i, ''); // Remove common prefixes

    if (!newText) {
      return { success: false, error: 'Empty response from AI' };
    }

    // Update the element
    useCanvasStore.getState().updateElementContent(elementId, newText);
    useCanvasStore.getState().saveToHistory(`AI rewrite: ${mode}`);

    return { success: true, newText };

  } catch (err) {
    console.error('AI rewrite error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

// ============================================
// IMAGE AI TOOLS
// ============================================

export interface ImageGenerateResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Generate a new image using AI
 */
export async function aiGenerateImage(
  elementId: string,
  prompt: string
): Promise<ImageGenerateResult> {
  const element = useCanvasStore.getState().elements[elementId];
  if (!element || element.type !== 'image') {
    return { success: false, error: 'Element not found or not an image' };
  }

  try {
    const response = await fetch(IMAGE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'generate',
        prompt: prompt,
        width: Math.round(element.size.width),
        height: Math.round(element.size.height),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Image generation failed' };
    }

    // Update the element with new image
    useCanvasStore.setState((state) => ({
      elements: {
        ...state.elements,
        [elementId]: {
          ...state.elements[elementId],
          src: data.imageUrl,
        },
      },
    }));
    useCanvasStore.getState().saveToHistory('AI generate image');

    return { success: true, imageUrl: data.imageUrl };

  } catch (err) {
    console.error('AI generate image error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Replace image with AI-generated variation
 */
export async function aiReplaceImageWithSimilar(
  elementId: string
): Promise<ImageGenerateResult> {
  const element = useCanvasStore.getState().elements[elementId];
  if (!element || element.type !== 'image' || !element.src) {
    return { success: false, error: 'Element not found, not an image, or has no source' };
  }

  try {
    const response = await fetch(IMAGE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'variation',
        imageUrl: element.src,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Image variation failed' };
    }

    // Update the element with new image
    useCanvasStore.setState((state) => ({
      elements: {
        ...state.elements,
        [elementId]: {
          ...state.elements[elementId],
          src: data.imageUrl,
        },
      },
    }));
    useCanvasStore.getState().saveToHistory('AI image variation');

    return { success: true, imageUrl: data.imageUrl };

  } catch (err) {
    console.error('AI image variation error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

// ============================================
// ELEMENT MODIFICATION
// ============================================

export interface ElementModifyResult {
  success: boolean;
  changes?: Record<string, unknown>;
  error?: string;
}

/**
 * Modify element using natural language instruction
 */
export async function aiModifyElement(
  elementId: string,
  instruction: string
): Promise<ElementModifyResult> {
  const element = useCanvasStore.getState().elements[elementId];
  if (!element) {
    return { success: false, error: 'Element not found' };
  }

  const prompt = `Dato questo elemento di design:
- Tipo: ${element.type}
- Contenuto: ${element.content || 'nessuno'}
- Stili attuali: ${JSON.stringify(element.styles, null, 2)}

L'utente chiede: "${instruction}"

Rispondi SOLO con un JSON valido contenente le modifiche da applicare. Esempio:
{"content": "nuovo testo", "styles": {"color": "#ff0000", "fontSize": 24}}

Se la richiesta non è chiara, rispondi con: {"error": "spiegazione"}`;

  try {
    const response = await fetch(AI_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        mode: 'general',
        model: 'claude-sonnet-4-5-20250514',
        systemPrompt: 'Sei un assistente che modifica elementi di design. Rispondi SOLO con JSON valido.',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'API error' };
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      return { success: false, error: 'No response body' };
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              fullText += data.text;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }

    // Parse the JSON response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Invalid AI response format' };
    }

    const changes = JSON.parse(jsonMatch[0]);

    if (changes.error) {
      return { success: false, error: changes.error };
    }

    // Apply changes
    const store = useCanvasStore.getState();

    if (changes.content !== undefined) {
      store.updateElementContent(elementId, changes.content);
    }

    if (changes.styles) {
      store.updateElementStyles(elementId, changes.styles);
    }

    store.saveToHistory('AI modify element');

    return { success: true, changes };

  } catch (err) {
    console.error('AI modify element error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

// ============================================
// QUICK STYLE PRESETS
// ============================================

export const QUICK_COLOR_PRESETS = [
  { name: 'Purple', bg: '#8B5CF6', text: '#FFFFFF' },
  { name: 'Blue', bg: '#3B82F6', text: '#FFFFFF' },
  { name: 'Green', bg: '#22C55E', text: '#FFFFFF' },
  { name: 'Red', bg: '#EF4444', text: '#FFFFFF' },
  { name: 'Orange', bg: '#F97316', text: '#FFFFFF' },
  { name: 'Pink', bg: '#EC4899', text: '#FFFFFF' },
  { name: 'Dark', bg: '#18181B', text: '#FFFFFF' },
  { name: 'Light', bg: '#F4F4F5', text: '#18181B' },
];

export function applyQuickColorPreset(
  elementId: string,
  preset: typeof QUICK_COLOR_PRESETS[number]
): void {
  const element = useCanvasStore.getState().elements[elementId];
  if (!element) return;

  const store = useCanvasStore.getState();

  if (element.type === 'text' || element.type === 'button' || element.type === 'link') {
    // For text-based elements, apply to text color
    store.updateElementStyles(elementId, { color: preset.text });
  } else {
    // For containers, apply background
    store.updateElementStyles(elementId, { backgroundColor: preset.bg });
  }

  store.saveToHistory(`Apply color: ${preset.name}`);
}
