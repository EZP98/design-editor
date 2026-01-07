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
  const boltArtifactMatches = [...response.matchAll(PATTERNS.boltArtifact)];
  if (boltArtifactMatches.length > 0) {
    for (const match of boltArtifactMatches) {
      const artifactContent = match[1];
      const actionMatches = [...artifactContent.matchAll(PATTERNS.boltAction)];

      for (const actionMatch of actionMatches) {
        const [, type, filePath, content] = actionMatch;

        // Handle canvas type specially
        if (type === 'canvas') {
          try {
            const trimmedContent = content.trim();
            const canvasData = JSON.parse(trimmedContent);

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
          } catch (e) {
            console.warn('[ArtifactParser] Failed to parse canvas JSON:', e);
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
 * Format files for AI context
 */
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
