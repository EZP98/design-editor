/**
 * Artifact Parser - Extracts file changes from AI responses
 * Pattern from bolt.diy for structured code generation
 *
 * Supports formats:
 * - <boltArtifact> tags (bolt.diy)
 * - <file path="..."> tags (lovable)
 * - ```language:filepath blocks (cursor/claude)
 * - Standard markdown code blocks with path hints
 */

export interface CanvasElementData {
  type: 'frame' | 'text' | 'button' | 'image' | 'input' | 'link' | 'icon' | 'stack' | 'grid' | 'section' | 'container' | 'row' | 'page' | 'video' | 'model3d' | 'card';
  name?: string;
  content?: string;
  src?: string;
  href?: string;
  iconName?: string;
  imagePrompt?: string; // AI image generation prompt - when set, will auto-generate image
  styles?: Record<string, unknown>;
  children?: CanvasElementData[];
}

/**
 * Modification to existing element (for Smart AI Context)
 */
export interface CanvasElementModification {
  id: string;
  styles?: Record<string, unknown>;
  content?: string;
  name?: string;
  src?: string;
  href?: string;
}

export interface ParsedArtifact {
  type: 'file' | 'shell' | 'canvas';
  path?: string;
  content: string;
  language?: string;
  canvasElements?: CanvasElementData[];
  canvasModifications?: CanvasElementModification[]; // Modifications to existing elements
}

export interface ParseResult {
  artifacts: ParsedArtifact[];
  thinking?: string;
  explanation?: string;
}

// Regex patterns for different artifact formats
const PATTERNS = {
  // bolt.diy format: <boltArtifact>...<boltAction type="file" filePath="...">content</boltAction>...</boltArtifact>
  boltArtifact: /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/gi,
  boltAction: /<boltAction\s+type="(\w+)"(?:\s+filePath="([^"]+)")?[^>]*>([\s\S]*?)<\/boltAction>/gi,

  // Canvas elements format: <boltAction type="canvas">JSON</boltAction>
  canvasAction: /<boltAction\s+type="canvas"[^>]*>([\s\S]*?)<\/boltAction>/gi,

  // lovable format: <file path="...">content</file>
  lovableFile: /<file\s+path="([^"]+)"[^>]*>([\s\S]*?)<\/file>/gi,

  // Cursor/Claude format: ```language:filepath\ncontent\n```
  cursorBlock: /```(\w+):([^\n]+)\n([\s\S]*?)```/g,

  // Standard markdown with path comment: ```language\n// filepath: ...\ncontent\n```
  markdownWithPath: /```(\w+)?\n(?:\/\/|#|<!--)\s*(?:filepath?|file|path):\s*([^\n]+)\n([\s\S]*?)```/gi,

  // Standard markdown code blocks
  markdownBlock: /```(\w+)?\n([\s\S]*?)```/g,

  // Shell commands
  shellCommand: /```(?:bash|sh|shell|zsh)\n([\s\S]*?)```/g,

  // Thinking tags
  thinking: /<thinking>([\s\S]*?)<\/thinking>/gi,
};

// Language to extension mapping
const LANG_TO_EXT: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  tsx: 'tsx',
  jsx: 'jsx',
  css: 'css',
  scss: 'scss',
  html: 'html',
  json: 'json',
  md: 'md',
  markdown: 'md',
  python: 'py',
  rust: 'rs',
  go: 'go',
};

