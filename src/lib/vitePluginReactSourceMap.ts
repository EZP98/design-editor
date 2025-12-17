/**
 * Vite Plugin: React Source Map
 *
 * Injects data-source attributes into JSX elements during development build.
 * This enables visual editors to map rendered DOM elements back to source code.
 *
 * Example transformation:
 * Input:  <div className="hero">
 * Output: <div className="hero" data-source="src/components/Hero.tsx:15:4">
 *
 * Based on babel-plugin-transform-react-jsx-location approach.
 */

import type { Plugin } from 'vite';
import MagicString from 'magic-string';

interface SourceMapPluginOptions {
  // File extensions to process
  include?: string[];
  // Files/patterns to exclude
  exclude?: string[];
  // Attribute name for source location
  attributeName?: string;
  // Include column number in source location
  includeColumn?: boolean;
}

const defaultOptions: Required<SourceMapPluginOptions> = {
  include: ['.tsx', '.jsx'],
  exclude: ['node_modules', '.d.ts'],
  attributeName: 'data-source',
  includeColumn: false,
};

/**
 * Creates a Vite plugin that injects source location attributes into JSX
 */
export function vitePluginReactSourceMap(options: SourceMapPluginOptions = {}): Plugin {
  const opts = { ...defaultOptions, ...options };

  return {
    name: 'vite-plugin-react-source-map',
    enforce: 'pre',

    transform(code: string, id: string) {
      // Skip if not a target file
      if (!opts.include.some(ext => id.endsWith(ext))) {
        return null;
      }

      // Skip excluded patterns
      if (opts.exclude.some(pattern => id.includes(pattern))) {
        return null;
      }

      // Get relative path from project root
      const relativePath = id.replace(process.cwd() + '/', '');

      try {
        const result = injectSourceAttributes(code, relativePath, opts);
        return result;
      } catch (e) {
        console.warn(`[vite-plugin-react-source-map] Failed to process ${id}:`, e);
        return null;
      }
    },
  };
}

/**
 * Injects data-source attributes into JSX elements
 */
function injectSourceAttributes(
  code: string,
  filePath: string,
  opts: Required<SourceMapPluginOptions>
): { code: string; map: any } | null {
  const s = new MagicString(code);
  let hasChanges = false;

  // Regex to match JSX opening tags
  // Matches: <ComponentName or <div or <Component.Sub
  const jsxOpeningTagRegex = /<([A-Z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)*|[a-z][a-z0-9-]*)\s*(?=[^>]*>)/g;

  // Track string/template literals and comments to avoid matching inside them
  const skipRanges = getSkipRanges(code);

  let match;
  while ((match = jsxOpeningTagRegex.exec(code)) !== null) {
    const startIndex = match.index;

    // Skip if inside string/comment
    if (isInSkipRange(startIndex, skipRanges)) {
      continue;
    }

    // Find the end of the opening tag (> or />)
    const tagEndIndex = findTagEnd(code, startIndex);
    if (tagEndIndex === -1) continue;

    // Skip self-closing fragments <> and </>
    if (match[1] === '' || match[1] === undefined) continue;

    // Skip if already has data-source attribute
    const tagContent = code.slice(startIndex, tagEndIndex);
    if (tagContent.includes(opts.attributeName)) continue;

    // Calculate line and column
    const lineInfo = getLineAndColumn(code, startIndex);

    // Build source location string
    let sourceLocation = `${filePath}:${lineInfo.line}`;
    if (opts.includeColumn) {
      sourceLocation += `:${lineInfo.column}`;
    }

    // Find position to insert attribute (after tag name)
    const tagNameEnd = startIndex + match[0].length;

    // Insert the data-source attribute
    const attribute = ` ${opts.attributeName}="${sourceLocation}"`;
    s.appendLeft(tagNameEnd, attribute);
    hasChanges = true;
  }

  if (!hasChanges) {
    return null;
  }

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true }),
  };
}

/**
 * Get ranges to skip (strings, template literals, comments)
 */
function getSkipRanges(code: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];

  // Match strings, template literals, and comments
  const patterns = [
    /"(?:[^"\\]|\\.)*"/g,           // Double-quoted strings
    /'(?:[^'\\]|\\.)*'/g,           // Single-quoted strings
    /`(?:[^`\\]|\\.)*`/g,           // Template literals (simplified)
    /\/\/[^\n]*/g,                   // Single-line comments
    /\/\*[\s\S]*?\*\//g,            // Multi-line comments
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }

  return ranges;
}

/**
 * Check if index is within any skip range
 */
function isInSkipRange(index: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => index >= start && index < end);
}

/**
 * Find the end of a JSX tag (> or />)
 */
function findTagEnd(code: string, startIndex: number): number {
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = startIndex; i < code.length; i++) {
    const char = code[i];
    const prevChar = code[i - 1];

    // Handle string literals in attributes
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      continue;
    }

    if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      continue;
    }

    if (inString) continue;

    // Handle nested JSX (for expressions like {<Component />})
    if (char === '{') {
      depth++;
      continue;
    }

    if (char === '}') {
      depth--;
      continue;
    }

    if (depth > 0) continue;

    // Found end of tag
    if (char === '>') {
      return i + 1;
    }
  }

  return -1;
}

/**
 * Get line and column number for a position in code
 */
function getLineAndColumn(code: string, index: number): { line: number; column: number } {
  const lines = code.slice(0, index).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export default vitePluginReactSourceMap;