// Infer file path from content
function inferFilePath(content: string, language?: string): string | undefined {
  // Check for React component default export
  const componentMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)/);
  if (componentMatch) {
    const name = componentMatch[1];
    const ext = language === 'typescript' || language === 'tsx' ? 'tsx' : 'jsx';
    // Check if it's likely App component
    if (name === 'App') return `src/App.${ext}`;
    return `src/components/${name}.${ext}`;
  }

  // Check for imports that hint at the file type
  if (content.includes('import React') || content.includes('from "react"')) {
    return language === 'typescript' || language === 'tsx'
      ? 'src/App.tsx'
      : 'src/App.jsx';
  }

  // Check for CSS
  if (language === 'css' || content.match(/^[.#@]/m)) {
    return 'src/index.css';
  }

  // Check for package.json
  if (content.includes('"dependencies"') || content.includes('"name"')) {
    return 'package.json';
  }

  // Check for vite config
  if (content.includes('defineConfig')) {
    return 'vite.config.ts';
  }

  // Check for tailwind config
  if (content.includes('tailwind') && content.includes('content:')) {
    return 'tailwind.config.js';
  }

  return undefined;
}

/**
 * Parse AI response and extract artifacts
 */
export function parseArtifacts(response: string): ParseResult {
  const artifacts: ParsedArtifact[] = [];
  let thinking: string | undefined;
  let explanation = response;

  // Extract thinking sections
  const thinkingMatches = [...response.matchAll(PATTERNS.thinking)];
  if (thinkingMatches.length > 0) {
    thinking = thinkingMatches.map((m) => m[1].trim()).join('\n\n');
    explanation = response.replace(PATTERNS.thinking, '').trim();
  }

  // Try bolt.diy format first
  console.log('[ArtifactParser] Response length:', response.length);
  console.log('[ArtifactParser] Contains boltArtifact:', response.includes('<boltArtifact'));
  console.log('[ArtifactParser] Contains </boltArtifact>:', response.includes('</boltArtifact>'));
  console.log('[ArtifactParser] Contains boltAction:', response.includes('<boltAction'));
  console.log('[ArtifactParser] Contains </boltAction>:', response.includes('</boltAction>'));

  const boltArtifactMatches = [...response.matchAll(PATTERNS.boltArtifact)];
  console.log('[ArtifactParser] boltArtifact matches:', boltArtifactMatches.length);

  if (boltArtifactMatches.length > 0) {
    for (const match of boltArtifactMatches) {
      const artifactContent = match[1];
      console.log('[ArtifactParser] Artifact content length:', artifactContent.length);
      const actionMatches = [...artifactContent.matchAll(PATTERNS.boltAction)];
      console.log('[ArtifactParser] boltAction matches:', actionMatches.length);

      for (const actionMatch of actionMatches) {
        const [, type, filePath, content] = actionMatch;

        // Handle canvas type specially
        if (type === 'canvas') {
          try {
            const trimmedContent = content.trim();
            console.log('[ArtifactParser] Canvas content length:', trimmedContent.length);
            console.log('[ArtifactParser] Canvas content preview:', trimmedContent.substring(0, 200));
            console.log('[ArtifactParser] Canvas content ends with:', trimmedContent.substring(Math.max(0, trimmedContent.length - 50)));

            const canvasData = JSON.parse(trimmedContent);
            console.log('[ArtifactParser] JSON parsed successfully, elements count:', canvasData.elements?.length || 0);

            // Build artifact with elements and/or modifications
            const artifact: ParsedArtifact = {
              type: 'canvas',
              content: trimmedContent,
            };

            // Extract new elements
            if (canvasData.elements) {
              artifact.canvasElements = canvasData.elements;
            } else if (Array.isArray(canvasData)) {
              artifact.canvasElements = canvasData;
            } else if (!canvasData.modifications) {
              // Single element without modifications key
              artifact.canvasElements = [canvasData];
            }

            // Extract modifications to existing elements
            if (canvasData.modifications && Array.isArray(canvasData.modifications)) {
              artifact.canvasModifications = canvasData.modifications;
              console.log('[ArtifactParser] Found', canvasData.modifications.length, 'element modifications');
            }

            artifacts.push(artifact);
            console.log('[ArtifactParser] Canvas artifact added with', artifact.canvasElements?.length || 0, 'elements');
          } catch (e) {
            console.error('[ArtifactParser] Failed to parse canvas JSON:', e);
            console.error('[ArtifactParser] Content that failed:', content.substring(0, 500));
          }
        } else {
          artifacts.push({
            type: type as 'file' | 'shell',
            path: filePath,
            content: content.trim(),
          });
        }
      }

      // Remove from explanation
      explanation = explanation.replace(match[0], '').trim();
    }

    if (artifacts.length > 0) {
      return { artifacts, thinking, explanation };
    }
  }

  // Try lovable format
  const lovableMatches = [...response.matchAll(PATTERNS.lovableFile)];
  if (lovableMatches.length > 0) {
    for (const match of lovableMatches) {
      const [, path, content] = match;
      artifacts.push({
        type: 'file',
        path,
        content: content.trim(),
      });
      explanation = explanation.replace(match[0], '').trim();
    }

    if (artifacts.length > 0) {
      return { artifacts, thinking, explanation };
    }
  }

  // Try cursor format (```language:filepath)
  const cursorMatches = [...response.matchAll(PATTERNS.cursorBlock)];
  if (cursorMatches.length > 0) {
    for (const match of cursorMatches) {
      const [, language, path, content] = match;
      artifacts.push({
        type: 'file',
        path,
        content: content.trim(),
        language,
      });
      explanation = explanation.replace(match[0], '').trim();
    }

    if (artifacts.length > 0) {
      return { artifacts, thinking, explanation };
    }
  }

  // Try markdown with path comment
  const pathCommentMatches = [...response.matchAll(PATTERNS.markdownWithPath)];
  if (pathCommentMatches.length > 0) {
    for (const match of pathCommentMatches) {
      const [, language, path, content] = match;
      artifacts.push({
        type: 'file',
        path: path.trim(),
        content: content.trim(),
        language,
      });
      explanation = explanation.replace(match[0], '').trim();
    }

    if (artifacts.length > 0) {
      return { artifacts, thinking, explanation };
    }
  }

  // Extract shell commands
  const shellMatches = [...response.matchAll(PATTERNS.shellCommand)];
  for (const match of shellMatches) {
    const [, content] = match;
    artifacts.push({
      type: 'shell',
      content: content.trim(),
    });
  }

  // Fallback: standard markdown blocks with inference
  const markdownMatches = [...response.matchAll(PATTERNS.markdownBlock)];
  for (const match of markdownMatches) {
    const [fullMatch, language, content] = match;

    // Skip shell commands (already handled)
    if (['bash', 'sh', 'shell', 'zsh'].includes(language || '')) continue;

    // Skip very short blocks (likely examples, not full files)
    if (content.trim().split('\n').length < 3) continue;

    const path = inferFilePath(content, language);
    if (path) {
      artifacts.push({
        type: 'file',
        path,
        content: content.trim(),
        language,
      });
      explanation = explanation.replace(fullMatch, '').trim();
    }
  }

  return { artifacts, thinking, explanation };
}

/**
 * Apply artifacts to file system
 */
export function applyArtifacts(
  artifacts: ParsedArtifact[],
  currentFiles: Record<string, string>,
  onFileUpdate: (path: string, content: string) => void,
  onShellCommand?: (command: string) => void
): { updatedFiles: string[]; commands: string[] } {
  const updatedFiles: string[] = [];
  const commands: string[] = [];

  for (const artifact of artifacts) {
    if (artifact.type === 'file' && artifact.path) {
      onFileUpdate(artifact.path, artifact.content);
      updatedFiles.push(artifact.path);
    } else if (artifact.type === 'shell' && onShellCommand) {
      onShellCommand(artifact.content);
      commands.push(artifact.content);
    }
  }

  return { updatedFiles, commands };
}

/**
 * Progressive Canvas Parser
 * Extracts complete canvas elements during streaming for live rendering
 *
 * @param content - The streaming content so far
 * @param processedPosition - Position up to which content has been processed
 * @returns Object with new elements and updated processed position
 */
export function parseProgressiveCanvasElements(
  content: string,
  processedPosition: number = 0
): {
  elements: CanvasElementData[];
  processedPosition: number;
} {
  const elements: CanvasElementData[] = [];
  let newProcessedPosition = processedPosition;

  // Only look at content after processed position
  const unprocessedContent = content.slice(processedPosition);

  // Look for complete boltAction canvas blocks
  const canvasBlockRegex = /<boltAction\s+type="canvas"[^>]*>([\s\S]*?)<\/boltAction>/g;
  let match: RegExpExecArray | null;

  while ((match = canvasBlockRegex.exec(unprocessedContent)) !== null) {
    const jsonContent = match[1].trim();
    const blockEndPosition = processedPosition + match.index + match[0].length;

    try {
      const canvasData = JSON.parse(jsonContent);

      // Extract elements
      let newElements: CanvasElementData[] = [];
      if (canvasData.elements && Array.isArray(canvasData.elements)) {
        newElements = canvasData.elements;
      } else if (Array.isArray(canvasData)) {
        newElements = canvasData;
      } else if (canvasData.type) {
        // Single element
        newElements = [canvasData];
      }

      if (newElements.length > 0) {
        elements.push(...newElements);
        newProcessedPosition = blockEndPosition;
        console.log(`[ProgressiveParser] Found ${newElements.length} complete elements`);
      }
    } catch (e) {
      // JSON not complete yet, skip this block
      console.log('[ProgressiveParser] JSON incomplete, waiting for more data');
    }
  }

  return {
    elements,
    processedPosition: newProcessedPosition,
  };
}

/**
 * Extract complete JSON objects from streaming content using brace counting
 * Works with nested objects by tracking brace depth
 *
 * @param content - The streaming content
 * @param addedElementIds - Set of element IDs already added to canvas
 * @returns Array of complete elements found
 */
export function parseStreamingElements(
  content: string,
  addedElementIds: Set<string>
): CanvasElementData[] {
  const elements: CanvasElementData[] = [];

  // Find where the elements array starts
  const elementsMatch = content.match(/"elements"\s*:\s*\[/);
  if (!elementsMatch || elementsMatch.index === undefined) return elements;

  const arrayStartIndex = content.indexOf('[', elementsMatch.index);
  if (arrayStartIndex === -1) return elements;

  // Extract complete top-level objects from the array using brace counting
  const contentAfterArray = content.slice(arrayStartIndex + 1);

  let braceDepth = 0;
  let objectStart = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < contentAfterArray.length; i++) {
    const char = contentAfterArray[i];

    // Handle escape sequences in strings
    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    // Track string boundaries
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    // Only count braces outside strings
    if (!inString) {
      if (char === '{') {
        if (braceDepth === 0) {
          objectStart = i;
        }
        braceDepth++;
      } else if (char === '}') {
        braceDepth--;

        // Complete object found at top level
        if (braceDepth === 0 && objectStart !== -1) {
          const objectStr = contentAfterArray.slice(objectStart, i + 1);

          try {
            const element = JSON.parse(objectStr) as CanvasElementData;

            // Create unique ID from type + name
            const elementId = `${element.type}-${element.name || 'unnamed'}`;

            if (element.type && !addedElementIds.has(elementId)) {
              elements.push(element);
              console.log(`[StreamingParser] Found complete element: "${element.name || element.type}"`);
            }
          } catch {
            // JSON not valid yet, skip
          }

          objectStart = -1;
        }
      } else if (char === ']' && braceDepth === 0) {
        // End of elements array
        break;
      }
    }
  }

  return elements;
}

/**
 * Tolerant Canvas Parser
 * Attempts to extract elements even from incomplete/malformed JSON
 * Uses brace counting to find complete objects within incomplete responses
 *
 * @param content - The raw content (may be incomplete)
 * @returns Object with extracted elements and parse status
 */
export function parseCanvasElementsTolerant(content: string): {
  elements: CanvasElementData[];
  isComplete: boolean;
  parseError?: string;
} {
  const elements: CanvasElementData[] = [];

  // First, try to find boltAction canvas content
  const canvasMatch = content.match(/<boltAction\s+type="canvas"[^>]*>([\s\S]*?)(?:<\/boltAction>|$)/i);
  if (!canvasMatch) {
    console.log('[TolerantParser] No canvas action found');
    return { elements: [], isComplete: false, parseError: 'No canvas action found' };
  }

  const jsonContent = canvasMatch[1].trim();
  const hasClosingTag = content.includes('</boltAction>');

  console.log('[TolerantParser] Found canvas content, length:', jsonContent.length, 'hasClosingTag:', hasClosingTag);

  // Try full JSON parse first
  try {
    const parsed = JSON.parse(jsonContent);
    const extractedElements = parsed.elements || (Array.isArray(parsed) ? parsed : [parsed]);
    console.log('[TolerantParser] Full JSON parse succeeded:', extractedElements.length, 'elements');
    return { elements: extractedElements, isComplete: true };
  } catch (e) {
    console.log('[TolerantParser] Full JSON parse failed, trying tolerant extraction...');
  }

  // Fallback: Extract complete objects using brace counting
  // Find where elements array starts
  const elementsMatch = jsonContent.match(/"elements"\s*:\s*\[/);
  const arrayStart = elementsMatch
    ? jsonContent.indexOf('[', elementsMatch.index)
    : jsonContent.indexOf('[');

  if (arrayStart === -1) {
    console.log('[TolerantParser] No array found');
    return { elements: [], isComplete: false, parseError: 'No elements array found' };
  }

  const contentAfterArray = jsonContent.slice(arrayStart + 1);

  let braceDepth = 0;
  let objectStart = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < contentAfterArray.length; i++) {
    const char = contentAfterArray[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (braceDepth === 0) {
          objectStart = i;
        }
        braceDepth++;
      } else if (char === '}') {
        braceDepth--;

        if (braceDepth === 0 && objectStart !== -1) {
          const objectStr = contentAfterArray.slice(objectStart, i + 1);

          try {
            const element = JSON.parse(objectStr) as CanvasElementData;
            if (element.type) {
              elements.push(element);
              console.log(`[TolerantParser] Extracted element: "${element.name || element.type}"`);
            }
          } catch {
            // Individual object not valid, skip
          }

          objectStart = -1;
        }
      } else if (char === ']' && braceDepth === 0) {
        break;
      }
    }
  }

  console.log('[TolerantParser] Tolerant extraction found', elements.length, 'elements');
  return {
    elements,
    isComplete: hasClosingTag && elements.length > 0,
    parseError: elements.length === 0 ? 'Could not extract any complete elements' : undefined
  };
}

export function formatFilesForContext(
  files: Record<string, string>,
  maxFiles = 10,
  maxFileSize = 8000
): string {
  let context = '';
  let fileCount = 0;

  // Priority files first
  const priorityPaths = [
    'src/App.tsx',
    'src/App.jsx',
    'src/main.tsx',
    'src/main.jsx',
    'src/index.tsx',
    'src/index.jsx',
    'package.json',
    'vite.config.ts',
    'tailwind.config.js',
  ];

  const allPaths = Object.keys(files).filter((p) =>
    /\.(tsx?|jsx?|css|json|html)$/.test(p) &&
    !p.includes('node_modules') &&
    !p.includes('.lock') &&
    !p.includes('dist/')
  );

  // Sort: priority first, then by path
  const sortedPaths = [
    ...priorityPaths.filter((p) => files[p]),
    ...allPaths.filter((p) => !priorityPaths.includes(p)),
  ].slice(0, maxFiles);

  for (const path of sortedPaths) {
    const content = files[path];
    if (!content || content.length > maxFileSize) continue;

    const ext = path.split('.').pop() || 'txt';
    context += `### ${path}\n\`\`\`${ext}\n${content}\n\`\`\`\n\n`;
    fileCount++;
  }

  return context;
}
